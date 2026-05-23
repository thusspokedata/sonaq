"use server";

import { z } from "zod";
import { randomUUID } from "node:crypto";
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

const itemSchema = z.object({
  // CartItem.cartItemId / .slug existen para el cliente; el server no los
  // persiste pero el tipo los requiere — usamos defaults vacíos para evitar
  // que el spread los deje en undefined sin agregar lógica condicional.
  cartItemId: z.string().max(200).default(""),
  productId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(50),
  title: z.string().min(1).max(200),
  image: z
    .string()
    .url()
    .max(2048)
    .refine((u) => /^https?:\/\//i.test(u), { message: "Esquema de URL no permitido" })
    .optional(),
  color: z.string().max(100).optional(),
  slug: z.string().max(200).default(""),
  addons: z
    .array(
      z.object({
        _key: z.string().min(1).max(100),
        title: z.string().max(200),
        price: z.number(),
      })
    )
    .max(20)
    .default([]),
});

const itemsArraySchema = z.array(itemSchema).min(1).max(20);

export type CheckoutFormState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string[]> }
  | { status: "success"; orderId: string }
  | { status: "mp_redirect"; initPoint: string };

export async function createOrder(
  items: CartItem[],
  formValues: Record<string, string>
): Promise<CheckoutFormState> {
  // Extraemos IP y UA temprano para poder loggear contexto del honeypot
  // sin filtrar PII (nombre/email/teléfono/dirección quedan fuera del log).
  // X-Real-IP lo setea Nginx con $remote_addr (no spoofable); fallback al
  // último elemento de X-Forwarded-For (el que Nginx anexa). El primer
  // elemento de XFF sí es controlable por el cliente.
  const headersList = await headers();
  const xff = headersList.get("x-forwarded-for");
  const ip =
    headersList.get("x-real-ip")?.trim() ||
    xff?.split(",").pop()?.trim() ||
    "unknown";
  const userAgent = headersList.get("user-agent")?.slice(0, 200) ?? "unknown";

  // Honeypot: si un bot rellenó el campo oculto, devolvemos un success falso
  // sin crear orden ni mandar emails. El bot no sabe que fue detectado.
  // Loggeamos sin PII para detectar autofills agresivos vs bots reales.
  const honeypot = formValues.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    console.warn(
      `[checkout] honeypot triggered at ${new Date().toISOString()} ip=${ip} ua="${userAgent}"`
    );
    return { status: "success", orderId: randomUUID() };
  }

  if (!items.length) {
    return { status: "error", errors: { _: ["El carrito está vacío"] } };
  }

  // Validación de forma de los items ANTES de cualquier cálculo o persistencia.
  // El re-fetch de precios desde Sanity (más abajo) sigue siendo la fuente de
  // verdad para los valores; este check solo cierra forma y rangos.
  const itemsParsed = itemsArraySchema.safeParse(items);
  if (!itemsParsed.success) {
    return { status: "error", errors: { _: ["Carrito inválido"] } };
  }
  const safeItems = itemsParsed.data;

  // Rate limit: 5 órdenes por IP por hora.
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
  const productIds = [...new Set(safeItems.map((i) => i.productId))];
  let sanityPrices: { _id: string; price: number; addons?: { _key: string; title: string; price: number }[]; colorCatalogs?: { _key: string; brand: string; priceExtra: number }[] }[] = [];
  try {
    sanityPrices = await sanityClient.fetch(PRODUCTS_PRICE_QUERY, { ids: productIds });
  } catch (err) {
    console.error("[checkout] Error fetching product prices from Sanity:", err instanceof Error ? err.message : err);
    return { status: "error", errors: { _: ["No se pudo verificar los precios. Intentá de nuevo."] } };
  }
  const priceMap = new Map(sanityPrices.map((p) => [p._id, p]));

  const validatedItems: CartItem[] = [];
  for (const item of safeItems) {
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

  // Para MERCADOPAGO los emails se mandan desde el webhook cuando el pago
  // es confirmado (status approved). Para BANK_TRANSFER se mandan ahora
  // porque el cliente necesita los datos bancarios de inmediato.
  if (paymentMethod === "BANK_TRANSFER") {
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
  }

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
