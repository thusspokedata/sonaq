/**
 * Blinda el guard del honeypot (E2 de la auditoría).
 *
 * Mockea TODO lo externo (Sanity, Prisma, MercadoPago, Resend, Next headers,
 * rate-limit). Los tests confirman que cuando el honeypot está lleno la
 * server action corta ANTES de tocar cualquier dependencia externa, devuelve
 * un fake-success con UUID random, y loggea un warn sin PII.
 *
 * Cuando el honeypot está vacío, el flujo debe seguir adelante (acá lo
 * llevamos al guard de "carrito vacío" — es la forma más simple de confirmar
 * que el honeypot NO interrumpe sin emitir side effects propios).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted: el factory de vi.mock se hoistea al top del archivo, así que
// referencias a `const xxxMock = vi.fn()` declaradas en module scope no
// están inicializadas en ese momento. vi.hoisted nos permite crear los
// mocks ANTES de que corran los factories de vi.mock.
const mocks = vi.hoisted(() => ({
  headersGet: vi.fn((): string | null => null),
  prismaOrderCreate: vi.fn(),
  sanityFetch: vi.fn(),
  sendCustomerEmail: vi.fn(),
  sendTeamEmail: vi.fn(),
  createMPPreference: vi.fn(),
  checkRateLimit: vi.fn(() => true),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({ get: mocks.headersGet })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { order: { create: mocks.prismaOrderCreate } },
}));

vi.mock("@/lib/sanity", () => ({
  sanityClient: { fetch: mocks.sanityFetch },
}));

vi.mock("@/lib/emails", () => ({
  sendOrderConfirmationToCustomer: mocks.sendCustomerEmail,
  sendNewOrderNotificationToTeam: mocks.sendTeamEmail,
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

// Import AFTER mocks
import { createOrder } from "../../src/app/(store)/checkout/actions";

const formBase = {
  name: "Juan Pérez",
  email: "juan@example.com",
  phone: "351-555-0001",
  address: "Calle 1 234",
  city: "Córdoba",
  province: "Córdoba",
  paymentMethod: "BANK_TRANSFER",
  acceptsTerms: "on",
};

const itemBase = {
  cartItemId: "ci_1",
  productId: "prod_1",
  title: "Vitrina",
  basePrice: 100000,
  price: 100000,
  quantity: 1,
  addons: [],
  slug: "vitrina",
};

describe("E2 — honeypot guard", () => {
  beforeEach(() => {
    mocks.headersGet.mockImplementation(() => null);
    mocks.checkRateLimit.mockReturnValue(true);
  });

  it("E2: honeypot filled → returns fake success WITHOUT touching any external dependency", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await createOrder([itemBase], { ...formBase, website: "http://spam.example" });

    // Comportamiento externo del retorno
    expect(result.status).toBe("success");
    if (result.status === "success") {
      // UUID v4 — no es un cuid de Prisma
      expect(result.orderId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    }

    // CERO efectos colaterales: ningún mock externo se llamó
    expect(mocks.prismaOrderCreate).not.toHaveBeenCalled();
    expect(mocks.sanityFetch).not.toHaveBeenCalled();
    expect(mocks.sendCustomerEmail).not.toHaveBeenCalled();
    expect(mocks.sendTeamEmail).not.toHaveBeenCalled();
    expect(mocks.createMPPreference).not.toHaveBeenCalled();
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();

    // Logging: warn con el label, sin PII (no debe contener email/nombre/dirección/teléfono)
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const logged = warnSpy.mock.calls[0][0] as string;
    expect(logged).toContain("[checkout] honeypot triggered");
    expect(logged).not.toContain(formBase.email);
    expect(logged).not.toContain(formBase.name);
    expect(logged).not.toContain(formBase.phone);
    expect(logged).not.toContain(formBase.address);

    warnSpy.mockRestore();
  });

  it("E2: honeypot only whitespace → treated as empty (continues), does NOT trigger guard", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Carrito vacío → debería caer al guard de "El carrito está vacío".
    // Si el honeypot se disparara por "   ", el resultado sería un fake success.
    const result = await createOrder([], { ...formBase, website: "   " });

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.errors._).toEqual(["El carrito está vacío"]);
    }
    // No se loggeó el warn del honeypot
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("E2: honeypot empty (normal client) → flow continues past the guard", async () => {
    // Probamos que sin honeypot el flujo NO corta acá. Lo lleva hasta el
    // guard de "carrito vacío" para no necesitar mockear más cadena.
    const result = await createOrder([], { ...formBase, website: "" });

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.errors._).toEqual(["El carrito está vacío"]);
    }
  });

  it("E2: honeypot absent (legacy form / no field) → flow continues past the guard", async () => {
    const result = await createOrder([], { ...formBase });
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.errors._).toEqual(["El carrito está vacío"]);
    }
  });
});
