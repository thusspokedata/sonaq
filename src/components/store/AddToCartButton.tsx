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
    const image = product.images?.[0];
    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
      slug: product.slug.current,
      image: image ? urlFor(image).width(200).height(200).fit("crop").url() : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (disabled) {
    return (
      <button
        disabled
        className="w-full py-3 bg-neutral-200 text-neutral-400 text-sm font-medium cursor-not-allowed"
      >
        Sin stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
    >
      {added ? "Agregado al carrito" : "Agregar al carrito"}
    </button>
  );
}
