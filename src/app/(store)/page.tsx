import Link from "next/link";
import Image from "next/image";
import { sanityClient } from "@/lib/sanity";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductCard } from "@/components/store/ProductCard";
import { VideoWithSound } from "@/components/store/VideoWithSound";
import { PromoBanner } from "@/components/store/PromoBanner";

export const revalidate = 60;

const VALUE_PROPS = [
  {
    titulo: "Diseño Premium",
    texto:
      "Cada vitrina está pensada para ser un objeto de culto, no solo almacenamiento.",
  },
  {
    titulo: "Hecho a Medida",
    texto:
      "Adaptamos dimensiones y terminaciones a tu espacio y colección.",
  },
  {
    titulo: "Protección Real",
    texto:
      "Control de humedad, protección UV y anclaje seguro para cada guitarra.",
  },
];

export default async function HomePage() {
  let products: SanityProduct[] = [];
  try {
    const fetched = await sanityClient.fetch<SanityProduct[] | null>(ALL_PRODUCTS_QUERY);
    if (Array.isArray(fetched)) {
      products = fetched;
    } else {
      console.error("[HomePage] Unexpected products payload from Sanity:", {
        receivedType: typeof fetched,
      });
    }
  } catch (err) {
    const e = err as Error | null;
    console.error("[HomePage] Error fetching products from Sanity:", {
      name: e?.name,
      message: e?.message,
    });
  }

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────────────
          Imagen estática full-width con texto superpuesto en la esquina
          inferior izquierda sobre un gradiente oscuro.
      ──────────────────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(480px, 90vh, 1000px)", backgroundColor: "#1a0f00" }}
      >
          {/* Imagen de fondo */}
          <Image
            src="/foto1.jpeg"
            alt="Vitrina Sonaq con guitarras en el taller"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Gradiente: oscurece el fondo del texto sin tapar la imagen */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                "linear-gradient(to top, rgba(26,15,0,0.82) 0%, rgba(26,15,0,0.35) 40%, rgba(26,15,0,0.0) 70%)",
            }}
          />

          {/* Texto superpuesto — esquina inferior izquierda */}
          <div className="absolute bottom-0 left-0 w-full px-6 pb-10 md:px-12 md:pb-14 lg:px-16 lg:pb-16">
            <div className="max-w-6xl mx-auto flex flex-col items-start gap-5">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-4 shrink-0"
                  style={{ backgroundColor: "#b8521a" }}
                />
                <p
                  className="text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{ color: "#f5f0e8", opacity: 0.8 }}
                >
                  Donde el sonido descansa
                </p>
              </div>

              {/* Titular */}
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-none"
                style={{
                  fontFamily: "var(--font-barlow-condensed), sans-serif",
                  color: "#f5f0e8",
                  textShadow: "0 2px 24px rgba(26,15,0,0.4)",
                }}
              >
                Muebles para
                <br />
                tus instrumentos
              </h1>

              {/* Bajada + CTA — en desktop en fila */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-10">
                <p
                  className="text-sm md:text-base max-w-xs leading-relaxed"
                  style={{ color: "#f5f0e8", opacity: 0.85 }}
                >
                  Vitrinas y soportes standard y a medida, diseñados y fabricados en Argentina.
                </p>
                <Link
                  href="/productos"
                  className="shrink-0 inline-block px-8 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#f5f0e8", color: "#b8521a" }}
                >
                  Ver productos
                </Link>
              </div>
            </div>
          </div>
      </section>

      {/* ─── Tagline ───────────────────────────────────────────────────────── */}
      <div className="py-4 overflow-hidden" style={{ backgroundColor: "#1a0f00" }}>
        <p
          className="text-center text-xs uppercase tracking-[0.45em] font-medium"
          style={{ color: "#ede5d8", opacity: 0.55 }}
        >
          Diseño&nbsp;&nbsp;·&nbsp;&nbsp;Calidad&nbsp;&nbsp;·&nbsp;&nbsp;Tecnología
        </p>
      </div>

      {/* ─── Banner promocional ─────────────────────────────────────────────── */}
      <PromoBanner />

      {/* ─── "Más que un mueble" (video izq + copy der) ─────────────────────
          Split 50/50. El contenedor del video toma la proporción 9:16 del
          video (aspect-[9/16]) para que coincida sin franja negra.
          max-h limita el alto en pantallas grandes (cuando recorta, lo hace
          en cover centrado — nunca deja borde negro).
          Mobile: apilado vertical (video arriba, texto abajo).
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row overflow-hidden">
        {/* Video — izquierda: contenedor 9:16 con toggle de sonido */}
        <div
          className="relative w-full md:w-1/2 overflow-hidden aspect-[9/16] max-h-[70vh] md:max-h-[80vh]"
          style={{ backgroundColor: "#1a0f00" }}
        >
          <VideoWithSound />
        </div>

        {/* Copy — derecha */}
        <div
          className="w-full md:w-1/2 flex items-center px-8 py-16 md:px-14 lg:px-20"
          style={{ backgroundColor: "#f5f0e8" }}
        >
          <div className="flex flex-col gap-6 max-w-md">
            <div className="w-10 h-1" style={{ backgroundColor: "#b8521a" }} />
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight"
              style={{
                fontFamily: "var(--font-barlow-condensed), sans-serif",
                color: "#1a0f00",
              }}
            >
              Más que un mueble,
              <br />
              una experiencia
            </h2>
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{ color: "#5a4535" }}
            >
              Cada vitrina Sonaq está pensada para proteger tu colección y
              convertirla en el centro de cualquier ambiente. Materiales
              seleccionados, terminaciones artesanales y diseño hecho en
              Argentina.
            </p>
            <Link
              href="/productos"
              className="self-start text-sm font-semibold uppercase tracking-[0.15em] underline underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: "#b8521a" }}
            >
              Conocer las vitrinas
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Productos ─────────────────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-4 py-20"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="flex items-end justify-between mb-10">
          <h2
            className="text-4xl font-black uppercase"
            style={{
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              color: "#1a0f00",
            }}
          >
            Nuestros productos
          </h2>
          <Link
            href="/productos"
            className="text-sm font-medium uppercase tracking-widest underline underline-offset-4 transition-opacity hover:opacity-70"
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
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <p
              className="text-2xl font-black uppercase"
              style={{
                fontFamily: "var(--font-barlow-condensed), sans-serif",
                color: "#d4c4ae",
              }}
            >
              Próximamente
            </p>
            <p className="text-sm" style={{ color: "#5a4535" }}>
              Estamos cargando nuestros productos. Volvé pronto.
            </p>
          </div>
        )}
      </section>

      {/* ─── Propuesta de valor ────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ backgroundColor: "#ede5d8" }}>
        <div className="max-w-6xl mx-auto">
          {/* Encabezado de sección */}
          <p
            className="text-xs uppercase tracking-[0.35em] font-semibold mb-10"
            style={{ color: "#b8521a" }}
          >
            Por qué Sonaq
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-14">
            {VALUE_PROPS.map((item, index) => (
              <div key={item.titulo} className="flex flex-col gap-4">
                {/* Numero de item */}
                <span
                  className="text-6xl font-black leading-none select-none"
                  style={{
                    fontFamily: "var(--font-barlow-condensed), sans-serif",
                    color: "#d4c4ae",
                  }}
                  aria-hidden
                >
                  0{index + 1}
                </span>
                <div className="w-8 h-px" style={{ backgroundColor: "#b8521a" }} />
                <h3
                  className="text-2xl font-black uppercase"
                  style={{
                    fontFamily: "var(--font-barlow-condensed), sans-serif",
                    color: "#1a0f00",
                  }}
                >
                  {item.titulo}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#5a4535" }}>
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
