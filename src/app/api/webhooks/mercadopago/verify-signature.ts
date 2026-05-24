/**
 * Verificación HMAC-SHA256 de webhooks de MercadoPago.
 *
 * Separada del route handler para poder testearla sin Next runtime. El
 * comportamiento es EXACTAMENTE el mismo que tenía inline en route.ts; este
 * archivo solo extrajo la función para hacerla importable.
 *
 * Recibe un Headers-like object (con .get(name)) para que funcione tanto con
 * el Headers de Next como con objetos de test. El segundo argumento es el
 * payload parseado del body (necesitamos data.id para el manifest).
 *
 * NOTA: la auditoría reveló el hallazgo B1 — si v1 tiene longitud distinta
 * a la del HMAC esperado, crypto.timingSafeEqual lanza RangeError no
 * manejada. El fix de B1 va en otro branch (NO se toca acá). Los tests
 * documentan el comportamiento actual y el esperado.
 */
import crypto from "node:crypto";

export interface VerifySignatureBody {
  data?: { id?: string };
}

export interface HeadersLike {
  get(name: string): string | null;
}

export function verifySignature(headers: HeadersLike, body: VerifySignatureBody): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[MP webhook] MP_WEBHOOK_SECRET no configurado — request rechazado");
    return false;
  }

  const xSignature = headers.get("x-signature");
  const xRequestId = headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(xSignature.split(",").map((p) => p.split("=")));
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const dataId = body.data?.id ?? "";
  const manifest = `id=${dataId}&request-id=${xRequestId}&ts=${ts}`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}
