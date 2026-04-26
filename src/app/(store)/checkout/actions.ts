"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CartItem } from "@/types";

const checkoutSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(80),
  province: z.string().min(2).max(80),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(["BANK_TRANSFER"] as const),
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

  let order: { id: string };
  try {
    order = await prisma.order.create({
      data: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: { address, city, province },
        notes,
        paymentMethod,
        total,
        status: "PAYMENT_PENDING",
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
  } catch (err) {
    console.error("Error al crear orden:", err instanceof Error ? err.message : err);
    return { status: "error", errors: { _: ["No se pudo crear el pedido. Intentá de nuevo."] } };
  }

  return { status: "success", orderId: order.id };
}
