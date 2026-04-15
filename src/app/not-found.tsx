"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-barlow), sans-serif" }}
    >
      {/* Header mínimo */}
      <header
        className="border-b"
        style={{ backgroundColor: "#f5f0e8", borderColor: "#d4c4ae" }}
      >
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center">
          <Link href="/" aria-label="Sonaq — inicio">
            <Image
              src="/logo-sonaq.png"
              alt="Sonaq"
              width={64}
              height={96}
              priority
              style={{ mixBlendMode: "multiply" }}
            />
          </Link>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6">
        <p
          className="text-8xl font-bold"
          style={{
            fontFamily: "var(--font-barlow-condensed), sans-serif",
            color: "#d4c4ae",
          }}
        >
          404
        </p>

        <div className="flex flex-col gap-1">
          <h1
            className="text-2xl font-bold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              color: "#1a0f00",
            }}
          >
            Página no encontrada
          </h1>
          <p className="text-sm" style={{ color: "#5a4535" }}>
            Esta sección todavía no está disponible o la dirección no existe.
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-sm font-semibold uppercase tracking-widest border transition-colors"
            style={{
              borderColor: "#b8521a",
              color: "#b8521a",
              backgroundColor: "transparent",
            }}
          >
            ← Volver
          </button>
          <Link
            href="/"
            className="px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-colors"
            style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
          >
            Ir al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
