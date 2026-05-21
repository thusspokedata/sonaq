import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function createMPPreference(params: {
  orderId: string;
  items: { id: string; title: string; quantity: number; unit_price: number }[];
  payerEmail: string;
  siteUrl: string;
}) {
  const preference = new Preference(client);
  const result = await preference.create({
    body: {
      items: params.items,
      payer: { email: params.payerEmail },
      back_urls: {
        success: `${params.siteUrl}/gracias?orden=${params.orderId}&mp=success`,
        failure: `${params.siteUrl}/gracias?orden=${params.orderId}&mp=failure`,
        pending: `${params.siteUrl}/gracias?orden=${params.orderId}&mp=pending`,
      },
      auto_return: 'approved',
      notification_url: `${params.siteUrl}/api/webhooks/mercadopago`,
      external_reference: params.orderId,
    },
  });
  const isTest = (process.env.MP_ACCESS_TOKEN ?? '').startsWith('TEST-');
  const initPoint = isTest ? result.sandbox_init_point : result.init_point;
  if (!initPoint) {
    throw new Error(
      `MercadoPago no devolvió una URL de pago (init_point=${result.init_point ?? "null"}, sandbox=${result.sandbox_init_point ?? "null"}). ` +
      `Verificar que la cuenta MP esté habilitada para cobros en producción.`
    );
  }
  return initPoint;
}
