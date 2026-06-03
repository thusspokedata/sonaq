/**
 * Blinda la validación Zod de los items del carrito (A1/A2 de la auditoría).
 *
 * El re-fetch de precios desde Sanity sigue siendo la fuente de verdad para
 * los VALORES monetarios — estos tests cubren solo FORMA y RANGOS del input
 * del cliente. Si algún test acá empieza a fallar, alguien aflojó el guard.
 */
import { describe, it, expect } from "vitest";
import {
  itemSchema,
  itemsArraySchema,
} from "../../src/app/(store)/checkout/validation";

const validItem = {
  productId: "prod_123",
  title: "Vitrina para 5 Guitarras",
  quantity: 1,
};

describe("A1 — quantity validation", () => {
  it("A1: rejects quantity 0", () => {
    expect(itemSchema.safeParse({ ...validItem, quantity: 0 }).success).toBe(false);
  });

  it("A1: rejects quantity -1", () => {
    expect(itemSchema.safeParse({ ...validItem, quantity: -1 }).success).toBe(false);
  });

  it("A1: rejects fractional quantity (0.5)", () => {
    expect(itemSchema.safeParse({ ...validItem, quantity: 0.5 }).success).toBe(false);
  });

  it("A1: rejects unrealistically large quantity (999999)", () => {
    expect(itemSchema.safeParse({ ...validItem, quantity: 999999 }).success).toBe(false);
  });

  it("A1: rejects quantity 51 (just above max=50)", () => {
    expect(itemSchema.safeParse({ ...validItem, quantity: 51 }).success).toBe(false);
  });

  it("A1: accepts quantity 1 (boundary)", () => {
    expect(itemSchema.safeParse({ ...validItem, quantity: 1 }).success).toBe(true);
  });

  it("A1: accepts quantity 3 (typical)", () => {
    expect(itemSchema.safeParse({ ...validItem, quantity: 3 }).success).toBe(true);
  });

  it("A1: accepts quantity 50 (boundary)", () => {
    expect(itemSchema.safeParse({ ...validItem, quantity: 50 }).success).toBe(true);
  });
});

describe("A1 — items array constraints", () => {
  it("A1: rejects empty cart (items=[])", () => {
    expect(itemsArraySchema.safeParse([]).success).toBe(false);
  });

  it("A1: accepts 1 item (boundary min)", () => {
    expect(itemsArraySchema.safeParse([validItem]).success).toBe(true);
  });

  it("A1: accepts 20 items (boundary max)", () => {
    const cart = Array.from({ length: 20 }, () => validItem);
    expect(itemsArraySchema.safeParse(cart).success).toBe(true);
  });

  it("A1: rejects 21 items (just above max)", () => {
    const cart = Array.from({ length: 21 }, () => validItem);
    expect(itemsArraySchema.safeParse(cart).success).toBe(false);
  });
});

describe("A2 — productId / title / color string bounds", () => {
  it("A2: rejects empty productId", () => {
    expect(itemSchema.safeParse({ ...validItem, productId: "" }).success).toBe(false);
  });

  it("A2: rejects productId longer than 100 chars", () => {
    expect(itemSchema.safeParse({ ...validItem, productId: "p".repeat(101) }).success).toBe(false);
  });

  it("A2: accepts productId of 100 chars (boundary)", () => {
    expect(itemSchema.safeParse({ ...validItem, productId: "p".repeat(100) }).success).toBe(true);
  });

  it("A2: rejects empty title", () => {
    expect(itemSchema.safeParse({ ...validItem, title: "" }).success).toBe(false);
  });

  it("A2: rejects title longer than 200 chars", () => {
    expect(itemSchema.safeParse({ ...validItem, title: "t".repeat(201) }).success).toBe(false);
  });

  it("A2: rejects color longer than 100 chars", () => {
    expect(itemSchema.safeParse({ ...validItem, color: "c".repeat(101) }).success).toBe(false);
  });

  it("A2: accepts color absent (optional)", () => {
    expect(itemSchema.safeParse(validItem).success).toBe(true);
  });
});

describe("A2 — image URL scheme + length", () => {
  it("A2: rejects javascript: scheme image URL", () => {
    expect(
      itemSchema.safeParse({ ...validItem, image: "javascript:alert(1)" }).success
    ).toBe(false);
  });

  it("A2: rejects data: scheme image URL", () => {
    expect(
      itemSchema.safeParse({ ...validItem, image: "data:text/html,<script>x</script>" }).success
    ).toBe(false);
  });

  it("A2: accepts https:// image URL", () => {
    expect(
      itemSchema.safeParse({ ...validItem, image: "https://cdn.sanity.io/x.jpg" }).success
    ).toBe(true);
  });

  it("A2: accepts http:// image URL (sanity behavior — http is also allowed by code)", () => {
    expect(
      itemSchema.safeParse({ ...validItem, image: "http://example.com/x.jpg" }).success
    ).toBe(true);
  });

  it("A2: accepts image absent (optional)", () => {
    expect(itemSchema.safeParse(validItem).success).toBe(true);
  });

  it("A2: rejects image URL longer than 2048 chars", () => {
    const tooLong = "https://example.com/" + "a".repeat(2030);
    expect(itemSchema.safeParse({ ...validItem, image: tooLong }).success).toBe(false);
  });
});

describe("A2 — addons array constraints", () => {
  it("A2: defaults addons to [] when absent", () => {
    const r = itemSchema.safeParse(validItem);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.addons).toEqual([]);
  });

  it("A2: rejects 21 addons (just above max=20)", () => {
    const addons = Array.from({ length: 21 }, (_, i) => ({
      _key: `k${i}`,
      title: "addon",
      price: 100,
    }));
    expect(itemSchema.safeParse({ ...validItem, addons }).success).toBe(false);
  });

  it("A2: accepts 20 addons (boundary max)", () => {
    const addons = Array.from({ length: 20 }, (_, i) => ({
      _key: `k${i}`,
      title: "addon",
      price: 100,
    }));
    expect(itemSchema.safeParse({ ...validItem, addons }).success).toBe(true);
  });

  it("A2: rejects addon with empty _key", () => {
    const addons = [{ _key: "", title: "addon", price: 100 }];
    expect(itemSchema.safeParse({ ...validItem, addons }).success).toBe(false);
  });
});
