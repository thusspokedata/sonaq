"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { STATUS_TRANSITIONS, BACKWARD_TRANSITIONS } from "@/lib/order-utils";

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pedido no encontrado");

  const allowed = [
    ...STATUS_TRANSITIONS[order.status],
    ...BACKWARD_TRANSITIONS[order.status],
  ];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Transición no permitida: ${order.status} → ${newStatus}`);
  }

  const updated = await prisma.order.updateMany({
    where: { id: orderId, status: order.status },
    data: { status: newStatus },
  });
  if (updated.count === 0) {
    throw new Error("El estado cambió concurrentemente. Reintentá la operación.");
  }

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
}
