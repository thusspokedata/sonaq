import { describe, expect, it } from "vitest";
import { migrateCart } from "../../src/lib/cart-store";
import type { CartItem } from "../../src/types";

function makeStoredItem(overrides: Partial<CartItem> = {}): Partial<CartItem> {
  return {
    cartItemId: "cart-item-1",
    productId: "product-1",
    title: "Product",
    basePrice: 10_000,
    price: 10_000,
    quantity: 1,
    addons: [],
    slug: "product",
    ...overrides,
  };
}

describe("migrateCart", () => {
  it("discards an item without colorKey or catalogKey", () => {
    const result = migrateCart({ items: [makeStoredItem()] });

    expect(result.items).toEqual([]);
  });

  it("keeps an item with colorKey", () => {
    const result = migrateCart({
      items: [makeStoredItem({ colorKey: "color-1" })],
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].colorKey).toBe("color-1");
    expect(result.items[0].productId).toBe("product-1");
  });
});
