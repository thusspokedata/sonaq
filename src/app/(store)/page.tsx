import Link from "next/link";
import { sanityClient } from "@/lib/sanity";
import { FEATURED_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductCard } from "@/components/store/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { ConstructionBanner } from "@/components/store/ConstructionBanner";

export const revalidate = 60;

export default async function HomePage() {
  let products: SanityProduct[] = [];
  try {
    products = await sanityClient.fetch(FEATURED_PRODUCTS_QUERY);
  } catch {
    // Sin credenciales de Sanity configuradas
  }

  const usingMockData = products.length === 0;
  const displayProducts = usingMockData ? MOCK_PRODUCTS.filter((p) => p.featured) : products.filter((p) => p.featured);

  return (
    <div>
      <ConstructionBanner />
      {/* Hero */}
      <section
        className="relative overflow-hidden py-28 px-4"
        style={{ backgroundColor: "#b8521a" }}
      >
        {/* Texto gigante de fondo */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="text-[22vw] font-black uppercase leading-none opacity-10 tracking-tight"
            style={{
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              color: "#f5f0e8",
            }}
          >
            SONAQ
          </span>
        </div>

        <div className="relative max-w-6xl mx-auto flex flex-col items-start gap-6">
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "#ede5d8", opacity: 0.8 }}
          >
            Donde el sonido descansa
          </p>
          <h1
            className="text-6xl md:text-8xl font-black uppercase leading-none"
            style={{
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              color: "#f5f0e8",
            }}
          >
            Muebles para
            <br />
            tus guitarras
          </h1>
          <p
            className="text-base md:text-lg max-w-md leading-relaxed"
            style={{ color: "#ede5d8", opacity: 0.85 }}
          >
            Vitrinas y soportes hechos a medida. Diseño que cuida y exhibe tus instrumentos.
          </p>
          <Link
            href="/productos"
            className="inline-block px-8 py-3 font-semibold uppercase tracking-widest text-sm transition-all hover:opacity-90"
            style={{
              backgroundColor: "#f5f0e8",
              color: "#b8521a",
              letterSpacing: "0.15em",
            }}
          >
            Ver productos
          </Link>
        </div>
      </section>

      {/* Franja tagline */}
      <div
        className="py-4 overflow-hidden"
        style={{ backgroundColor: "#1a0f00" }}
      >
        <p
          className="text-center text-xs uppercase tracking-[0.4em] font-medium"
          style={{ color: "#ede5d8", opacity: 0.6 }}
        >
          Artesanal &nbsp;·&nbsp; A medida &nbsp;·&nbsp; Hecho en Argentina
        </p>
      </div>

      {/* Productos destacados */}
      {displayProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          {usingMockData && (
            <p className="text-xs uppercase tracking-widest mb-6 text-center py-2 px-4 border"
              style={{ backgroundColor: "#fef3c7", borderColor: "#fde68a", color: "#92400e" }}>
              ⚠ Productos de ejemplo — los precios mostrados no son reales
            </p>
          )}
          <div className="flex items-end justify-between mb-10">
            <h2
              className="text-4xl font-black uppercase"
              style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
            >
              Destacados
            </h2>
            <Link
              href="/productos"
              className="text-sm font-medium uppercase tracking-widest underline underline-offset-4"
              style={{ color: "#b8521a" }}
            >
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Bloque propuesta de valor */}
      <section
        className="py-20 px-4"
        style={{ backgroundColor: "#ede5d8" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              titulo: "Diseño Premium",
              texto: "Cada vitrina está pensada para ser un objeto de culto, no solo almacenamiento.",
            },
            {
              titulo: "Hecho a Medida",
              texto: "Adaptamos dimensiones y terminaciones a tu espacio y colección.",
            },
            {
              titulo: "Protección Real",
              texto: "Control de humedad, protección UV y anclaje seguro para cada guitarra.",
            },
          ].map((item) => (
            <div key={item.titulo} className="flex flex-col gap-3">
              <div className="w-8 h-1" style={{ backgroundColor: "#b8521a" }} />
              <h3
                className="text-2xl font-bold uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
              >
                {item.titulo}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5a4535" }}>
                {item.texto}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
