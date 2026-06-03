/**
 * Blinda la verificación HMAC-SHA256 de webhooks de MercadoPago.
 *
 * MP firma cada webhook con `id=<data.id>&request-id=<x-request-id>&ts=<ts>`
 * usando HMAC-SHA256 con el secret MP_WEBHOOK_SECRET. Si fallara la
 * verificación, un atacante podría forzar transiciones de orden a PAID sin
 * haber pagado.
 *
 * NOTA — hallazgo B1 conocido: crypto.timingSafeEqual lanza RangeError si
 * los buffers tienen longitud distinta. El fix de B1 va en otro branch.
 * Hay un test que documenta el comportamiento actual (throws) y un .todo
 * que documenta el comportamiento esperado tras el fix.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "node:crypto";
import {
  verifySignature,
  type HeadersLike,
} from "../../src/app/api/webhooks/mercadopago/verify-signature";

const SECRET = "test-secret-do-not-use-in-prod";

function makeHeaders(map: Record<string, string>): HeadersLike {
  return {
    get(name: string): string | null {
      return map[name.toLowerCase()] ?? null;
    },
  };
}

function signed(dataId: string, requestId: string, ts: string, secret = SECRET): string {
  const manifest = `id=${dataId}&request-id=${requestId}&ts=${ts}`;
  return crypto.createHmac("sha256", secret).update(manifest).digest("hex");
}

const originalSecret = process.env.MP_WEBHOOK_SECRET;

describe("Webhook MP — verifySignature", () => {
  beforeEach(() => {
    process.env.MP_WEBHOOK_SECRET = SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.MP_WEBHOOK_SECRET;
    else process.env.MP_WEBHOOK_SECRET = originalSecret;
  });

  // ---- Comportamientos de aceptación / rechazo correctos ----

  it("accepts a valid signature with matching manifest", () => {
    const ts = "1700000000";
    const requestId = "req-abc-123";
    const dataId = "pay-999";
    const v1 = signed(dataId, requestId, ts);
    const headers = makeHeaders({
      "x-signature": `ts=${ts},v1=${v1}`,
      "x-request-id": requestId,
    });
    expect(verifySignature(headers, { data: { id: dataId } })).toBe(true);
  });

  it("rejects a signature signed with a different secret", () => {
    const ts = "1700000000";
    const requestId = "req-abc-123";
    const dataId = "pay-999";
    const v1 = signed(dataId, requestId, ts, "wrong-secret-same-length-as-real");
    const headers = makeHeaders({
      "x-signature": `ts=${ts},v1=${v1}`,
      "x-request-id": requestId,
    });
    expect(verifySignature(headers, { data: { id: dataId } })).toBe(false);
  });

  it("rejects when the signed dataId differs from the body dataId (forgery attempt)", () => {
    const ts = "1700000000";
    const requestId = "req-abc-123";
    const v1ForSomeOtherPayment = signed("pay-FORGED", requestId, ts);
    const headers = makeHeaders({
      "x-signature": `ts=${ts},v1=${v1ForSomeOtherPayment}`,
      "x-request-id": requestId,
    });
    expect(verifySignature(headers, { data: { id: "pay-real" } })).toBe(false);
  });

  // ---- Fail-closed en condiciones adversas ----

  it("rejects when MP_WEBHOOK_SECRET is not configured (fail-closed)", () => {
    delete process.env.MP_WEBHOOK_SECRET;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const headers = makeHeaders({
      "x-signature": "ts=1700000000,v1=" + "a".repeat(64),
      "x-request-id": "req",
    });
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("MP_WEBHOOK_SECRET no configurado")
    );
    errorSpy.mockRestore();
  });

  it("rejects when x-signature header is absent", () => {
    const headers = makeHeaders({ "x-request-id": "req" });
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  it("rejects when x-request-id header is absent", () => {
    const ts = "1700000000";
    const v1 = signed("p", "req", ts);
    const headers = makeHeaders({ "x-signature": `ts=${ts},v1=${v1}` });
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  it("rejects when x-signature is missing the ts component", () => {
    const v1 = "a".repeat(64);
    const headers = makeHeaders({
      "x-signature": `v1=${v1}`,
      "x-request-id": "req",
    });
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  it("rejects when x-signature is missing the v1 component", () => {
    const headers = makeHeaders({
      "x-signature": "ts=1700000000",
      "x-request-id": "req",
    });
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  it("rejects when v1 length matches but content is wrong", () => {
    // 64 chars hex pero no es el HMAC correcto — debe rechazar sin throw
    const headers = makeHeaders({
      "x-signature": `ts=1700000000,v1=${"0".repeat(64)}`,
      "x-request-id": "req",
    });
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  // ---------------------------------------------------------------------
  // Hallazgo B1 de la auditoría de seguridad — pendiente de fix
  // ---------------------------------------------------------------------
  // PROBLEMA: crypto.timingSafeEqual lanza RangeError sincrónico cuando los
  // dos Buffers tienen longitud distinta. verifySignature no lo atrapa, así
  // que el route handler del webhook responde HTTP 500 en vez de 200 con
  // false. Impacto bajo (MP retira webhooks fallidos tras N reintentos),
  // pero rompe robustez y deja un canal de probe.
  //
  // FIX: vive en el Branch 2 (B1/B2/B3/B4 — webhook hardening). Cuando se
  // implemente, este bloque debe actualizarse así:
  //   1. Borrar los dos `it("CURRENT behavior ...")` de abajo — van a
  //      empezar a fallar porque verifySignature ya NO va a tirar.
  //      Ese fallo es la señal de que B1 quedó cerrado.
  //   2. Convertir el `it.todo` de abajo en un `it` real con el cuerpo:
  //        expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  //      (para los dos casos: v1 más corto y v1 más largo que 64 chars hex)
  //
  // Ref: reporte de auditoría 2026-05-23, finding B1
  // ("crypto.timingSafeEqual puede tirar RangeError con v1 malformado").
  // ---------------------------------------------------------------------

  it("CURRENT behavior (B1, to fix in Branch 2): throws RangeError on v1 shorter than expected", () => {
    const headers = makeHeaders({
      "x-signature": "ts=1700000000,v1=abc",
      "x-request-id": "req",
    });
    expect(() => verifySignature(headers, { data: { id: "p" } })).toThrow(RangeError);
  });

  it("CURRENT behavior (B1, to fix in Branch 2): throws RangeError on v1 longer than expected", () => {
    const headers = makeHeaders({
      "x-signature": `ts=1700000000,v1=${"a".repeat(128)}`,
      "x-request-id": "req",
    });
    expect(() => verifySignature(headers, { data: { id: "p" } })).toThrow(RangeError);
  });

  // TODO(B1): cuando el Branch 2 (webhook hardening) cierre el hallazgo B1
  // del reporte de auditoría, los dos tests de "CURRENT behavior" de arriba
  // van a romperse — ahí es cuando este `todo` se convierte en un `it` real
  // con `expect(verifySignature(...)).toBe(false)`. NO borrar ni este todo
  // ni los CURRENT mientras B1 siga abierto: son el ancla viva del hallazgo.
  it.todo("EXPECTED after B1 fix (Branch 2): returns false on v1 of unexpected length without throwing");
});
