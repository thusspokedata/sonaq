import Link from "next/link";
import Image from "next/image";
import { SanityProduct } from "@/types";
import { urlFor } from "@/lib/sanity";

interface ProductCardProps {
  product: SanityProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const imageUrl = image ? urlFor(image).width(600).height(600).fit("crop").url() : null;

  return (
    <Link href={`/productos/${product.slug.current}`} className="group block">
      <div className="aspect-square bg-neutral-100 overflow-hidden mb-3 relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={image?.alt ?? product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
            Sin imagen
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-600">Sin stock</span>
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm group-hover:underline">{product.title}</h3>
      <p className="text-neutral-600 text-sm mt-1">
        ${product.price.toLocaleString("es-AR")}
      </p>
    </Link>
  );
}
