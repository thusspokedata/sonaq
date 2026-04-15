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

export const STATUS_COLOR: Record<OrderStatus, { bg: string; text: string }> = {
  PENDING:         { bg: "#f5f0e8", text: "#5a4535" },
  PAYMENT_PENDING: { bg: "#fef3c7", text: "#92400e" },
  PAID:            { bg: "#dcfce7", text: "#166534" },
  PROCESSING:      { bg: "#dbeafe", text: "#1e40af" },
  SHIPPED:         { bg: "#ede9fe", text: "#5b21b6" },
  DELIVERED:       { bg: "#d1fae5", text: "#065f46" },
  CANCELLED:       { bg: "#fee2e2", text: "#991b1b" },
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

export function formatPrice(value: number | string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
