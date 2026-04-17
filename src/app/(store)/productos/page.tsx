import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductCard } from "@/components/store/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mock-products";

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

  const usingMockData = products.length === 0;
  const displayProducts = usingMockData ? MOCK_PRODUCTS : products;

  const byCategory = displayProducts.reduce<Record<string, SanityProduct[]>>((acc, p) => {
    const cat = p.category ?? "otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="py-14 px-4" style={{ backgroundColor: "#ede5d8", borderBottom: "1px solid #d4c4ae" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: "#b8521a" }}>
            Colección
          </p>
          <h1
            className="text-5xl md:text-6xl font-black uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
          >
            Todos los productos
          </h1>
        </div>
      </div>

      {usingMockData && (
        <div className="border-b py-3 px-4 text-center text-xs uppercase tracking-widest"
          style={{ backgroundColor: "#fef3c7", borderColor: "#fde68a", color: "#92400e" }}>
          ⚠ Catálogo de ejemplo — los precios mostrados no son reales
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-14">
        {Object.entries(byCategory).map(([cat, items]) => (
          <section key={cat} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-6 h-1" style={{ backgroundColor: "#b8521a" }} />
              <h2
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: "#5a4535" }}
              >
                {CATEGORIES[cat] ?? cat}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
