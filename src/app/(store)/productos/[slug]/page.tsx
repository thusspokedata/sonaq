import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityClient, urlFor } from "@/lib/sanity";
import { PRODUCT_BY_SLUG_QUERY, ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { PortableText } from "@portabletext/react";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { BASE_URL } from "@/lib/base-url";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products: SanityProduct[] = await sanityClient.fetch(ALL_PRODUCTS_QUERY);
    return products.map((p) => ({ slug: p.slug.current }));
  } catch {
    return MOCK_PRODUCTS.map((p) => ({ slug: p.slug.current }));
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let product: SanityProduct | null = null;
  try {
    product = await sanityClient.fetch(PRODUCT_BY_SLUG_QUERY, { slug });
  } catch {
    product = MOCK_PRODUCTS.find((p) => p.slug.current === slug) ?? null;
  }
  if (!product) return {};

  const pageUrl = `${BASE_URL}/productos/${product.slug.current}`;
  const description = product.shortDescription ?? "Mueble para guitarra hecho a medida en Argentina.";

  const ogImage = product.images?.[0]?.asset?._ref
    ? urlFor(product.images[0]).width(1200).height(630).fit("crop").url()
    : `${BASE_URL}/og-default.jpg`;

  return {
    title: product.title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: product.title,
      description,
      url: pageUrl,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: SanityProduct | null = null;
  try {
    product = await sanityClient.fetch(PRODUCT_BY_SLUG_QUERY, { slug });
  } catch {
    product = MOCK_PRODUCTS.find((p) => p.slug.current === slug) ?? null;
  }

  if (!product) notFound();

  const outOfStock = product.stock === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galeria */}
        <ProductGallery
          images={product.images}
          localImages={product.localImages}
          title={product.title}
        />

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: "#b8521a" }}>
              {product.category}
            </p>
            <h1
              className="text-4xl md:text-5xl font-black uppercase leading-tight"
              style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
            >
              {product.title}
            </h1>
          </div>

          <p
            className="text-3xl font-black"
            style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
          >
            ${product.price.toLocaleString("es-AR")}
          </p>

          {product.shortDescription && (
            <p className="text-sm leading-relaxed" style={{ color: "#5a4535" }}>
              {product.shortDescription}
            </p>
          )}

          {product.features && product.features.length > 0 && (
            <ul className="flex flex-col gap-2">
              {product.features.map((f, i) => (
                <li key={i} className="text-sm flex gap-3 items-start" style={{ color: "#5a4535" }}>
                  <span className="mt-1 w-4 h-1 flex-shrink-0 inline-block" style={{ backgroundColor: "#b8521a" }} />
                  {f}
                </li>
              ))}
            </ul>
          )}

          {product.materials && product.materials.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#5a4535" }}>
                Materiales
              </p>
              <ul className="flex flex-col gap-1">
                {product.materials.map((m, i) => (
                  <li key={i} className="text-sm flex gap-3 items-start" style={{ color: "#5a4535" }}>
                    <span className="mt-1 w-4 h-1 flex-shrink-0 inline-block" style={{ backgroundColor: "#b8521a" }} />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.capacity != null && (
            <p className="text-sm" style={{ color: "#5a4535" }}>
              <span className="font-semibold" style={{ color: "#1a0f00" }}>Capacidad:</span>{" "}
              {product.capacity} {product.capacity === 1 ? "guitarra" : "guitarras"}
            </p>
          )}

          {product.dimensions && (
            <div
              className="grid grid-cols-3 gap-px text-center text-sm overflow-hidden rounded"
              style={{ backgroundColor: "#d4c4ae" }}
            >
              {[
                { label: "Ancho", value: `${product.dimensions.width} cm` },
                { label: "Alto", value: `${product.dimensions.height} cm` },
                { label: "Prof.", value: `${product.dimensions.depth} cm` },
              ].map((d) => (
                <div key={d.label} className="py-3 px-2" style={{ backgroundColor: "#ede5d8" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a4535" }}>{d.label}</p>
                  <p className="font-bold" style={{ color: "#1a0f00" }}>{d.value}</p>
                </div>
              ))}
            </div>
          )}

          <AddToCartButton product={product} disabled={outOfStock} />

          {outOfStock && (
            <p className="text-xs uppercase tracking-widest text-center" style={{ color: "#b8521a" }}>
              Sin stock disponible
            </p>
          )}
        </div>
      </div>

      {/* Descripcion larga */}
      {product.description && product.description.length > 0 && (
        <div className="mt-20 max-w-2xl">
          <h2
            className="text-3xl font-black uppercase mb-6"
            style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
          >
            Descripción
          </h2>
          <div className="prose prose-stone text-sm leading-relaxed" style={{ color: "#5a4535" }}>
            <PortableText value={product.description} />
          </div>
        </div>
      )}
    </div>
  );
}
