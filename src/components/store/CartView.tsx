"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";

export function CartView() {
  const { items, removeItem, updateQuantity, total, count } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-28 text-center flex flex-col items-center gap-6">
        <p
          className="text-4xl font-black uppercase"
          style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#d4c4ae" }}
        >
          Carrito vacío
        </p>
        <p className="text-sm" style={{ color: "#5a4535" }}>Todavía no agregaste nada.</p>
        <Link
          href="/productos"
          className="inline-block px-8 py-3 text-sm font-semibold uppercase tracking-widest"
          style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1
        className="text-4xl font-black uppercase mb-10"
        style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
      >
        Carrito ({count()} {count() === 1 ? "item" : "items"})
      </h1>

      <div className="flex flex-col gap-0">
        {items.map((item, i) => (
          <div
            key={item.cartItemId}
            className="flex gap-4 py-5"
            style={{
              borderTop: i === 0 ? `1px solid #d4c4ae` : undefined,
              borderBottom: `1px solid #d4c4ae`,
            }}
          >
            <div className="w-20 h-20 flex-shrink-0 relative" style={{ backgroundColor: "#ede5d8" }}>
              {item.image && (
                <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/productos/${item.slug}`}
                className="font-bold text-sm uppercase leading-tight hover:underline"
                style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
              >
                {item.title}
              </Link>
              {/* Color elegido */}
              {item.color && (
                <p className="text-xs mt-0.5" style={{ color: "#5a4535" }}>
                  Color: <span className="font-medium">{item.color}</span>
                </p>
              )}
              {/* Addons seleccionados */}
              {item.addons && item.addons.length > 0 && (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {item.addons.map((addon) => (
                    <li key={addon._key} className="text-xs" style={{ color: "#5a4535" }}>
                      + {addon.title}{" "}
                      <span style={{ color: "#b8521a" }}>
                        (+${Number.isFinite(Number(addon.price)) ? Number(addon.price).toLocaleString("es-AR") : "0"})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm mt-1" style={{ color: "#5a4535" }}>
                ${item.price.toLocaleString("es-AR")} c/u
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  aria-label={`Disminuir cantidad de ${item.title}`}
                  className="w-7 h-7 border text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ borderColor: "#d4c4ae", color: "#1a0f00" }}
                  title={item.quantity <= 1 ? "Usá ✕ para eliminar" : undefined}
                >
                  −
                </button>
                <span className="text-sm w-5 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  aria-label={`Aumentar cantidad de ${item.title}`}
                  className="w-7 h-7 border text-sm font-medium transition-colors"
                  style={{ borderColor: "#d4c4ae", color: "#1a0f00" }}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-between items-end">
              <button
                onClick={() => removeItem(item.cartItemId)}
                aria-label={`Eliminar ${item.title} del carrito`}
                className="text-xs uppercase tracking-widest transition-colors"
                style={{ color: "#d4c4ae" }}
              >
                ✕
              </button>
              <p className="font-bold text-sm" style={{ color: "#1a0f00" }}>
                ${(item.price * item.quantity).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center py-6" style={{ borderTop: "2px solid #1a0f00" }}>
        <span className="text-lg font-semibold uppercase tracking-wide" style={{ color: "#1a0f00" }}>
          Total
        </span>
        <span
          className="text-3xl font-black uppercase"
          style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
        >
          ${total().toLocaleString("es-AR")}
        </span>
      </div>

      <Link
        href="/checkout"
        className="block w-full text-center py-4 mt-2 text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#b8521a", color: "#f5f0e8", letterSpacing: "0.15em" }}
      >
        Continuar con el pago
      </Link>
    </div>
  );
}
