import Link from "next/link";

export const metadata = { title: "Productos" };

export default function ProductosAdminPage() {
  return (
    <div className="p-8 max-w-xl">
      <h1
        className="text-2xl font-bold uppercase tracking-widest mb-4"
        style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
      >
        Productos
      </h1>
      <p className="text-sm mb-6" style={{ color: "#5a4535" }}>
        El catálogo de productos se gestiona desde Sanity Studio.
      </p>
      <Link
        href="/studio"
        target="_blank"
        className="inline-block px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
        style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
      >
        Abrir Sanity Studio →
      </Link>
    </div>
  );
}
