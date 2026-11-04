import { describe, expect, it } from "vitest";
import type { OrderStatus } from "@prisma/client";
import { webhookTransition } from "../../src/lib/order-utils";

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const mpStatuses = [
  "approved",
  "pending",
  "in_process",
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
  "authorized",
  "in_mediation",
  "unknown",
];

const expectedTransitions: Record<
  string,
  Partial<Record<OrderStatus, { to: OrderStatus; from: OrderStatus[] }>>
> = {
  approved: {
    PENDING: { to: "PAID", from: ["PENDING", "PAYMENT_PENDING", "CANCELLED"] },
    PAYMENT_PENDING: { to: "PAID", from: ["PENDING", "PAYMENT_PENDING", "CANCELLED"] },
    CANCELLED: { to: "PAID", from: ["PENDING", "PAYMENT_PENDING", "CANCELLED"] },
  },
  pending: {
    PENDING: { to: "PAYMENT_PENDING", from: ["PENDING"] },
  },
  in_process: {
    PENDING: { to: "PAYMENT_PENDING", from: ["PENDING"] },
  },
  cancelled: {
    PENDING: { to: "CANCELLED", from: ["PENDING", "PAYMENT_PENDING"] },
    PAYMENT_PENDING: { to: "CANCELLED", from: ["PENDING", "PAYMENT_PENDING"] },
  },
};

const cases = mpStatuses.flatMap((mpStatus) =>
  orderStatuses.map((currentStatus) => ({ mpStatus, currentStatus }))
);

describe("webhookTransition", () => {
  it.each(cases)("$currentStatus + $mpStatus", ({ currentStatus, mpStatus }) => {
    expect(webhookTransition(currentStatus, mpStatus)).toEqual(
      expectedTransitions[mpStatus]?.[currentStatus] ?? null
    );
  });
});
