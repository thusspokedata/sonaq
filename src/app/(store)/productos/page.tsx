import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductCard } from "@/components/store/ProductCard";

export const metadata: Metadata = { title: "Productos" };
export const revalidate = 60;

const CATEGORIES: Record<string, string> = {
  vitrina: "Vitrinas",
  "soporte-pared": "Soportes de pared",
  "soporte-pie": "Soportes de pie",
  rack: "Racks",
};

export default async function ProductosPage() {
  let products: SanityProduct[] = [];
  try {
    products = await sanityClient.fetch(ALL_PRODUCTS_QUERY);
  } catch {
    // Sin credenciales de Sanity configuradas
  }

  const byCategory = products.reduce<Record<string, SanityProduct[]>>((acc, p) => {
    const cat = p.category ?? "otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-light mb-10">Productos</h1>

      {Object.entries(byCategory).map(([cat, items]) => (
        <section key={cat} className="mb-14">
          <h2 className="text-lg font-medium mb-6 text-neutral-500 uppercase tracking-widest text-sm">
            {CATEGORIES[cat] ?? cat}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      ))}

      {products.length === 0 && (
        <p className="text-neutral-500 text-center py-20">
          Proximamente...
        </p>
      )}
    </div>
  );
}
