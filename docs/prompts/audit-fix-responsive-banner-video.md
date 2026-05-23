# Informe de auditoría pre-PR — `fix/responsive-banner-video`

## Commits auditados
1. `dee1aba` — fix: ajustes responsive de banner promocional y video en homepage
2. `c4846c3` — fix: corregir recorte del video en desktop usando alto-driven aspect-ratio
3. `10995e7` — fix: agregar inset izquierdo al video en desktop para balance con copy

## Agentes corridos
- `ui` (agente propio del proyecto — UI/CSS/Tailwind/accesibilidad)
- `general-purpose` (revisor general — regresiones, calidad de código, convenciones)

---

## Hallazgos bloqueantes

**Ninguno.** Ambos agentes coinciden: branch lista para PR. La lógica funcional no se tocó (`setClosed`, `isPromoActive` con timezone `-03:00`, toggle de sonido del video siguen intactos).

---

## Hallazgos opcionales (no bloqueantes)

| # | Issue | Archivo | Fuente |
|---|---|---|---|
| 1 | `role="banner"` en el div del marquee choca semánticamente con el `<header>` del layout. ARIA permite UN solo landmark `banner` por documento — `<header>` directo de `<body>` ya implica `role=banner`. Considerar quitar el atributo o cambiar a `role="region"` con `aria-label`. | `PromoBanner.tsx` (raíz del banner) | ui |
| 2 | Breakpoint mobile `max-width: 767px` hardcodeado en el `<style>` interno. Coincide hoy con `md` (768px) de Tailwind v4, pero es un magic number desacoplado del theme — drift silencioso si alguien toca breakpoints. | `PromoBanner.tsx` (`.promo-logo` media query) | ui |
| 3 | Magic numbers `md:ml-14 lg:ml-20` espejan el `md:px-14 lg:px-20` del bloque copy. Acoplamiento implícito: si alguien cambia el padding del copy, el inset del video se desincroniza silenciosamente. Una variable CSS compartida (`--section-inset`) lo evitaría. | `page.tsx:158` | ui + gp |
| 4 | Logo MP creció de 40→48px pero `height: 88px` del banner sigue igual. Sobra holgura — no rompe, pero el banner podría apretarse a ~72-76px para verse más equilibrado. | `PromoBanner.tsx` (root `<div>` del banner) | ui + gp |
| 5 | En viewports ultrawide (>1600px) el video queda angosto (~45vh ≈ 360-500px según monitor) al lado de un copy gigante. Acotar con `lg:h-[min(80vh,720px)]` o un `max-w-*` daría más balance visual. | `page.tsx:158` | ui |
| 6 | Mobile landscape (~800×400): `max-h-[70vh]` ≈ 280px + `aspect-[9/16]` → el ancho derivado sería ~157px, dejando barras laterales `#1a0f00` (lo opuesto al problema original). No es un break — solo ocurre en orientación landscape de mobile, niche. Considerar relajar `max-h` o usar `min(70vh, …)`. | `page.tsx:158` | gp |
| 7 | El botón `×` de cerrar usa `<button>` sin `type="button"`. Innocuo acá (no hay `<form>` ancestral) pero es la convención del codebase chequearlo. | `PromoBanner.tsx` (botón cerrar) | ui |
| 8 | Comentario en bloque `page.tsx:145-152` aproxima "~45vh ≈ 400-500px" — depende del alto del viewport (en 1440px de alto da 648px). No es incorrecto, solo confunde. | `page.tsx:144-152` | gp |

---

## Observación fuera del diff

- **`VideoWithSound.tsx:151-153`** — comentario "simula object-fit cover para iframes" quedó **stale**: ahora el padre tiene aspect-ratio 9:16 estricto y el video se muestra completo (sin cover/recorte). El wrapper interno con `aspectRatio: "9 / 16"` es redundante. Podríamos limpiar el comentario o el wrapper en este PR (1 línea), o dejarlo para uno separado.

---

## Cambios correctos (sin issues)

- ✅ Fix del recorte del video: pasar de `min-height + w-1/2` (que clampaba mal con `max-h`) a `aspect-[9/16] + md:h-[80vh] + md:max-h-none` es la solución limpia. Browser engines modernos calculan `width = height × ratio` correctamente con `md:w-auto`.
- ✅ `md:shrink-0` aplicado: previene que flex comprima el video bajo su intrinsic size.
- ✅ `md:max-h-none` cancela explícitamente el `max-h-[70vh]` mobile (cascada Tailwind correcta) — sin conflictos de specificity.
- ✅ Mover el styling del logo Sonaq a clase CSS `.promo-logo` con media query es coherente con `.promo-track`/`.promo-segment` ya existentes. Patrón consistente del componente.
- ✅ Logo Sonaq oculto en mobile (`<768px`) resuelve la duplicación con el `<header>` sticky del layout — confirmado contra `layout.tsx`.
- ✅ Logo MP 40→48px con margen `12px`: cambio puramente visual, sin impacto en accesibilidad (alt sigue, role sigue), no deforma (viewBox cuadrado 700×700).
- ✅ `prefers-reduced-motion` intacto — la lógica del marquee no se tocó.
- ✅ `aria-hidden` en la copia duplicada del marquee preservado.
- ✅ Comentarios JSDoc-style en `page.tsx` y `PromoBanner.tsx` explican el **porqué**, no el qué.
- ✅ TypeScript intacto, sin nuevas dependencias, cero impacto en bundle.
- ✅ Sin afectación a LCP — el hero `priority` sigue arriba; el video queda debajo y no es LCP.
- ✅ Sin CLS — el contenedor reserva su aspect-ratio antes de que YouTube cargue.

---

## Issues descartados

- **iframe a11y**: `VideoWithSound` ya setea `tabindex="-1"` y `aria-hidden="true"` en `onReady` ([VideoWithSound.tsx:84-85](src/components/store/VideoWithSound.tsx#L84-L85)). No es un issue.
- **Layout shift / CLS**: el `aspect-[9/16]` reserva el espacio antes de cargar el iframe.
- **Specificity inline vs Tailwind**: el `backgroundColor` inline en el contenedor del video no choca con clases (no hay `bg-*` Tailwind ahí).
- **`md:w-auto` en flex item**: navegadores modernos calculan `width = height × ratio` correctamente cuando hay `aspect-ratio` + height definido. No es bug.
- **Seguridad / auth / pagos**: no se tocó nada de eso.
- **`VIDEO_ID` del canal "Kilo Sastre"**: tema conocido aparte, fuera de scope de este branch.

---

## Próximo paso

El PM decide qué opcionales se corrigen antes del PR. Los más bajos en costo/riesgo y con mayor retorno visible son:

- **#1** (role="banner" duplicado) — 1 línea, a11y win real.
- **#3** (acoplamiento ml/px copy) — solo si querés blindar contra drift; opcional.
- **#5** (ultrawide cap) — 1 clase Tailwind extra si lo viste descompensado.

Los demás son nits de mantenimiento. Una vez confirmados los fixes, se aplica un commit firmado y se abre el PR contra `main`.
