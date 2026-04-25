import Link from "next/link";
import { sanityClient } from "@/lib/sanity";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductCard } from "@/components/store/ProductCard";

export const revalidate = 60;

export default async function HomePage() {
  let products: SanityProduct[] = [];
  try {
    products = await sanityClient.fetch(ALL_PRODUCTS_QUERY);
  } catch (err) {
    const e = err as Error | null;
    console.error("[HomePage] Error fetching products from Sanity:", {
      name: e?.name,
      message: e?.message,
    });
  }

  return (
    <div>
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
            tus instrumentos
          </h1>
          <p
            className="text-base md:text-lg max-w-md leading-relaxed"
            style={{ color: "#ede5d8", opacity: 0.85 }}
          >
            Vitrinas y soportes standard y a medida.
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
          Diseño &nbsp;<span style={{ verticalAlign: "middle" }}>·</span>&nbsp; Calidad &nbsp;<span style={{ verticalAlign: "middle" }}>·</span>&nbsp; Tecnología
        </p>
      </div>

      {/* Video */}
      <section className="py-20 px-4" style={{ backgroundColor: "#1a0f00" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Texto */}
          <div className="flex flex-col gap-5 md:flex-1">
            <div className="w-8 h-1" style={{ backgroundColor: "#b8521a" }} />
            <h2
              className="text-4xl md:text-5xl font-black uppercase leading-tight"
              style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#f5f0e8" }}
            >
              Más que un mueble,<br />una experiencia
            </h2>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#ede5d8", opacity: 0.75 }}>
              Cada vitrina Sonaq está pensada para proteger tu colección y convertirla en el centro de cualquier ambiente. Materiales seleccionados, terminaciones artesanales y diseño hecho en Argentina.
            </p>
          </div>

          {/* Video vertical (YouTube Shorts) */}
          <div className="w-full md:w-auto flex justify-center">
            <div
              className="relative overflow-hidden rounded w-full max-w-[320px]"
              style={{ aspectRatio: "9/16" }}
            >
              <iframe
                src="https://www.youtube-nocookie.com/embed/P5aeAu4qlJo?autoplay=0&rel=0&modestbranding=1"
                title="Vitrina Sonaq"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2
            className="text-4xl font-black uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
          >
            Nuestros productos
          </h2>
          <Link
            href="/productos"
            className="text-sm font-medium uppercase tracking-widest underline underline-offset-4"
            style={{ color: "#b8521a" }}
          >
            Ver todos
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center gap-4">
            <p
              className="text-2xl font-black uppercase"
              style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#d4c4ae" }}
            >
              Próximamente
            </p>
            <p className="text-sm" style={{ color: "#5a4535" }}>
              Estamos cargando nuestros productos. Volvé pronto.
            </p>
          </div>
        )}
      </section>

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
