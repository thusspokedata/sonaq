import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prismaOrderCreate: vi.fn(),
  sanityFetch: vi.fn(),
  createMPPreference: vi.fn(),
  checkRateLimit: vi.fn(() => true),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({ get: () => null })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { order: { create: mocks.prismaOrderCreate } },
}));

vi.mock("@/lib/sanity", () => ({
  sanityClient: { fetch: mocks.sanityFetch },
}));

vi.mock("@/lib/emails", () => ({
  sendOrderConfirmationToCustomer: vi.fn(),
  sendNewOrderNotificationToTeam: vi.fn(),
}));

vi.mock("@/lib/mercadopago", () => ({
  createMPPreference: mocks.createMPPreference,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));

vi.mock("@/lib/base-url", () => ({
  BASE_URL: "https://test.example",
}));

import { createOrder } from "../../src/app/(store)/checkout/actions";

describe("checkout price rounding", () => {
  beforeEach(() => {
    mocks.prismaOrderCreate.mockResolvedValue({ id: "order-1" });
    mocks.sanityFetch.mockResolvedValue([
      {
        _id: "product-1",
        title: "Producto",
        price: 100.49,
        stock: 10,
        addons: [],
        colors: [],
        colorCatalogs: [],
      },
    ]);
    mocks.createMPPreference.mockResolvedValue("https://mp.example/checkout");
    mocks.checkRateLimit.mockReturnValue(true);
  });

  it("uses the same whole-peso price in the order and MP preference", async () => {
    const result = await createOrder(
      [
        {
          cartItemId: "cart-item-1",
          productId: "product-1",
          title: "Producto",
          basePrice: 100.49,
          price: 100.49,
          quantity: 2,
          addons: [],
          slug: "producto",
        },
      ],
      {
        name: "Juan Pérez",
        email: "juan@example.com",
        address: "Calle 1234",
        city: "Córdoba",
        province: "Córdoba",
        paymentMethod: "MERCADOPAGO",
        acceptsTerms: "on",
      }
    );

    expect(result.status).toBe("mp_redirect");
    const orderData = mocks.prismaOrderCreate.mock.calls[0][0].data;
    const preference = mocks.createMPPreference.mock.calls[0][0];

    expect(orderData.items.create[0].price).toBe(100);
    expect(orderData.total).toBe(200);
    expect(preference.items[0].unit_price).toBe(100);
    expect(orderData.total).toBe(preference.items[0].unit_price * preference.items[0].quantity);
  });
});
