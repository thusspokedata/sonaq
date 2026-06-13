import Script from "next/script";

/**
 * Tracker de Umami (analytics self-hosted, cookieless, sin almacenamiento
 * de IPs ni perfiles personales).
 *
 * Gating de carga (defense in depth):
 *  1. `NODE_ENV !== "production"` → no renderizamos el <script>. Evita
 *     que dev local baje el JS y dispare requests innecesarios.
 *  2. `data-domains="sonaq.com.ar"` → Umami solo emite eventos cuando el
 *     dominio del request matchea uno de la lista. Filtra staging
 *     (staging.sonaq.com.ar) y previews aunque éstos también corran con
 *     NODE_ENV=production. Nginx prod redirige www→apex (301), así que no
 *     hace falta listar www.
 *
 * Todos los valores tienen defaults hardcodeados (público — son los de
 * sonaq.com.ar) y son overrideables via env vars NEXT_PUBLIC_* para
 * facilitar el reuso en otros proyectos. Recordatorio: NEXT_PUBLIC_* se
 * congela en BUILD TIME — si cambiás la env var, hay que rebuildear.
 */
const DEFAULT_SRC = "https://umami.lahuelladelcaminante.de/script.js";
const DEFAULT_WEBSITE_ID = "f32589aa-48ac-41b0-8c9d-1d52ae01d40d";
const DEFAULT_DOMAINS = "sonaq.com.ar";

export function UmamiScript() {
  if (process.env.NODE_ENV !== "production") return null;

  const src = process.env.NEXT_PUBLIC_UMAMI_SRC || DEFAULT_SRC;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || DEFAULT_WEBSITE_ID;
  const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS || DEFAULT_DOMAINS;

  return (
    <Script
      src={src}
      data-website-id={websiteId}
      data-domains={domains}
      strategy="afterInteractive"
    />
  );
}
