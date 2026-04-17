import { OrderStatus } from "@prisma/client";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PAYMENT_PENDING: "Pago pendiente",
  PAID: "Pagado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const STATUS_COLOR: Record<OrderStatus, { backgroundColor: string; color: string }> = {
  PENDING:         { backgroundColor: "#f5f0e8", color: "#5a4535" },
  PAYMENT_PENDING: { backgroundColor: "#fef3c7", color: "#92400e" },
  PAID:            { backgroundColor: "#dcfce7", color: "#166534" },
  PROCESSING:      { backgroundColor: "#dbeafe", color: "#1e40af" },
  SHIPPED:         { backgroundColor: "#ede9fe", color: "#5b21b6" },
  DELIVERED:       { backgroundColor: "#d1fae5", color: "#065f46" },
  CANCELLED:       { backgroundColor: "#fee2e2", color: "#991b1b" },
};

export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:         ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["PAID", "CANCELLED"],
  PAID:            ["PROCESSING", "CANCELLED"],
  PROCESSING:      ["SHIPPED", "CANCELLED"],
  SHIPPED:         ["DELIVERED"],
  DELIVERED:       [],
  CANCELLED:       [],
};

export function formatPrice(value: number | string | { toNumber(): number }) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
