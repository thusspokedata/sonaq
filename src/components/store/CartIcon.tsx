"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

export function CartIcon() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link href="/carrito" className="relative flex items-center gap-1 group">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        style={{ color: "#1a0f00" }}
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {mounted && count > 0 && (
        <span
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
          style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
