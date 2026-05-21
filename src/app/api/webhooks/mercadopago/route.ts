import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

function verifySignature(req: NextRequest, body: { data?: { id?: string } }): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[MP webhook] MP_WEBHOOK_SECRET no configurado — request rechazado");
    return false;
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
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

export async function POST(req: NextRequest) {
  let body: { type?: string; data?: { id?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(null, { status: 200 });
  }

  if (!verifySignature(req, body)) {
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

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!order) return NextResponse.json(null, { status: 200 });

    let status: "PAID" | "PAYMENT_PENDING" | "CANCELLED" | null = null;
    if (result.status === "approved") {
      status = "PAID";
    } else if (result.status === "pending" || result.status === "in_process") {
      status = "PAYMENT_PENDING";
    } else if (result.status === "rejected" || result.status === "cancelled") {
      status = "CANCELLED";
    }

    if (status) {
      await prisma.order.update({ where: { id: orderId }, data: { status } });
    }
  } catch (err) {
    console.error("MP webhook error:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json(null, { status: 200 });
}
