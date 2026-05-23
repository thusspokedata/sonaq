# Backlog

## Seguridad

### Validar precios en el servidor antes de crear la orden
**Prioridad:** Alta — bloqueante antes de activar MercadoPago  
**Contexto:** Los precios de los items llegan del cart en Zustand (localStorage). Un usuario puede modificarlos en DevTools y crear una orden con `price: 1`. Actualmente el riesgo es bajo porque MercadoPago no está activo, pero hay que resolverlo en el PR de integración de MP.  
**Solución:** En `src/app/(store)/checkout/actions.ts`, re-fetch los precios reales desde Sanity usando los `productId` de los items antes de crear la orden, y comparar con los precios recibidos del cliente.

---

## Notificaciones / Email (Resend)

### Emails al confirmar una orden
**Prioridad:** Alta  
**Contexto:** Actualmente ninguna de las partes recibe un email al completarse una compra. El equipo de Sonaq no se entera hasta que revisa la DB manualmente.  
**Solución:** En `src/app/(store)/checkout/actions.ts`, tras `prisma.order.create`, enviar dos emails con Resend: al cliente con detalle del pedido y al equipo de Sonaq con los datos del cliente.

---

## Panel de administración

### Vista de pedidos para el equipo de Sonaq
**Prioridad:** Media — diferir hasta que el volumen lo justifique (por ahora Neon console es suficiente)  
**Contexto:** No hay interfaz para que Sonaq vea, filtre o gestione los pedidos sin acceder directamente a la DB.  
**Solución:** Ruta Next.js protegida `/admin/pedidos` con lista, filtros por estado y botones para cambiar estado. Auth con NextAuth.

---

## Confianza y legal

### Completar datos de empresa en páginas legales
**Prioridad:** Alta — las páginas `/terminos` y `/privacidad` tienen `[COMPLETAR]` como placeholder  
**Contexto:** Se necesita el CUIT y el domicilio legal exacto de Sonaq para cumplir con el art. 8 de la Ley 24.240.  
**Solución:** Reemplazar `[COMPLETAR]` en `src/app/(store)/terminos/page.tsx` y `src/app/(store)/privacidad/page.tsx`.

### Indicador de compra segura en checkout
**Prioridad:** Baja  
**Solución:** Pequeño bloque debajo del botón "Confirmar pedido" con íconos de candado y texto "Compra 100% segura".

---

## Deploy pendiente tras merge de PRs

### Migraciones en VPS
**Prioridad:** Alta — sin esto la VPS corre con un schema desactualizado  
**Solución:** En la VPS, tras `git pull` y `npm run build`:
```bash
source ~/.nvm/nvm.sh && nvm use 20
npx prisma migrate deploy
```

---

## SEO

### Imagen por defecto para Open Graph (`/public/og-default.jpg`)
**Prioridad:** Baja  
**Contexto:** El root layout y el PDP referencian `/og-default.jpg` como fallback cuando un producto no tiene imagen en Sanity. Si el archivo no existe, los crawlers de WhatsApp/Twitter/LinkedIn mostrarán la card sin imagen.  
**Solución:** Crear una imagen de 1200×630px con el logo de Sonaq sobre fondo beige (`#f5f0e8`) y subirla a `public/og-default.jpg`. Se puede hacer en Canva o Figma.

---

### Double-Sonaq en `<title>` de `/gracias`
**Prioridad:** Baja (cosmético)
**Contexto:** El root layout define `title.template = "%s | Sonaq"` para que cada página termine en " | Sonaq" automáticamente. La página `/gracias` tiene hoy `title: "Tu pedido — Sonaq"` (con Sonaq hardcodeado), así que el template produce `"Tu pedido — Sonaq | Sonaq"` — duplicación visible en la pestaña del browser y en el SERP si alguna vez se indexara (hoy es noindex).
**Solución:** En `src/app/(store)/gracias/page.tsx`, cambiar `title: "Tu pedido — Sonaq"` por `title: "Tu pedido"` y dejar que el template del root layout agregue `" | Sonaq"`. Cambio de 1 línea.

---

## Newsletter

### Envío de campañas a suscriptores
**Prioridad:** Media  
**Contexto:** Los emails captados en el footer se guardan en Resend Audiences. Hoy no hay forma de enviar un email a toda la lista desde la app — hay que hacerlo manualmente desde el dashboard de Resend (Broadcasts). Funciona para el volumen actual pero no escala bien.  
**Solución:** Evaluar dos opciones: (1) seguir usando Resend Broadcasts manualmente para anuncios puntuales, o (2) construir un formulario en el panel admin (`/admin/newsletter`) que llame a la API de Resend para crear y enviar un broadcast programáticamente.

---

## Tooling / CodeRabbit

### Nit no aplicado sobre informe de auditoría legacy
**Prioridad:** Baja (informativo)
**Contexto:** En la review de [PR #54](https://github.com/thusspokedata/sonaq/pull/54), CodeRabbit dejó un nit clasificado por él mismo como "💤 Low value" sobre `docs/prompts/audit-fix-responsive-banner-video.md:60`: la referencia hardcodeada `[VideoWithSound.tsx:84-85]` se va a poner stale cuando ese archivo cambie. **No se aplicó el fix** porque la convención de commitear informes de auditoría en `docs/prompts/` se descartó (decisión de proceso 2026-05-23) y los archivos legacy que ya están en `main` se dejan como están sin reescribir historia. Si en algún momento se limpia el directorio, el archivo se borra y el nit muere con él.
**Solución:** Ninguna acción inmediata. Si más adelante se decide borrar los audits legacy de `docs/prompts/`, este nit queda resuelto por descarte.

---

### Ruido del check "Docstring Coverage" en PRs de UI/CSS
**Prioridad:** Baja
**Contexto:** El pre-merge check de CodeRabbit "Docstring Coverage" falla con warning ⚠️ en cualquier PR de presentación sin funciones documentables nuevas. Apareció en los PRs #54, #55 y #56 — ruido recurrente sin señal real para cambios de UI/CSS. Hoy se ignora a mano.
**Solución:** En `.coderabbit.yaml`, configurar el check para skip cuando el changeset es solo `.tsx`/`.css` sin nuevas funciones exportadas, bajar el umbral, o desactivar el check. Ver docs de CodeRabbit pre-merge checks.

---

## UX / Futuro

- MercadoPago Checkout Pro con cuotas (bloqueante: validar precios server-side primero)
- Página `/nosotros`
- Indicador de compra segura en checkout
