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

function signatureHeaders(ts: string, v1: string, requestId = "req-abc-123"): HeadersLike {
  return makeHeaders({
    "x-signature": `ts=${ts},v1=${v1}`,
    "x-request-id": requestId,
  });
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

  it("accepts a valid signature with matching manifest", () => {
    const ts = "1700000000";
    const requestId = "req-abc-123";
    const dataId = "pay-999";
    const v1 = signed(dataId, requestId, ts);

    expect(verifySignature(signatureHeaders(ts, v1, requestId), { data: { id: dataId } })).toBe(true);
  });

  it("accepts a valid uppercase hex signature", () => {
    const ts = "1700000000";
    const requestId = "req-abc-123";
    const dataId = "pay-999";
    const v1 = signed(dataId, requestId, ts).toUpperCase();

    expect(verifySignature(signatureHeaders(ts, v1, requestId), { data: { id: dataId } })).toBe(true);
  });

  it("accepts an old timestamp so notification retries remain valid", () => {
    const ts = "1";
    const requestId = "req-abc-123";
    const dataId = "pay-999";
    const v1 = signed(dataId, requestId, ts);

    expect(verifySignature(signatureHeaders(ts, v1, requestId), { data: { id: dataId } })).toBe(true);
  });

  it("rejects a signature signed with a different secret", () => {
    const ts = "1700000000";
    const requestId = "req-abc-123";
    const dataId = "pay-999";
    const v1 = signed(dataId, requestId, ts, "wrong-secret-same-length-as-real");

    expect(verifySignature(signatureHeaders(ts, v1, requestId), { data: { id: dataId } })).toBe(false);
  });

  it("rejects when the signed dataId differs from the body dataId", () => {
    const ts = "1700000000";
    const requestId = "req-abc-123";
    const v1 = signed("pay-other", requestId, ts);

    expect(verifySignature(signatureHeaders(ts, v1, requestId), { data: { id: "pay-real" } })).toBe(false);
  });

  it("rejects when MP_WEBHOOK_SECRET is not configured", () => {
    delete process.env.MP_WEBHOOK_SECRET;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const headers = signatureHeaders("1700000000", "a".repeat(64), "req");

    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("MP_WEBHOOK_SECRET no configurado")
    );
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
    const headers = makeHeaders({
      "x-signature": `v1=${"a".repeat(64)}`,
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

  it("rejects when v1 has valid length but wrong content", () => {
    const headers = signatureHeaders("1700000000", "0".repeat(64));
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  it("returns false when v1 is shorter than 64 hex characters", () => {
    const headers = signatureHeaders("1700000000", "abc");
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  it("returns false when v1 is longer than 64 hex characters", () => {
    const headers = signatureHeaders("1700000000", "a".repeat(128));
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  it("returns false when v1 contains non-hex characters", () => {
    const headers = signatureHeaders("1700000000", "g".repeat(64));
    expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
  });

  it.each(["not-a-number", "123abc", "1.5", "-1", "1e3", " 1700000000"])(
    "returns false when ts is not an unsigned integer: %s",
    (ts) => {
      const headers = signatureHeaders(ts, "a".repeat(64));
      expect(verifySignature(headers, { data: { id: "p" } })).toBe(false);
    }
  );
});
