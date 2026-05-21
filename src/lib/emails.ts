import { resend } from "./resend";
import type { CartItem } from "@/types";

const FROM = process.env.EMAIL_FROM ?? process.env.RESEND_FROM ?? "pedidos@sonaq.com.ar";
const NOTIFY_EMAIL = process.env.SONAQ_NOTIFY_EMAIL ?? "ventas@sonaq.com.ar";
const DRY_RUN = process.env.EMAIL_DRY_RUN === "true";

function redactEmail(addr: string | string[] | undefined): string {
  const redact = (s: string) => s.replace(/(?<=.{2}).(?=.*@)/g, "*");
  if (Array.isArray(addr)) return addr.map(redact).join(", ");
  return addr ? redact(addr) : "[none]";
}

async function sendEmail(payload: Parameters<typeof resend.emails.send>[0]) {
  if (DRY_RUN) {
    const htmlLen = typeof payload.html === "string" ? payload.html.length : 0;
    console.log("[EMAIL DRY RUN]", JSON.stringify({
      to: redactEmail(payload.to as string | string[]),
      from: "[redacted]",
      subject: "[redacted]",
      html: `[redacted — ${htmlLen} chars]`,
    }, null, 2));
    return { data: { id: `dry-run-${Date.now()}` }, error: null };
  }
  return resend.emails.send(payload);
}

