import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderNotificationToTeam,
} from "@/lib/emails";
import { webhookTransition } from "@/lib/order-utils";
import type { CartItem } from "@/types";
import { verifySignature } from "./verify-signature";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  if ("status" in error && typeof error.status === "number") return error.status;
  if ("statusCode" in error && typeof error.statusCode === "number") return error.statusCode;
  return undefined;
}

export async function POST(req: NextRequest) {
  let body: { type?: string; data?: { id?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    if (!verifySignature(req.headers, body)) {
      return NextResponse.json(null, { status: 200 });
    }

    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json(null, { status: 200 });
    }

    const payment = new Payment(client);
    const result = await payment.get({ id: body.data.id });
    const paymentId = String(result.id);

    const orderId = result.external_reference;
    if (!orderId) return NextResponse.json(null, { status: 200 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, total: true, mpPaymentId: true },
    });
    if (!order) return NextResponse.json(null, { status: 200 });

    const transition = webhookTransition(order.status, result.status);
    if (!transition) {
      if (result.status === "refunded" || result.status === "charged_back") {
        console.error("[MP webhook] ALERTA Transición de pago anómala", {
          orderId,
          paymentId,
          currentStatus: order.status,
          mpStatus: result.status,
        });
      }
      return NextResponse.json(null, { status: 200 });
    }

    if (transition.to === "PAID") {
      const paymentAmountCents = Math.round(Number(result.transaction_amount) * 100);
      const orderTotalCents = Math.round(Number(order.total) * 100);
      if (result.currency_id !== "ARS" || paymentAmountCents !== orderTotalCents) {
        console.error("[MP webhook] ALERTA El pago no coincide con el total de la orden", {
          orderId,
          paymentId,
          transactionAmount: result.transaction_amount,
          currency: result.currency_id,
        });
        return NextResponse.json(null, { status: 200 });
      }

      if (order.mpPaymentId && order.mpPaymentId !== paymentId) {
        console.error("[MP webhook] ALERTA La orden ya tiene otro pago asociado", {
          orderId,
          paymentId,
          currentPaymentId: order.mpPaymentId,
        });
        return NextResponse.json(null, { status: 200 });
      }
    }

    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: { in: transition.from } },
      data: {
        status: transition.to,
        ...(transition.to === "PAID" ? { mpPaymentId: paymentId } : {}),
      },
    });

    if (updated.count === 1 && transition.to === "PAID") {
      if (order.status === "CANCELLED") {
        console.error("[MP webhook] ALERTA Pago aprobado sobre una orden cancelada", {
          orderId,
          paymentId,
        });
      }

      const paidOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!paidOrder) return NextResponse.json(null, { status: 200 });
      const shippingAddress = paidOrder.shippingAddress as { address: string; city: string; province: string } | null;
      const cartItems: CartItem[] = paidOrder.items.map((item) => ({
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
          orderId: paidOrder.id,
          customerName: paidOrder.customerName,
          customerEmail: paidOrder.customerEmail,
          customerPhone: paidOrder.customerPhone ?? undefined,
          shippingAddress: shippingAddress ?? { address: "", city: "", province: "" },
          notes: paidOrder.notes ?? undefined,
          paymentMethod: "MERCADOPAGO",
          items: cartItems,
          total: Number(paidOrder.total),
        }),
        sendNewOrderNotificationToTeam({
          orderId: paidOrder.id,
          customerName: paidOrder.customerName,
          customerEmail: paidOrder.customerEmail,
          customerPhone: paidOrder.customerPhone ?? undefined,
          shippingAddress: shippingAddress ?? { address: "", city: "", province: "" },
          notes: paidOrder.notes ?? undefined,
          paymentMethod: "MERCADOPAGO",
          items: cartItems,
          total: Number(paidOrder.total),
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
    if (hasErrorCode(err, "P2002")) {
      console.error("[MP webhook] Pago ya asociado a una orden:", err instanceof Error ? err.message : err);
      return NextResponse.json(null, { status: 200 });
    }
    if (getErrorStatus(err) === 404) {
      console.error("[MP webhook] Pago no encontrado en Mercado Pago:", err instanceof Error ? err.message : err);
      return NextResponse.json(null, { status: 200 });
    }
    console.error("MP webhook error:", err instanceof Error ? err.message : err);
    return NextResponse.json(null, { status: 500 });
  }

  return NextResponse.json(null, { status: 200 });
}
