"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { SanityProduct, SelectedAddon } from "@/types";
import { urlFor } from "@/lib/sanity";
import { AddonsSelector } from "./AddonsSelector";
import { formatPrice } from "@/lib/order-utils";

interface AddToCartButtonProps {
  product: SanityProduct;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = (product.price ?? 0) + addonsTotal;

  const handleAdd = () => {
    const sanityImage = product.images?.[0];
    const hasSanityImage = sanityImage?.asset?._ref !== "" && sanityImage?.asset?._ref != null;
    const imageUrl = hasSanityImage
      ? urlFor(sanityImage).width(200).height(200).fit("crop").url()
      : (product.localImages?.[0] ?? undefined);

    // cartItemId único por combinación producto + addons (usa _key estable, no title)
    const addonKey = selectedAddons.map((a) => a._key).sort().join("|");
    const cartItemId = addonKey ? `${product._id}-${addonKey}` : product._id;

    addItem({
      cartItemId,
      productId: product._id,
      title: product.title,
      basePrice: product.price ?? 0,
      price: totalPrice,
      addons: selectedAddons,
      quantity: 1,
      slug: product.slug.current,
      image: imageUrl,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (disabled) {
    return (
      <button
        disabled
        className="w-full py-4 text-sm font-semibold uppercase tracking-widest cursor-not-allowed"
        style={{ backgroundColor: "#d4c4ae", color: "#5a4535" }}
      >
        Sin stock
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de opcionales */}
      {product.addons && product.addons.length > 0 && (
        <AddonsSelector
          addons={product.addons}
          selected={selectedAddons}
          onChange={setSelectedAddons}
        />
      )}

      {/* Total con addons */}
      {selectedAddons.length > 0 && (
        <div className="flex justify-between items-baseline border-t pt-3" style={{ borderColor: "#d4c4ae" }}>
          <span className="text-xs uppercase tracking-widest" style={{ color: "#5a4535" }}>
            Total
          </span>
          <span className="text-2xl font-black" style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}>
            {formatPrice(totalPrice)}
          </span>
        </div>
      )}

      {/* Botón */}
      <button
        onClick={handleAdd}
        className="w-full py-4 text-sm font-semibold uppercase tracking-widest transition-all"
        style={{
          backgroundColor: added ? "#8b3d10" : "#b8521a",
          color: "#f5f0e8",
          letterSpacing: "0.15em",
        }}
      >
        {added ? "✓ Agregado" : "Agregar al carrito"}
      </button>
    </div>
  );
}
