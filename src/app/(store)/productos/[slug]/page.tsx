import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityClient } from "@/lib/sanity";
import { PRODUCT_BY_SLUG_QUERY, ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { PortableText } from "@portabletext/react";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products: SanityProduct[] = await sanityClient.fetch(ALL_PRODUCTS_QUERY);
    return products.map((p) => ({ slug: p.slug.current }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product: SanityProduct | null = await sanityClient.fetch(PRODUCT_BY_SLUG_QUERY, { slug });
  if (!product) return {};
  return { title: product.title, description: product.shortDescription };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product: SanityProduct | null = await sanityClient.fetch(PRODUCT_BY_SLUG_QUERY, { slug });

  if (!product) notFound();

  const outOfStock = product.stock === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galeria */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl font-light">{product.title}</h1>
          </div>

          <p className="text-3xl font-medium">
            ${product.price.toLocaleString("es-AR")}
          </p>

          {product.shortDescription && (
            <p className="text-neutral-600 leading-relaxed">{product.shortDescription}</p>
          )}

          {product.features && product.features.length > 0 && (
            <ul className="space-y-1">
              {product.features.map((f, i) => (
                <li key={i} className="text-sm text-neutral-600 flex gap-2">
                  <span className="text-neutral-400">—</span> {f}
                </li>
              ))}
            </ul>
          )}

          {product.dimensions && (
            <div className="border border-neutral-200 rounded p-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <p className="text-neutral-400">Ancho</p>
                <p className="font-medium">{product.dimensions.width} cm</p>
              </div>
              <div>
                <p className="text-neutral-400">Alto</p>
                <p className="font-medium">{product.dimensions.height} cm</p>
              </div>
              <div>
                <p className="text-neutral-400">Prof.</p>
                <p className="font-medium">{product.dimensions.depth} cm</p>
              </div>
            </div>
          )}

          <AddToCartButton product={product} disabled={outOfStock} />

          {outOfStock && (
            <p className="text-sm text-red-500">Sin stock disponible</p>
          )}
        </div>
      </div>

      {/* Descripcion larga */}
      {product.description && (
        <div className="mt-16 max-w-2xl prose prose-neutral">
          <h2 className="text-xl font-light mb-4">Descripcion</h2>
          <PortableText value={product.description} />
        </div>
      )}
    </div>
  );
}
