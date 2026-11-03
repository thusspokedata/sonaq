import { describe, expect, it } from "vitest";
import {
  buildOrderItems,
  CheckoutItem,
  CheckoutProduct,
  itemSchema,
} from "../../src/app/(store)/checkout/validation";

function makeItem(overrides: Partial<CheckoutItem> = {}): CheckoutItem {
  return {
    cartItemId: "cart-item-1",
    productId: "product-1",
    title: "Client title",
    quantity: 1,
    addons: [],
    slug: "server-product",
    ...overrides,
  };
}

function makeProduct(overrides: Partial<CheckoutProduct> = {}): CheckoutProduct {
  return {
    _id: "product-1",
    title: "Server product",
    price: 10_000,
    stock: 10,
    image: "https://cdn.sanity.io/server-image.jpg",
    addons: [],
    colors: [],
    colorCatalogs: [],
    ...overrides,
  };
}

function expectError(result: ReturnType<typeof buildOrderItems>, message: string) {
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error).toBe(message);
}

describe("buildOrderItems", () => {
  it("adds the catalog priceExtra and builds the color from server data", () => {
    const result = buildOrderItems(
      [makeItem({ catalogKey: "catalog-1", catalogCode: "B2 Blanco" })],
      [
        makeProduct({
          colorCatalogs: [{ _key: "catalog-1", brand: "Faplac", priceExtra: 2_500 }],
        }),
      ]
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.items[0].price).toBe(12_500);
      expect(result.items[0].color).toBe("Faplac — B2 Blanco");
    }
  });

  it("rejects a catalogKey that does not belong to the product", () => {
    const result = buildOrderItems(
      [makeItem({ catalogKey: "another-catalog", catalogCode: "B2 Blanco" })],
      [
        makeProduct({
          colorCatalogs: [{ _key: "catalog-1", brand: "Faplac", priceExtra: 2_500 }],
        }),
      ]
    );

    expectError(result, "El color seleccionado no está disponible.");
  });

  it("asks for a cart refresh when a product with colors has no structured variant", () => {
    const result = buildOrderItems(
      [makeItem({ color: "Faplac — B2 Blanco" })],
      [makeProduct({ colors: [{ _key: "color-1", name: "Natural" }] })]
    );

    expectError(result, "Actualizá tu carrito");
  });

  it("rejects a colorKey from another product", () => {
    const result = buildOrderItems(
      [makeItem({ colorKey: "other-product-color" })],
      [makeProduct({ colors: [{ _key: "color-1", name: "Natural" }] })]
    );

    expectError(result, "El color seleccionado no está disponible.");
  });

  it("uses the product title from the server", () => {
    const result = buildOrderItems(
      [makeItem({ title: "Different client title" })],
      [makeProduct({ title: "Canonical product title" })]
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.items[0].title).toBe("Canonical product title");
  });

  it("uses the product image from the server", () => {
    const result = buildOrderItems(
      [makeItem({ image: "https://example.com/client-image.jpg" })],
      [makeProduct({ image: "https://cdn.sanity.io/canonical-image.jpg" })]
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.items[0].image).toBe("https://cdn.sanity.io/canonical-image.jpg");
    }
  });

  it("rejects a product with zero stock", () => {
    const result = buildOrderItems([makeItem()], [makeProduct({ stock: 0 })]);

    expectError(result, "No hay stock suficiente de Server product");
  });

  it("rejects repeated lines whose combined quantity exceeds stock", () => {
    const result = buildOrderItems(
      [
        makeItem({ cartItemId: "line-1", quantity: 3 }),
        makeItem({ cartItemId: "line-2", quantity: 3 }),
      ],
      [makeProduct({ stock: 5 })]
    );

    expectError(result, "No hay stock suficiente de Server product");
  });

  it("accepts a product without colors and ignores variant fields", () => {
    const result = buildOrderItems(
      [
        makeItem({
          color: "Client color",
          colorKey: "unused-color",
          catalogKey: "unused-catalog",
          catalogCode: "Unused code",
        }),
      ],
      [makeProduct()]
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.items[0].color).toBeUndefined();
      expect(result.items[0].price).toBe(10_000);
    }
  });

  it("uses the swatch name from the server", () => {
    const result = buildOrderItems(
      [makeItem({ colorKey: "color-1" })],
      [makeProduct({ colors: [{ _key: "color-1", name: "Nogal" }] })]
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.items[0].color).toBe("Nogal");
  });

  it("rejects multiple variant selections for one line", () => {
    const result = buildOrderItems(
      [
        makeItem({
          colorKey: "color-1",
          catalogKey: "catalog-1",
          catalogCode: "B2 Blanco",
        }),
      ],
      [
        makeProduct({
          colors: [{ _key: "color-1", name: "Nogal" }],
          colorCatalogs: [{ _key: "catalog-1", brand: "Faplac", priceExtra: 2_500 }],
        }),
      ]
    );

    expectError(result, "Actualizá tu carrito");
  });
});

describe("catalogCode schema", () => {
  it("trims valid catalog text", () => {
    const result = itemSchema.safeParse(makeItem({ catalogCode: "  B2 Blanco  " }));

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.catalogCode).toBe("B2 Blanco");
  });

  it("rejects catalog text containing the display separator", () => {
    const result = itemSchema.safeParse(makeItem({ catalogCode: "Faplac — B2 Blanco" }));

    expect(result.success).toBe(false);
  });

  it("rejects catalog text longer than 100 characters", () => {
    const result = itemSchema.safeParse(makeItem({ catalogCode: "a".repeat(101) }));

    expect(result.success).toBe(false);
  });
});