const TERRACOTA = "#b8521a";
const DARK = "#1a0f00";
const MUTED = "#5a4535";
const BG = "#ede5d8";
const BORDER = "#d4c4ae";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function itemsTable(items: CartItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid ${BORDER};color:${DARK};font-size:13px;">
          ${escapeHtml(item.title)}${item.color ? ` <span style="color:${MUTED}">(${escapeHtml(item.color)})</span>` : ""}
          ${item.addons?.length ? `<br><span style="color:${MUTED};font-size:11px;">${item.addons.map((a) => `+ ${escapeHtml(a.title)}`).join(", ")}</span>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${BORDER};color:${DARK};font-size:13px;text-align:right;">$${(item.price * item.quantity).toLocaleString("es-AR")}</td>
      </tr>`
    )
    .join("");
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border:1px solid ${BORDER};">
        <tr>
          <td style="background:${DARK};padding:24px 32px;">
            <p style="margin:0;color:#f5f0e8;font-size:22px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;">SONAQ</p>
          </td>
        </tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr>
          <td style="background:${BG};padding:16px 32px;border-top:1px solid ${BORDER};">
            <p style="margin:0;font-size:11px;color:${MUTED};text-align:center;">
              Sonaq · Córdoba, Argentina ·
              <a href="https://wa.me/5493512881616" style="color:${TERRACOTA};">+54 9 351 288-1616</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationToCustomer({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  notes,
  paymentMethod,
  items,
  total,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: { address: string; city: string; province: string };
  notes?: string;
  paymentMethod: "BANK_TRANSFER" | "MERCADOPAGO";
  items: CartItem[];
  total: number;
}) {
  // Datos bancarios desde env vars — fallback si alguna no está configurada
  const bankTitular = process.env.BANK_TITULAR || null;
  const bankCbu     = process.env.BANK_CBU     || null;
  const bankAlias   = process.env.BANK_ALIAS   || null;
  const bankBanco   = process.env.BANK_BANCO   || null;
  const bankCuit    = process.env.BANK_CUIT    || null;
  const hasBankData = bankTitular && bankCbu && bankAlias && bankBanco;

  const paymentBlock =
    paymentMethod === "BANK_TRANSFER"
      ? `<div style="margin-top:24px;border:1px solid ${BORDER};">
          <div style="padding:14px 16px;background:${TERRACOTA};">
            <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#f5f0e8;">
              Datos para realizar la transferencia
            </p>
          </div>
          <div style="padding:16px;background:${BG};">
            ${hasBankData ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;width:40%;">Titular</td>
                <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;">${escapeHtml(bankTitular!)}</td>
              </tr>
              <tr>
                <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Banco</td>
                <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(bankBanco!)}</td>
              </tr>
              <tr>
                <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">CBU</td>
                <td style="font-size:13px;font-family:monospace;font-weight:700;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};letter-spacing:0.05em;">${escapeHtml(bankCbu!)}</td>
              </tr>
              <tr>
                <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Alias</td>
                <td style="font-size:13px;font-family:monospace;font-weight:700;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};letter-spacing:0.05em;">${escapeHtml(bankAlias!)}</td>
              </tr>
              ${bankCuit ? `<tr>
                <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">CUIT</td>
                <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(bankCuit)}</td>
              </tr>` : ""}
              <tr>
                <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:2px solid ${BORDER};">Monto a transferir</td>
                <td style="font-size:16px;font-weight:900;color:${TERRACOTA};padding:6px 0 2px;text-align:right;border-top:2px solid ${BORDER};">$${total.toLocaleString("es-AR")}</td>
              </tr>
            </table>
            ` : `
            <p style="margin:0 0 16px;font-size:13px;color:${MUTED};">
              Contactanos para recibir los datos bancarios:
              <a href="mailto:${escapeHtml(NOTIFY_EMAIL)}" style="color:${TERRACOTA};">${escapeHtml(NOTIFY_EMAIL)}</a>
            </p>
            `}
            <div style="border-top:1px solid ${BORDER};padding-top:14px;">
              <p style="margin:0 0 6px;font-size:13px;color:${DARK};">
                <strong>① Transferí el monto total</strong> a la cuenta indicada arriba.
              </p>
              <p style="margin:0 0 6px;font-size:13px;color:${DARK};">
                <strong>② Enviá el comprobante</strong> a
                <a href="mailto:${escapeHtml(NOTIFY_EMAIL)}" style="color:${TERRACOTA};">${escapeHtml(NOTIFY_EMAIL)}</a>
                indicando tu número de pedido <strong style="font-family:monospace;">#${escapeHtml(orderId.slice(-8).toUpperCase())}</strong>.
              </p>
              <p style="margin:0 0 14px;font-size:13px;color:${DARK};">
                <strong>③ Una vez confirmado el pago</strong>, tu pedido entra en producción.
              </p>
              <p style="margin:0;font-size:11px;color:${MUTED};border-top:1px solid ${BORDER};padding-top:10px;">
                ⚠️ Tenés <strong>48 horas hábiles</strong> para realizar la transferencia. Pasado ese plazo el pedido puede cancelarse.
              </p>
            </div>
          </div>
        </div>`
      : `<div style="margin-top:24px;padding:16px;background:${BG};border:1px solid ${BORDER};">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${TERRACOTA};">Pago con MercadoPago</p>
          <p style="margin:0;font-size:13px;color:${MUTED};">
            Tu pago fue procesado por MercadoPago. Recibirás una confirmación por email cuando se acredite. Ante cualquier duda escribinos por
            <a href="https://wa.me/5493512881616" style="color:${TERRACOTA};">WhatsApp al +54 9 351 288-1616</a>.
          </p>
        </div>`;

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${TERRACOTA};">Pedido confirmado</p>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;text-transform:uppercase;color:${DARK};">¡Gracias, ${escapeHtml(customerName)}!</h1>
    <p style="margin:0 0 24px;font-size:13px;color:${MUTED};">Tu pedido fue recibido. Número de orden: <strong style="font-family:monospace;">${escapeHtml(orderId)}</strong></p>

    <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};">Datos de envío</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;">Nombre</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;">${escapeHtml(customerName)}</td>
      </tr>
      <tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Email</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(customerEmail)}</td>
      </tr>
      ${customerPhone ? `<tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Teléfono</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(customerPhone)}</td>
      </tr>` : ""}
      <tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Dirección</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(shippingAddress.address)}, ${escapeHtml(shippingAddress.city)}, ${escapeHtml(shippingAddress.province)}</td>
      </tr>
      ${notes ? `<tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Notas</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(notes)}</td>
      </tr>` : ""}
    </table>

    <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};">Detalle del pedido</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding-bottom:8px;border-bottom:2px solid ${BORDER};">Producto</th>
          <th style="text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding-bottom:8px;border-bottom:2px solid ${BORDER};">Cant.</th>
          <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding-bottom:8px;border-bottom:2px solid ${BORDER};">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsTable(items)}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding-top:12px;font-size:14px;font-weight:700;color:${MUTED};">Total</td>
          <td style="padding-top:12px;font-size:14px;font-weight:900;color:${DARK};text-align:right;">$${total.toLocaleString("es-AR")}</td>
        </tr>
      </tfoot>
    </table>

    ${paymentBlock}

    <p style="margin-top:24px;font-size:12px;color:${MUTED};">
      ¿Tenés alguna consulta? Escribinos por
      <a href="https://wa.me/5493512881616" style="color:${TERRACOTA};">WhatsApp</a>.
    </p>

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid ${BORDER};">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${DARK};">Jose Nallib Saleme</p>
      <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6;">
        Dir.: 12 de octubre 486 · Malagueño, Córdoba<br>
        <a href="mailto:${escapeHtml(NOTIFY_EMAIL)}" style="color:${TERRACOTA};">${escapeHtml(NOTIFY_EMAIL)}</a>
      </p>
    </div>
  `);

  return sendEmail({
    from: `Sonaq <${FROM}>`,
    to: customerEmail,
    subject: `Pedido recibido #${orderId.slice(-8).toUpperCase()}`,
    html,
  });
}

