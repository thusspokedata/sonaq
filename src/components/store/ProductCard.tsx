import Link from "next/link";
import Image from "next/image";
import { SanityProduct } from "@/types";
import { urlFor } from "@/lib/sanity";

interface ProductCardProps {
  product: SanityProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const sanityImage = product.images?.[0];
  const hasSanityImage = sanityImage?.asset?._ref !== "";

  const imageUrl = hasSanityImage
    ? urlFor(sanityImage).width(600).height(600).fit("crop").url()
    : (product.localImages?.[0] ?? null);

  return (
    <Link href={`/productos/${product.slug.current}`} className="group block">
      <div
        className="aspect-square overflow-hidden mb-4 relative"
        style={{ backgroundColor: "#ede5d8" }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={sanityImage?.alt ?? product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "#d4c4ae" }}>
            Sin imagen
          </div>
        )}
        {product.stock === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(245, 240, 232, 0.75)" }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1 border"
              style={{ color: "#5a4535", borderColor: "#d4c4ae" }}
            >
              Sin stock
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#b8521a" }}>
          {product.category}
        </p>
        <h3
          className="font-bold text-lg uppercase leading-tight"
          style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
        >
          {product.title}
        </h3>
        <p className="text-base font-semibold mt-1" style={{ color: "#1a0f00" }}>
          ${product.price.toLocaleString("es-AR")}
        </p>
      </div>
    </Link>
  );
}
