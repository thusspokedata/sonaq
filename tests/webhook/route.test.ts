import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  paymentGet: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdateMany: vi.fn(),
  sendCustomerEmail: vi.fn(),
  sendTeamEmail: vi.fn(),
  verifySignature: vi.fn(),
}));

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(),
  Payment: vi.fn(function () {
    return { get: mocks.paymentGet };
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
      updateMany: mocks.orderUpdateMany,
    },
  },
}));

vi.mock("@/lib/emails", () => ({
  sendOrderConfirmationToCustomer: mocks.sendCustomerEmail,
  sendNewOrderNotificationToTeam: mocks.sendTeamEmail,
}));

vi.mock("../../src/app/api/webhooks/mercadopago/verify-signature", () => ({
  verifySignature: mocks.verifySignature,
}));

import { POST } from "../../src/app/api/webhooks/mercadopago/route";

const baseOrder = {
  id: "order-1",
  status: "PENDING",
  total: 100,
  mpPaymentId: null,
};

const paidOrder = {
  id: "order-1",
  customerName: "Juan Pérez",
  customerEmail: "juan@example.com",
  customerPhone: null,
  shippingAddress: null,
  notes: null,
  total: 100,
  items: [],
};

function makeRequest(body: unknown = { type: "payment", data: { id: "123" } }): NextRequest {
  return new NextRequest("https://test.example/api/webhooks/mercadopago", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Mercado Pago webhook route", () => {
  beforeEach(() => {
    mocks.verifySignature.mockReturnValue(true);
    mocks.paymentGet.mockResolvedValue({
      id: 123,
      external_reference: "order-1",
      status: "approved",
      currency_id: "ARS",
      transaction_amount: 100,
    });
    mocks.orderFindUnique.mockResolvedValue(baseOrder);
    mocks.orderUpdateMany.mockResolvedValue({ count: 0 });
    mocks.sendCustomerEmail.mockResolvedValue(undefined);
    mocks.sendTeamEmail.mockResolvedValue(undefined);
  });

  it("marks a matching approved payment as PAID and stores its id", async () => {
    mocks.orderUpdateMany.mockResolvedValue({ count: 1 });
    mocks.orderFindUnique
      .mockResolvedValueOnce(baseOrder)
      .mockResolvedValueOnce(paidOrder);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mocks.orderFindUnique).toHaveBeenNthCalledWith(1, {
      where: { id: "order-1" },
      select: { id: true, status: true, total: true, mpPaymentId: true },
    });
    expect(mocks.orderUpdateMany).toHaveBeenCalledWith({
      where: { id: "order-1", status: { in: ["PENDING", "PAYMENT_PENDING"] } },
      data: { status: "PAID", mpPaymentId: "123" },
    });
    expect(mocks.sendCustomerEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendTeamEmail).toHaveBeenCalledTimes(1);
  });

  it("does not send emails when the PAID transition was already applied", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mocks.orderFindUnique).toHaveBeenCalledTimes(1);
    expect(mocks.sendCustomerEmail).not.toHaveBeenCalled();
    expect(mocks.sendTeamEmail).not.toHaveBeenCalled();
  });

  it.each([
    { currency_id: "ARS", transaction_amount: 99.99 },
    { currency_id: "USD", transaction_amount: 100 },
  ])("ignores a payment that does not match the order: %o", async (payment) => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.paymentGet.mockResolvedValue({
      id: 123,
      external_reference: "order-1",
      status: "approved",
      ...payment,
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mocks.orderUpdateMany).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[MP webhook] ALERTA"),
      expect.objectContaining({
        orderId: "order-1",
        paymentId: "123",
        transactionAmount: payment.transaction_amount,
        currency: payment.currency_id,
      })
    );
  });

  it("does not replace a different payment id already associated with the order", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.orderFindUnique.mockResolvedValue({ ...baseOrder, mpPaymentId: "other-payment" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mocks.orderUpdateMany).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[MP webhook] ALERTA"),
      expect.objectContaining({ orderId: "order-1", paymentId: "123" })
    );
  });

  it("uses forward-only conditions for a pending transition", async () => {
    mocks.paymentGet.mockResolvedValue({
      id: 123,
      external_reference: "order-1",
      status: "pending",
    });
    mocks.orderUpdateMany.mockResolvedValue({ count: 1 });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mocks.orderUpdateMany).toHaveBeenCalledWith({
      where: { id: "order-1", status: { in: ["PENDING"] } },
      data: { status: "PAYMENT_PENDING" },
    });
    expect(mocks.sendCustomerEmail).not.toHaveBeenCalled();
  });

  it.each([
    { currentStatus: "CANCELLED", mpStatus: "approved" },
    { currentStatus: "PAID", mpStatus: "refunded" },
    { currentStatus: "PAID", mpStatus: "charged_back" },
  ])("logs an anomalous $mpStatus notification without updating", async ({ currentStatus, mpStatus }) => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.orderFindUnique.mockResolvedValue({ ...baseOrder, status: currentStatus });
    mocks.paymentGet.mockResolvedValue({
      id: 123,
      external_reference: "order-1",
      status: mpStatus,
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mocks.orderUpdateMany).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[MP webhook] ALERTA"),
      expect.objectContaining({ orderId: "order-1", paymentId: "123" })
    );
  });

  it("returns 200 when Mercado Pago responds with 404", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.paymentGet.mockRejectedValue({ status: 404, message: "not found" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
  });

  it.each([
    ["a Mercado Pago 5xx response", { status: 503 }],
    ["a network error", new Error("network error")],
    ["a Prisma error", new Error("database unavailable")],
  ])("returns 500 for %s", async (_description, error) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (_description === "a Prisma error") {
      mocks.orderFindUnique.mockRejectedValue(error);
    } else {
      mocks.paymentGet.mockRejectedValue(error);
    }

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
  });

  it("returns 200 for a duplicate payment id database error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.orderUpdateMany.mockRejectedValue({ code: "P2002" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
  });

  it("returns 500 when body parsing fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const request = new NextRequest("https://test.example/api/webhooks/mercadopago", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });

  it("returns 500 when signature verification throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.verifySignature.mockImplementation(() => {
      throw new Error("verification failed");
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
  });

  it("returns 200 for a non-payment event", async () => {
    const response = await POST(makeRequest({ type: "merchant_order", data: { id: "123" } }));

    expect(response.status).toBe(200);
    expect(mocks.paymentGet).not.toHaveBeenCalled();
  });

  it("returns 200 when the payment has no external reference", async () => {
    mocks.paymentGet.mockResolvedValue({ id: 123, status: "approved" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mocks.orderFindUnique).not.toHaveBeenCalled();
  });

  it("returns 200 when the order does not exist", async () => {
    mocks.orderFindUnique.mockResolvedValue(null);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mocks.orderUpdateMany).not.toHaveBeenCalled();
  });
});
