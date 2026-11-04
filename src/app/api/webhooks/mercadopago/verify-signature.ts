/**
 * Verificación HMAC-SHA256 de webhooks de MercadoPago.
 *
 * Separada del route handler para poder testearla sin Next runtime. Recibe un
 * Headers-like object (con .get(name)) para que funcione tanto con los Headers
 * de Next como con objetos de test. El segundo argumento es el payload parseado
 * del body (necesitamos data.id para el manifest).
 *
 * No se aplica una ventana de tiempo: Mercado Pago documenta reintentos de una
 * misma notificación durante hasta 96 horas y no garantiza que cada reenvío
 * reciba una firma nueva. Una ventana podría rechazar reintentos válidos.
 * https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/payment-notifications
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
  if (!ts || !/^\d+$/.test(ts) || !v1 || !/^[0-9a-f]{64}$/i.test(v1)) return false;

  const dataId = body.data?.id ?? "";
  const manifest = `id=${dataId}&request-id=${xRequestId}&ts=${ts}`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const expectedBytes = Buffer.from(expected, "hex");
  const receivedBytes = Buffer.from(v1, "hex");

  return crypto.timingSafeEqual(expectedBytes, receivedBytes);
}
