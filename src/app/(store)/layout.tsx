import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CartIcon } from "@/components/store/CartIcon";
import { NewsletterForm } from "@/components/store/NewsletterForm";

export const metadata: Metadata = {};

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
              style={{ mixBlendMode: "multiply", height: "auto" }}
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
        className="border-t"
        style={{ borderColor: "#d4c4ae", backgroundColor: "#ede5d8" }}
      >
        {/* Newsletter */}
        <div className="border-b py-10" style={{ borderColor: "#d4c4ae" }}>
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p
                className="text-2xl font-black uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
              >
                Novedades y lanzamientos
              </p>
              <p className="text-xs mt-1" style={{ color: "#5a4535" }}>
                Sin spam. Solo cuando hay algo nuevo.
              </p>
            </div>
            <div className="w-full md:w-80">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col gap-2">
              <p
                className="text-xl font-bold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#b8521a" }}
              >
                Sonaq
              </p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#5a4535" }}>
                Donde el sonido descansa
              </p>
              <a
                href="https://www.instagram.com/sonaq.muebles/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ color: "#5a4535" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @sonaq.muebles
              </a>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-xs" style={{ color: "#5a4535" }}>
                © {new Date().getFullYear()} Sonaq — Hecho en Argentina
              </p>
              <p className="text-xs" style={{ color: "#5a4535" }}>
                Diseñado y desarrollado con{" "}
                <span style={{ color: "#b8521a" }}>♥</span>{" "}
                por{" "}
                <a
                  href="https://github.com/thusspokedata"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                  style={{ color: "#5a4535" }}
                >
                  Thusspokedata
                </a>
              </p>
              <Link
                href="/admin/pedidos"
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "#5a4535" }}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
