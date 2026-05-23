"use client";

/**
 * NOTA DE NEGOCIO:
 * Este banner promete "3 cuotas sin interés con MercadoPago".
 * Para que esto sea válido, la cuenta de MercadoPago de Sonaq debe tener
 * configurada la promoción de cuotas sin interés (panel MP → Costos y cuotas),
 * o el negocio debe absorber el costo financiero de las cuotas.
 * Confirmar con el dueño antes de activar en producción
 * (NEXT_PUBLIC_PROMO_BANNER=true en el .env de prod).
 *
 * Control de visibilidad:
 *   - NEXT_PUBLIC_PROMO_BANNER=true/false  → master switch manual
 *   - PROMO_END_DATE (constante abajo)     → fecha de expiración automática
 * El banner se muestra solo si AMBAS condiciones se cumplen.
 * Para extender la promo, cambiá PROMO_END_DATE.
 */

import { useState } from "react";
import Image from "next/image";

// ─── Configuración de la promo ───────────────────────────────────────────────
// Cambiá esta fecha para extender o acortar la promo de lanzamiento.
const PROMO_END_DATE = "2026-07-31";
// ─────────────────────────────────────────────────────────────────────────────

function isPromoActive(): boolean {
  if (process.env.NEXT_PUBLIC_PROMO_BANNER !== "true") return false;
  // T23:59:59-03:00 → corte a medianoche hora Argentina, sin drift por timezone
  return new Date() < new Date(PROMO_END_DATE + "T23:59:59-03:00");
}

// Bloque de contenido del marquee — duplicado para loop seamless
// isHidden: true en la copia duplicada para no repetir el contenido a lectores de pantalla
function MarqueeContent({ isHidden = false, className }: { isHidden?: boolean; className?: string }) {
  return (
    <span className={`promo-segment${className ? ` ${className}` : ""}`} aria-hidden={isHidden || undefined}>
      <span>Pagá en 3 cuotas sin interés con tarjetas Visa y Mastercard bancarizadas, a través de</span>
      <Image
        src="/MP_RGB_HANDSHAKE_color_vertical.svg"
        alt="MercadoPago"
        width={40}
        height={40}
        style={{ display: "inline-block", verticalAlign: "middle", margin: "0 10px" }}
      />
      <span style={{ margin: "0 32px", opacity: 0.3 }}>·</span>
    </span>
  );
}

export function PromoBanner() {
  const [closed, setClosed] = useState(false);

  if (!isPromoActive() || closed) return null;

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .promo-track {
          animation: marquee-scroll 36s linear infinite;
        }

        .promo-track:hover {
          animation-play-state: paused;
        }

        .promo-segment {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .promo-track {
            animation: none;
          }
          .promo-duplicate {
            display: none;
          }
        }
      `}</style>

      <div
        role="banner"
        aria-label="Oferta de lanzamiento: pagá en 3 cuotas sin interés con tarjetas Visa y Mastercard bancarizadas, a través de MercadoPago"
        style={{
          backgroundColor: "#f5f0e8",
          borderBottom: "1px solid #d4c4ae",
          height: "88px",
          display: "flex",
          alignItems: "stretch",
          position: "relative",
        }}
      >
        {/* ── Logo Sonaq fijo a la izquierda ───────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            paddingLeft: "20px",
            paddingRight: "20px",
            borderRight: "1px solid #d4c4ae",
            backgroundColor: "#f5f0e8",
          }}
        >
          {/* Props alineadas con el tamaño realmente mostrado (sin override CSS):
              el archivo intrínseco es 52×58, pero el banner usa el logo a 52px de
              alto. Pasando width/height ya en esa proporción evitamos el warning
              "modified, but not the other" de next/image. */}
          <Image
            src="/logo-sonaq.png"
            alt="Sonaq"
            width={47}
            height={52}
            style={{ mixBlendMode: "multiply" }}
          />
        </div>

        {/* ── Columna derecha: título fijo + marquee ───────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "4px",
            minWidth: 0,
            paddingLeft: "20px",
          }}
        >
          {/* Renglón 1 — fijo, no se mueve */}
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#b8521a",
              whiteSpace: "nowrap",
            }}
          >
            Oferta de lanzamiento
          </p>

          {/* Renglón 2 — marquee */}
          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <div
              className="promo-track"
              style={{
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                willChange: "transform",
                fontFamily: "var(--font-barlow-condensed), sans-serif",
                fontSize: "19px",
                fontWeight: 500,
                letterSpacing: "0.04em",
                color: "#1a0f00",
              }}
            >
              <MarqueeContent />
              <MarqueeContent isHidden className="promo-duplicate" />
            </div>
          </div>
        </div>

        {/* ── Botón cerrar ─────────────────────────────────────────────────── */}
        <button
          onClick={() => setClosed(true)}
          aria-label="Cerrar banner promocional"
          style={{
            flexShrink: 0,
            alignSelf: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#5a4535",
            fontSize: "22px",
            lineHeight: 1,
            padding: "6px 16px",
            opacity: 0.5,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.5")}
        >
          ×
        </button>
      </div>
    </>
  );
}
