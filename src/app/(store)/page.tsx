import { sanityClient } from "@/lib/sanity";
import { FEATURED_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductCard } from "@/components/store/ProductCard";

export const revalidate = 60;

export default async function HomePage() {
  let products: SanityProduct[] = [];
  try {
    products = await sanityClient.fetch(FEATURED_PRODUCTS_QUERY);
  } catch {
    // Sin credenciales de Sanity configuradas
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-950 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Muebles para tus guitarras
          </h1>
          <p className="text-neutral-400 text-lg mb-8">
            Vitrinas y soportes hechos a medida. Diseño que cuida tus instrumentos.
          </p>
          <a
            href="/productos"
            className="inline-block bg-white text-black px-8 py-3 text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Ver productos
          </a>
        </div>
      </section>

      {/* Productos destacados */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-light mb-8">Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
