"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";

export function CartView() {
  const { items, removeItem, updateQuantity, total, count } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-neutral-500 mb-6">Tu carrito esta vacio</p>
        <Link
          href="/productos"
          className="inline-block bg-black text-white px-6 py-2 text-sm hover:bg-neutral-800 transition-colors"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-light mb-8">
        Carrito ({count()} {count() === 1 ? "item" : "items"})
      </h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 border-b border-neutral-100 pb-4">
            <div className="w-20 h-20 bg-neutral-100 flex-shrink-0 relative">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/productos/${item.slug}`}
                className="font-medium text-sm hover:underline line-clamp-2"
              >
                {item.title}
              </Link>
              <p className="text-neutral-600 text-sm mt-1">
                ${item.price.toLocaleString("es-AR")}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-7 h-7 border border-neutral-300 text-sm hover:border-black transition-colors"
                >
                  −
                </button>
                <span className="text-sm w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-7 h-7 border border-neutral-300 text-sm hover:border-black transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right flex flex-col justify-between">
              <button
                onClick={() => removeItem(item.productId)}
                className="text-neutral-400 hover:text-black text-sm"
              >
                ✕
              </button>
              <p className="font-medium text-sm">
                ${(item.price * item.quantity).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center py-4 border-t border-neutral-200">
        <span className="text-lg">Total</span>
        <span className="text-2xl font-medium">
          ${total().toLocaleString("es-AR")}
        </span>
      </div>

      <Link
        href="/checkout"
        className="block w-full text-center bg-black text-white py-3 mt-4 text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        Continuar con el pago
      </Link>
    </div>
  );
}
