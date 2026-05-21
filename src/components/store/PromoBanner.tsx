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
  return new Date() < new Date(PROMO_END_DATE);
}

// Bloque de contenido repetido para el marquee seamless
function MarqueeContent() {
  return (
    <span className="promo-segment" aria-hidden>
      <span>🎸</span>
      <span style={{ margin: "0 24px" }}>PROMO DE LANZAMIENTO</span>
      <span style={{ margin: "0 16px", opacity: 0.35 }}>·</span>
      <span style={{ margin: "0 24px" }}>3 CUOTAS SIN INTERÉS con</span>
      <Image
        src="/MP_RGB_HANDSHAKE_color_vertical.svg"
        alt="MercadoPago"
        width={52}
        height={52}
        style={{ display: "inline-block", verticalAlign: "middle", margin: "0 10px" }}
      />
      <span style={{ margin: "0 16px", opacity: 0.35 }}>·</span>
      <span style={{ margin: "0 24px" }}>MUEBLES PARA TUS INSTRUMENTOS</span>
      <span style={{ margin: "0 16px", opacity: 0.35 }}>✦</span>
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
          animation: marquee-scroll 32s linear infinite;
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
            justify-content: center;
          }
        }
      `}</style>

      <div
        role="banner"
        aria-label="Promoción de lanzamiento: 3 cuotas sin interés con MercadoPago"
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
            zIndex: 2,
          }}
        >
          <Image
            src="/logo-sonaq.png"
            alt="Sonaq"
            width={52}
            height={58}
            style={{
              width: "auto",
              height: "58px",
              mixBlendMode: "multiply",
            }}
          />
        </div>

        {/* ── Área del marquee (flex:1, overflow hidden) ───────────────────── */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {/* Track: duplicado para loop seamless (-50% = exactamente 1 copia) */}
          <div
            className="promo-track"
            style={{
              display: "inline-flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              willChange: "transform",
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#1a0f00",
            }}
          >
            <MarqueeContent />
            <MarqueeContent />
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
            zIndex: 2,
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
