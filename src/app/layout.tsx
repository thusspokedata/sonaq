import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
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
  title: { default: "Sonaq", template: "%s | Sonaq" },
  description: "Donde el sonido descansa. Muebles y vitrinas para guitarras hechos a medida en Argentina.",
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
        {children}
      </body>
    </html>
  );
}
