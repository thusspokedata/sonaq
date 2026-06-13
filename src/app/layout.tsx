import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { BASE_URL } from "@/lib/base-url";
import { StagingBanner } from "@/components/store/StagingBanner";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "Sonaq", template: "%s | Sonaq" },
  description: "Donde el sonido descansa. Muebles y vitrinas para guitarras hechos a medida en Argentina.",
  openGraph: {
    siteName: "Sonaq",
    locale: "es_AR",
    type: "website",
    title: { default: "Sonaq", template: "%s | Sonaq" },
    description: "Donde el sonido descansa. Muebles y vitrinas para guitarras hechos a medida en Argentina.",
    url: BASE_URL,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Sonaq — Muebles para guitarras" }],
  },
  twitter: {
    card: "summary_large_image",
    title: { default: "Sonaq", template: "%s | Sonaq" },
    description: "Donde el sonido descansa. Muebles y vitrinas para guitarras hechos a medida en Argentina.",
    images: ["/og-default.jpg"],
  },
  robots: { index: true, follow: true },
};

// ─── JSON-LD: Organization + WebSite ─────────────────────────────────────────
// Datos del negocio para structured data (rich results en SERP).
// Schema.org: Organization https://schema.org/Organization
//             WebSite      https://schema.org/WebSite
// Se inyecta server-side en el body del root layout — todas las páginas lo incluyen.
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sonaq",
  url: BASE_URL,
  logo: `${BASE_URL}/logo-sonaq.png`,
  sameAs: ["https://instagram.com/sonaq.muebles"],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+5493512881616",
    email: "ventas@sonaq.com.ar",
    contactType: "customer service",
    areaServed: "AR",
    availableLanguage: "Spanish",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "12 de Octubre 441",
    addressLocality: "Malagueño",
    addressRegion: "Córdoba",
    addressCountry: "AR",
  },
  taxID: "20-26433102-2",
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sonaq",
  url: BASE_URL,
  inLanguage: "es-AR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable} h-full`}>
      <body
        className="min-h-full"
        style={{ fontFamily: "var(--font-barlow), sans-serif" }}
      >
        {/* Structured data — Organization + WebSite (rich results en Google) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
        />
        <StagingBanner />
        {children}
        <UmamiScript />
      </body>
    </html>
  );
}
