"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CartItem } from "@/types";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderNotificationToTeam,
} from "@/lib/emails";
import { createMPPreference } from "@/lib/mercadopago";
import { BASE_URL } from "@/lib/base-url";
import { sanityClient } from "@/lib/sanity";
import { PRODUCTS_PRICE_QUERY } from "@/sanity/queries";

const checkoutSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(80),
  province: z.string().min(2).max(80),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(["MERCADOPAGO", "BANK_TRANSFER"]),
  acceptsTerms: z.literal(true, { message: "Debés aceptar los términos" }),
});

export type CheckoutFormState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string[]> }
  | { status: "success"; orderId: string }
  | { status: "mp_redirect"; initPoint: string };

export async function createOrder(
  items: CartItem[],
  formValues: Record<string, string>
): Promise<CheckoutFormState> {
  if (!items.length) {
    return { status: "error", errors: { _: ["El carrito está vacío"] } };
  }

  // Rate limit: 5 órdenes por IP por hora
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  if (process.env.RATE_LIMIT_DISABLED !== "true" && !checkRateLimit(`checkout:${ip}`, 5, 60 * 60 * 1000)) {
    return {
      status: "error",
      errors: { _: ["Demasiados intentos. Esperá un momento y volvé a intentarlo."] },
    };
  }

  const raw = {
    name: formValues.name,
    email: formValues.email,
    phone: formValues.phone || undefined,
    address: formValues.address,
    city: formValues.city,
    province: formValues.province,
    notes: formValues.notes || undefined,
    paymentMethod: formValues.paymentMethod,
    acceptsTerms: formValues.acceptsTerms === "on" ? true : undefined,
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, address, city, province, notes, paymentMethod } = parsed.data;

  // Revalidar precios contra Sanity — no confiar en los valores del cliente
  const productIds = [...new Set(items.map((i) => i.productId))];
  let sanityPrices: { _id: string; price: number; addons?: { _key: string; title: string; price: number }[]; colorCatalogs?: { _key: string; brand: string; priceExtra: number }[] }[] = [];
  try {
    sanityPrices = await sanityClient.fetch(PRODUCTS_PRICE_QUERY, { ids: productIds });
  } catch (err) {
    console.error("[checkout] Error fetching product prices from Sanity:", err instanceof Error ? err.message : err);
    return { status: "error", errors: { _: ["No se pudo verificar los precios. Intentá de nuevo."] } };
  }
  const priceMap = new Map(sanityPrices.map((p) => [p._id, p]));

  const validatedItems: CartItem[] = [];
  for (const item of items) {
    const sp = priceMap.get(item.productId);
    if (!sp) {
      return { status: "error", errors: { _: ["Uno de los productos no está disponible."] } };
    }
    // Construir addons exclusivamente desde Sanity: ningún campo del cliente persiste
    const validatedAddons = item.addons.flatMap((addon) => {
      const sa = sp.addons?.find((a) => a._key === addon._key);
      if (!sa) return [];
      return [{ _key: sa._key, title: sa.title, price: sa.price }];
    });
    const addonTotal = validatedAddons.reduce((sum, a) => sum + a.price, 0);
    let catalogExtra = 0;
    if (item.color?.includes(" — ")) {
      const brand = item.color.split(" — ")[0];
      const scc = sp.colorCatalogs?.find((c) => c.brand === brand);
      if (scc) catalogExtra = scc.priceExtra;
    }
    validatedItems.push({
      ...item,
      addons: validatedAddons,
      basePrice: sp.price,
      price: sp.price + addonTotal + catalogExtra,
    });
  }

  const total = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: { address, city, province },
      notes,
      paymentMethod,
      total,
      status: paymentMethod === "BANK_TRANSFER" ? "PAYMENT_PENDING" : "PENDING",
      items: {
        create: validatedItems.map((item) => ({
          productId: item.productId,
          title: item.title,
          basePrice: item.basePrice,
          price: item.price,
          quantity: item.quantity,
          color: item.color ?? null,
          image: item.image ?? null,
          addons: item.addons.length ? item.addons : undefined,
        })),
      },
    },
  });

  // Enviar emails en paralelo — no bloqueamos la orden si falla
  void Promise.allSettled([
    sendOrderConfirmationToCustomer({
      orderId: order.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: { address, city, province },
      notes,
      paymentMethod,
      items: validatedItems,
      total,
    }),
    sendNewOrderNotificationToTeam({
      orderId: order.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: { address, city, province },
      notes,
      paymentMethod,
      items: validatedItems,
      total,
    }),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`Email ${i === 0 ? "cliente" : "equipo"} falló para orden ${order.id}:`, r.reason instanceof Error ? r.reason.message : r.reason);
      }
    });
  });

  if (paymentMethod === "MERCADOPAGO") {
    let initPoint: string;
    try {
      initPoint = await createMPPreference({
        orderId: order.id,
        items: validatedItems.map((item) => ({
          id: item.productId,
          title: item.title,
          quantity: item.quantity,
          unit_price: Math.round(item.price),
        })),
        payerEmail: email,
        siteUrl: BASE_URL,
      });
    } catch (err) {
      console.error(`[checkout] Error creando preferencia MP para orden ${order.id}:`, err instanceof Error ? err.message : err);
      return {
        status: "error",
        errors: { _: ["No pudimos conectar con MercadoPago. Tu pedido fue guardado — contactanos por WhatsApp al +54 9 351 288-1616 para coordinar el pago."] },
      };
    }
    return { status: "mp_redirect", initPoint };
  }

  return { status: "success", orderId: order.id };
}
