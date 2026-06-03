import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderNotificationToTeam,
} from "@/lib/emails";
import type { CartItem } from "@/types";
import { verifySignature } from "./verify-signature";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: NextRequest) {
  let body: { type?: string; data?: { id?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(null, { status: 200 });
  }

  if (!verifySignature(req.headers, body)) {
    return NextResponse.json(null, { status: 200 });
  }

  if (body.type !== "payment" || !body.data?.id) {
    return NextResponse.json(null, { status: 200 });
  }

  try {
    const payment = new Payment(client);
    const result = await payment.get({ id: body.data.id });

    const orderId = result.external_reference;
    if (!orderId) return NextResponse.json(null, { status: 200 });

    const orderExists = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!orderExists) return NextResponse.json(null, { status: 200 });

    let newStatus: "PAID" | "PAYMENT_PENDING" | "CANCELLED" | null = null;
    if (result.status === "approved") {
      newStatus = "PAID";
    } else if (result.status === "pending" || result.status === "in_process") {
      newStatus = "PAYMENT_PENDING";
    } else if (result.status === "rejected" || result.status === "cancelled") {
      newStatus = "CANCELLED";
    }

    // Update atómico: solo actualiza si el status actual no es ya PAID.
    // updateMany devuelve count=1 si efectivamente cambió, 0 si ya estaba PAID.
    // Esto evita race conditions entre webhooks duplicados de MP.
    let transitionedToPaid = false;
    if (newStatus === "PAID") {
      const updated = await prisma.order.updateMany({
        where: { id: orderId, status: { not: "PAID" } },
        data: { status: "PAID" },
      });
      transitionedToPaid = updated.count === 1;
    } else if (newStatus) {
      await prisma.order.update({ where: { id: orderId }, data: { status: newStatus } });
    }

    // Mandar emails solo si fuimos nosotros quienes hicimos la transición a PAID
    if (transitionedToPaid) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) return NextResponse.json(null, { status: 200 });
      const shippingAddress = order.shippingAddress as { address: string; city: string; province: string } | null;
      const cartItems: CartItem[] = order.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        basePrice: Number(item.basePrice),
        price: Number(item.price),
        quantity: item.quantity,
        color: item.color ?? undefined,
        image: item.image ?? undefined,
        addons: Array.isArray(item.addons) ? (item.addons as { _key: string; title: string; price: number }[]) : [],
        cartItemId: item.id,
        slug: "",
      }));

      void Promise.allSettled([
        sendOrderConfirmationToCustomer({
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone ?? undefined,
          shippingAddress: shippingAddress ?? { address: "", city: "", province: "" },
          notes: order.notes ?? undefined,
          paymentMethod: "MERCADOPAGO",
          items: cartItems,
          total: Number(order.total),
        }),
        sendNewOrderNotificationToTeam({
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone ?? undefined,
          shippingAddress: shippingAddress ?? { address: "", city: "", province: "" },
          notes: order.notes ?? undefined,
          paymentMethod: "MERCADOPAGO",
          items: cartItems,
          total: Number(order.total),
        }),
      ]).then((results) => {
        results.forEach((r, i) => {
          if (r.status === "rejected") {
            console.error(`[MP webhook] Email ${i === 0 ? "cliente" : "equipo"} falló para orden ${orderId}:`, r.reason instanceof Error ? r.reason.message : r.reason);
          }
        });
      });
    }
  } catch (err) {
    console.error("MP webhook error:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json(null, { status: 200 });
}
