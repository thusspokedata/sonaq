import type { Metadata } from "next";
import Image from "next/image";
import { CartIcon } from "@/components/store/CartIcon";

export const metadata: Metadata = {
  title: { default: "Sonaq", template: "%s | Sonaq" },
  description: "Donde el sonido descansa. Muebles y vitrinas para guitarras hechos a medida en Argentina.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f0e8" }}>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "#f5f0e8",
          borderColor: "#d4c4ae",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center" aria-label="Sonaq — inicio">
            <Image
              src="/logo-sonaq.png"
              alt="Sonaq"
              width={64}
              height={96}
              priority
              style={{ mixBlendMode: "multiply" }}
            />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/productos", label: "Productos" },
              { href: "/nosotros", label: "Nosotros" },
              { href: "/contacto", label: "Contacto" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium uppercase tracking-widest transition-colors hover:text-terracota"
                style={{ color: "#5a4535", letterSpacing: "0.12em" }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <CartIcon />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer
        className="border-t py-10"
        style={{ borderColor: "#d4c4ae", backgroundColor: "#ede5d8" }}
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p
              className="text-xl font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#b8521a" }}
            >
              Sonaq
            </p>
            <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "#5a4535" }}>
              Donde el sonido descansa
            </p>
          </div>
          <p className="text-xs" style={{ color: "#5a4535" }}>
            © {new Date().getFullYear()} Sonaq — Hecho en Argentina
          </p>
        </div>
      </footer>
    </div>
  );
}