export async function sendNewOrderNotificationToTeam({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  notes,
  paymentMethod,
  items,
  total,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: { address: string; city: string; province: string };
  notes?: string;
  paymentMethod: "BANK_TRANSFER" | "MERCADOPAGO";
  items: CartItem[];
  total: number;
}) {
  const metodoPago =
    paymentMethod === "BANK_TRANSFER" ? "Transferencia bancaria" : "MercadoPago";

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${TERRACOTA};">Nueva venta</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:900;text-transform:uppercase;color:${DARK};">Nuevo pedido recibido</h1>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;">Número de orden</td>
        <td style="font-size:12px;font-family:monospace;color:${DARK};padding:6px 0 2px;text-align:right;">${escapeHtml(orderId)}</td>
      </tr>
      <tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Cliente</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(customerName)}</td>
      </tr>
      <tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Email</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">
          <a href="mailto:${escapeHtml(customerEmail)}" style="color:${TERRACOTA};">${escapeHtml(customerEmail)}</a>
        </td>
      </tr>
      ${customerPhone ? `<tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Teléfono</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">
          <a href="https://wa.me/${customerPhone.replace(/\D/g, "")}" style="color:${TERRACOTA};">${escapeHtml(customerPhone)}</a>
        </td>
      </tr>` : ""}
      <tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Dirección</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(shippingAddress.address)}, ${escapeHtml(shippingAddress.city)}, ${escapeHtml(shippingAddress.province)}</td>
      </tr>
      <tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Pago</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${metodoPago}</td>
      </tr>
      ${notes ? `<tr>
        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding:6px 0 2px;border-top:1px solid ${BORDER};">Notas del cliente</td>
        <td style="font-size:13px;color:${DARK};padding:6px 0 2px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(notes)}</td>
      </tr>` : ""}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding-bottom:8px;border-bottom:2px solid ${BORDER};">Producto</th>
          <th style="text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding-bottom:8px;border-bottom:2px solid ${BORDER};">Cant.</th>
          <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};padding-bottom:8px;border-bottom:2px solid ${BORDER};">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsTable(items)}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding-top:12px;font-size:14px;font-weight:700;color:${MUTED};">Total</td>
          <td style="padding-top:12px;font-size:18px;font-weight:900;color:${TERRACOTA};text-align:right;">$${total.toLocaleString("es-AR")}</td>
        </tr>
      </tfoot>
    </table>
  `);

  return sendEmail({
    from: `Sonaq <${FROM}>`,
    to: NOTIFY_EMAIL,
    subject: `🛒 Nuevo pedido — ${customerName} · $${total.toLocaleString("es-AR")}`,
    html,
  });
}
