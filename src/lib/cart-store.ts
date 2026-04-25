import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.cartItemId === item.cartItemId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.cartItemId === item.cartItemId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "sonaq-cart",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { items?: Partial<CartItem>[] } | undefined;
        return {
          items: (state?.items ?? []).map((item, i) => {
            const cartItemId =
              item.cartItemId ||
              item.productId ||
              `legacy-${i}-${Date.now()}`;
            const basePrice = Number(item.basePrice ?? item.price) || 0;
            const price = Number(item.price) || 0;
            return {
              ...item,
              cartItemId,
              basePrice,
              price,
              addons: Array.isArray(item.addons) ? item.addons : [],
            };
          }) as CartItem[],
        };
      },
    }
  )
);
