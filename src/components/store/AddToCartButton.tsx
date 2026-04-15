"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { SanityProduct } from "@/types";
import { urlFor } from "@/lib/sanity";

interface AddToCartButtonProps {
  product: SanityProduct;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    const sanityImage = product.images?.[0];
    const hasSanityImage = sanityImage?.asset?._ref !== "" && sanityImage?.asset?._ref != null;
    const imageUrl = hasSanityImage
      ? urlFor(sanityImage).width(200).height(200).fit("crop").url()
      : (product.localImages?.[0] ?? undefined);

    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
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
  );
}
