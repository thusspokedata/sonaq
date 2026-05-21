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

// Logo oficial de MercadoPago
const MP_LOGO_PATH = "/MP_RGB_HANDSHAKE_color_vertical.svg";
const MP_LOGO_EXISTS = true;
// ─────────────────────────────────────────────────────────────────────────────

function isPromoActive(): boolean {
  if (process.env.NEXT_PUBLIC_PROMO_BANNER !== "true") return false;
  return new Date() < new Date(PROMO_END_DATE);
}

// Bloque de contenido repetido para el marquee seamless
function MarqueeContent() {
  return (
    <span className="flex items-center gap-0" aria-hidden>
      <span>🎸</span>
      <span style={{ margin: "0 20px" }}>PROMO DE LANZAMIENTO</span>
      <span style={{ margin: "0 12px", opacity: 0.4 }}>·</span>
      <span style={{ margin: "0 20px" }}>3 CUOTAS SIN INTERÉS con</span>
      {MP_LOGO_EXISTS ? (
        <Image
          src={MP_LOGO_PATH}
          alt="MercadoPago"
          width={36}
          height={36}
          style={{ display: "inline-block", verticalAlign: "middle", margin: "0 8px" }}
        />
      ) : (
        /* TODO: reemplazar por logo oficial de MP en public/mercadopago-logo.svg */
        <span
          style={{
            margin: "0 8px",
            fontWeight: 700,
            color: "#009EE3",
            letterSpacing: "0.02em",
          }}
        >
          MercadoPago
        </span>
      )}
      <span style={{ margin: "0 12px", opacity: 0.4 }}>·</span>
      <span style={{ margin: "0 20px" }}>MUEBLES PARA TUS INSTRUMENTOS</span>
      <span style={{ margin: "0 12px", opacity: 0.4 }}>✦</span>
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
          animation: marquee-scroll 28s linear infinite;
        }

        .promo-track:hover {
          animation-play-state: paused;
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
        aria-label="Promoción de lanzamiento"
        style={{
          backgroundColor: "#f5f0e8",
          borderBottom: "1px solid #d4c4ae",
          position: "relative",
          overflow: "hidden",
          height: "48px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Track del marquee: contenido duplicado para loop seamless */}
        <div
          className="promo-track"
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            willChange: "transform",
            fontFamily: "var(--font-barlow-condensed), sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#1a0f00",
          }}
        >
          {/* Duplicado para loop seamless: el primer set ocupa el 50%, el
              segundo el otro 50%. Al llegar a -50% se reinicia sin salto. */}
          <MarqueeContent />
          <MarqueeContent />
        </div>

        {/* Botón cerrar */}
        <button
          onClick={() => setClosed(true)}
          aria-label="Cerrar banner promocional"
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#5a4535",
            fontSize: "18px",
            lineHeight: 1,
            padding: "4px 6px",
            opacity: 0.6,
            zIndex: 10,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.6")}
        >
          ×
        </button>
      </div>
    </>
  );
}
