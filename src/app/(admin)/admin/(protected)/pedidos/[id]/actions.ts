"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { STATUS_TRANSITIONS } from "@/lib/order-utils";

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pedido no encontrado");

  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Transición inválida: ${order.status} → ${newStatus}`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
}
