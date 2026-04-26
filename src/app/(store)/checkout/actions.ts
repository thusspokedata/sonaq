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
  | { status: "success"; orderId: string };

export async function createOrder(
  items: CartItem[],
  formData: FormData
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
  if (!checkRateLimit(`checkout:${ip}`, 5, 60 * 60 * 1000)) {
    return {
      status: "error",
      errors: { _: ["Demasiados intentos. Esperá un momento y volvé a intentarlo."] },
    };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address"),
    city: formData.get("city"),
    province: formData.get("province"),
    notes: formData.get("notes") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    acceptsTerms: formData.get("acceptsTerms") === "on" ? true : undefined,
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, address, city, province, notes, paymentMethod } = parsed.data;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        create: items.map((item) => ({
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
      paymentMethod,
      items,
      total,
    }),
    sendNewOrderNotificationToTeam({
      orderId: order.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: { address, city, province },
      paymentMethod,
      items,
      total,
    }),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`Email ${i === 0 ? "cliente" : "equipo"} falló para orden ${order.id}:`, r.reason instanceof Error ? r.reason.message : r.reason);
      }
    });
  });

  return { status: "success", orderId: order.id };
}
