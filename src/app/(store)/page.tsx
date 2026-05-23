import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { sanityClient } from "@/lib/sanity";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { ProductCard } from "@/components/store/ProductCard";
import { VideoWithSound } from "@/components/store/VideoWithSound";
import { PromoBanner } from "@/components/store/PromoBanner";
import { BASE_URL } from "@/lib/base-url";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Vitrinas y muebles para guitarras — hechos a medida en Argentina",
  description:
    "Vitrinas, soportes y muebles para guitarras hechos a medida en Córdoba, Argentina. Diseño artesanal, protección real y fabricación a pedido. Donde el sonido descansa.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Vitrinas y muebles para guitarras — hechos a medida en Argentina",
    description:
      "Vitrinas, soportes y muebles para guitarras hechos a medida en Córdoba, Argentina. Diseño artesanal, protección real y fabricación a pedido.",
    url: BASE_URL,
    type: "website",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Sonaq — Muebles para guitarras" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vitrinas y muebles para guitarras — hechos a medida en Argentina",
    description:
      "Vitrinas, soportes y muebles para guitarras hechos a medida en Córdoba, Argentina. Diseño artesanal, protección real y fabricación a pedido.",
    images: ["/og-default.jpg"],
  },
};

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
          Imagen estática full-width en orientación natural (las guitarras
          se ven como diestro: clavijero a la izquierda). Texto superpuesto
          en la esquina inferior derecha sobre un gradiente diagonal que
          oscurece el bottom-right donde vive el texto.
      ──────────────────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(480px, 90vh, 1000px)", backgroundColor: "#1a0f00" }}
      >
          {/* Imagen de fondo — orientación natural (sin scaleX). */}
          <Image
            src="/foto1.jpeg"
            alt="Vitrina Sonaq con guitarras en el taller"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Gradiente diagonal: oscurece bottom-right (donde va el texto)
              sin tapar la vitrina del lado izquierdo. */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                "linear-gradient(to top left, rgba(26,15,0,0.85) 0%, rgba(26,15,0,0.45) 40%, rgba(26,15,0,0.0) 75%)",
            }}
          />

          {/* Texto superpuesto — esquina inferior derecha */}
          <div className="absolute bottom-0 left-0 w-full px-6 pb-10 md:px-12 md:pb-14 lg:px-16 lg:pb-16">
            <div className="max-w-6xl mx-auto flex flex-col items-end gap-5 text-right">
              {/* Eyebrow — orden invertido: texto primero, bar como remate a la derecha */}
              <div className="flex items-center gap-3">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{ color: "#f5f0e8", opacity: 0.8 }}
                >
                  Donde el sonido descansa
                </p>
                <div
                  aria-hidden
                  className="w-1 h-4 shrink-0"
                  style={{ backgroundColor: "#b8521a" }}
                />
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
              <div className="flex flex-col items-end sm:flex-row gap-5 sm:gap-10">
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
          El contenedor del video siempre mantiene aspect-[9/16] = el video
          se ve completo, sin franja negra y sin recorte.
          - Mobile: w-full manda el ancho, el alto sale del aspect y se
            limita con max-h-[70vh]; el texto va apilado debajo.
          - Desktop: md:h-[80vh] manda el alto, el ancho sale del aspect
            (~45vh ≈ 400-500px). La columna de copy ocupa el resto con
            flex-1.
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row overflow-hidden">
        {/* Video — contenedor 9:16 estricto, alto-driven en desktop.
            ml en desktop espeja el px del bloque de copy para que el video
            no quede pegado al borde izquierdo.
            2xl: el video crece a 90vh en monitores ultrawide (≥1536px) para
            no quedar angosto al lado de un copy muy ancho. */}
        <div
          className="relative w-full md:w-auto aspect-[9/16] max-h-[70vh] md:h-[80vh] 2xl:h-[90vh] md:max-h-none md:shrink-0 md:ml-14 lg:ml-20 overflow-hidden"
          style={{ backgroundColor: "#1a0f00" }}
        >
          <VideoWithSound />
        </div>

        {/* Copy — toma el ancho restante en desktop */}
        <div
          className="w-full md:flex-1 flex items-center px-8 py-16 md:px-14 lg:px-20"
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
