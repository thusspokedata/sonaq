# Informe de auditoría pre-PR — `fix/homepage-hero-and-image`

## Commits auditados
1. `fix: reemplazar video del hero por imagen estática y arreglar imagen rota en sección de presentación`
2. `feat: mover video de YouTube a sección 'Más que un mueble' con autoplay silencioso` + ajuste cover 50/50
3. `fix: reemplazar favicon con logo de Sonaq`

## Agentes corridos
- `review` (built-in)
- `ui` (agente propio del proyecto)

---

## Hallazgos bloqueantes

### 1. Errores ortográficos en `page.tsx` — 6 instancias

Regresiones introducidas al reescribir el archivo. Todos visibles en producción.

| Texto actual | Texto correcto | Ubicación |
|---|---|---|
| `Proximamente` | `Próximamente` | Estado vacío de productos |
| `Volva pronto.` | `Volvé pronto.` | Estado vacío de productos |
| `Mas que un mueble,` | `Más que un mueble,` | h2 sección presentación |
| `coleccion` | `colección` | Párrafo sección presentación |
| `diseno` | `diseño` | Párrafo sección presentación |
| `Por que Sonaq` | `Por qué Sonaq` | Encabezado propuesta de valor |

### 2. `<iframe>` decorativo accesible por teclado — `page.tsx`

El iframe tiene `pointerEvents: "none"` y `disablekb=1` (no interactivo) pero NO tiene `tabIndex={-1}` ni `aria-hidden="true"`. Resultado: usuarios de teclado llegan al frame con Tab pero no pueden hacer nada. Viola WCAG 2.1 SC 2.1.1.

**Fix:** agregar `tabIndex={-1}` y `aria-hidden="true"` al `<iframe>`, y eliminar el `title` (si es decorativo, no necesita título).

---

## Hallazgos opcionales (no bloqueantes)

| # | Issue | Archivo |
|---|---|---|
| 3 | `<section>` sin `aria-label`/`aria-labelledby` (WCAG AAA) | `page.tsx` |
| 4 | `textShadow` como inline style sin constante extraída | `page.tsx` |
| 5 | `height: "clamp(480px, 90vh, 1000px)"` inline sin constante | `page.tsx` |

---

## Issue descartado

- **Logo `height={96}` + `height: "auto"` en `layout.tsx`**: el agente `ui` lo detectó, pero **ya estaba arreglado** en este branch. El logo ahora usa `className="w-16 h-auto"` + `style={{ mixBlendMode: "multiply" }}`, sin conflicto.

---

## Cambios correctos (sin issues)

- ✅ Hero con `<Image fill priority sizes="100vw">` — correcto para LCP
- ✅ `foto1.jpeg` commiteado y trackeado — arregla imagen rota en producción
- ✅ Layout iframe cover 50/50 con `aspectRatio: "9/16"` + translate — limpio
- ✅ `loading="lazy"` en iframe (está debajo del fold)
- ✅ `pointerEvents: "none"` — el video es decorativo
- ✅ Video preservado para uso futuro
- ✅ Favicon reemplazado correctamente (`.ico` + `icon.png` para compatibilidad)
- ✅ `favicon.ico` bajó de 25KB → 3.8KB

---

## Próximo paso

El PM decide qué issues se corrigen. Los bloqueantes recomendados (1 y 2) son todos correcciones de texto — rápido de aplicar. Una vez confirmado, Claude Code ejecuta los fixes y crea el PR.
