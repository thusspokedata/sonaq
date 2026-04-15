import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Sonaq", template: "%s | Sonaq" },
  description: "Muebles y vitrinas para guitarras hechos a medida en Argentina",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-semibold tracking-tight">
            sonaq
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/productos" className="text-neutral-600 hover:text-black transition-colors">
              Productos
            </a>
            <a href="/carrito" className="text-neutral-600 hover:text-black transition-colors">
              Carrito
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Sonaq — Muebles para guitarras
      </footer>
    </div>
  );
}
