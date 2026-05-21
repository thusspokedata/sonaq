"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

/** Limpia el carrito al montar solo si `active` es true. */
export function ClearCartOnMount({ active = true }: { active?: boolean }) {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => { if (active) clearCart(); }, [active, clearCart]);
  return null;
}
