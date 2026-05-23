import type { Metadata } from "next";
import { BASE_URL } from "@/lib/base-url";

const HEADING_FONT = { fontFamily: "var(--font-barlow-condensed), sans-serif" };

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Sonaq es un taller en Malagueño, Córdoba, dedicado a diseñar y fabricar vitrinas y muebles a medida para guitarristas. Diseño, oficio y permanencia.",
  alternates: { canonical: `${BASE_URL}/nosotros` },
  openGraph: {
    title: "Quiénes somos — Sonaq",
    description:
      "Taller en Malagueño, Córdoba, dedicado a diseñar y fabricar vitrinas y muebles a medida para guitarristas. Diseño, oficio y permanencia.",
    url: `${BASE_URL}/nosotros`,
    type: "website",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Sonaq — Muebles para guitarras" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiénes somos — Sonaq",
    description:
      "Taller en Malagueño, Córdoba, dedicado a diseñar y fabricar vitrinas y muebles a medida para guitarristas.",
    images: ["/og-default.jpg"],
  },
};

export default function NosotrosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4 text-[#b8521a]">
        Nosotros
      </p>
      <h1
        className="text-5xl font-black uppercase leading-tight mb-12 text-[#1a0f00]"
        style={HEADING_FONT}
      >
        Quiénes somos
      </h1>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-[#5a4535]">
        <p className="text-base font-semibold text-[#1a0f00]">
          SONAQ nace del encuentro entre diseño, funcionalidad y oficio.
        </p>

        <p>
          Creamos mobiliario y objetos pensados para integrarse de forma natural a los espacios y a
          la manera de habitarlos. Cada pieza está diseñada para exhibir, organizar y cuidar
          instrumentos musicales con el mismo nivel de atención que merece cada instrumento.
        </p>

        <p>
          Cada proyecto parte de una idea clara: combinar estética, utilidad y detalle en piezas
          que transmitan identidad y permanencia.
        </p>

        <p>
          Pensamos nuestras piezas para músicos y personas que saben valorar sus instrumentos,
          entendiendo que forman parte de su identidad y merecen un espacio pensado con cuidado y
          sensibilidad.
        </p>

        <p>
          Entendemos el diseño como un proceso en constante evolución, donde la exploración de
          materiales, proporciones y soluciones constructivas forma parte esencial del resultado
          final.
        </p>
      </div>
    </div>
  );
}
