# Sonaq — Onboarding para nuevo chat

## El proyecto

**Sonaq** es un e-commerce argentino de muebles y vitrinas para guitarras, hecho a medida. Sitio: [sonaq.com.ar](https://sonaq.com.ar) | Staging: [staging.sonaq.com.ar](https://staging.sonaq.com.ar)

**Stack:**
- Next.js 16 (App Router) · TypeScript · Tailwind CSS
- Sanity CMS (contenido/productos, dataset `production` y `staging`)
- PostgreSQL en Neon · Prisma ORM
- NextAuth v5 (JWT, rol ADMIN para el panel)
- MercadoPago Checkout Pro (pagos)
- Resend (emails transaccionales)
- VPS propio · PM2 · Nginx · Certbot

---

## Arquitectura clave

```
src/
  app/
    layout.tsx        # Root layout: metadata global + JSON-LD Organization + WebSite
    sitemap.ts        # Sitemap dinámico (revalida 1h) con productos + lastModified
    robots.ts         # Robots: allow / + disallow admin/api/studio; noindex en staging
    (store)/          # Tienda pública — layout con header + footer
      page.tsx        # Home con metadata SEO + hero + video YouTube + secciones
      productos/      # Listado + PDP con generateMetadata + JSON-LD Product + Breadcrumbs
      checkout/       # Formulario + server action createOrder() (noindex)
      gracias/        # Confirmación post-compra MP/transferencia (noindex)
      carrito/        # Vista del carrito (noindex)
      nosotros/       # Página de marca con metadata SEO
      contacto/       # Contacto WhatsApp + email con metadata SEO
    (admin)/admin/    # Panel protegido por rol ADMIN
      pedidos/        # Listado y detalle con cambio de estado
      cuenta/         # Datos de la cuenta
    api/
      auth/           # NextAuth handlers
      webhooks/
        mercadopago/  # Webhook MP — verifica HMAC-SHA256, actualiza orden
    studio/           # Sanity Studio embebido
  lib/
    cart-store.ts     # Zustand, persistido en localStorage
    emails.ts         # Templates HTML + wrapper EMAIL_DRY_RUN
    mercadopago.ts    # createMPPreference() — usa sandbox en TEST tokens
    rate-limit.ts     # In-memory sliding window (RATE_LIMIT_DISABLED para staging)
    base-url.ts       # Usa NEXT_PUBLIC_SITE_URL ?? NEXT_PUBLIC_BASE_URL
  components/store/   # Componentes de la tienda (PromoBanner, VideoWithSound, etc.)
  sanity/             # Schemas, queries GROQ (incluye SITEMAP_PRODUCTS_QUERY), cliente

public/
  og-default.jpg      # Open Graph fallback 1200×630 (home + páginas sin imagen propia)
  logo-sonaq.png      # Logo del header
  MP_RGB_HANDSHAKE_color_vertical.svg  # Logo oficial MercadoPago (banner promocional)
```

**SEO foundation** (mergeado en PRs #57 + #58 el 2026-05-23):
- Metadata por página: home, /productos, /nosotros, /contacto, PDP — todas con title/description/canonical/OG/Twitter
- JSON-LD `Organization` + `WebSite` en root layout
- JSON-LD `Product` (con offers/availability) + `BreadcrumbList` en la PDP
- Páginas privadas (`/carrito`, `/checkout`, `/gracias`) con `robots: noindex, nofollow`
- `og-default.jpg` 1200×630 como fallback OG

**Flujo de compra MercadoPago:**
1. `createOrder()` crea orden en DB (status `PENDING`)
2. `createMPPreference()` genera preferencia en MP y devuelve `initPoint`
3. `CheckoutForm` redirige con `window.location.href`
4. MP redirige de vuelta a `/gracias?orden=...&mp=success|failure|pending`
5. Webhook `/api/webhooks/mercadopago` actualiza status en DB

**Emails:** `EMAIL_DRY_RUN=true` en staging — los emails se loguean en PM2 en vez de enviarse. Se envían dos por pedido: confirmación al cliente + notificación al equipo (ventas@sonaq.com.ar).

---

## Entornos

| Entorno | URL | Puerto PM2 | DB |
|---|---|---|---|
| Producción | sonaq.com.ar | `$PORT_PROD` | Neon branch `main` |
| Staging | staging.sonaq.com.ar | `$PORT_STAGING` | Neon branch `staging` |

**Deploy (siempre desde la Mac, nunca en el VPS — no tiene RAM):**
```bash
# Producción
bash deploy.sh

# Staging
nvm use 22 && bash deploy-staging.sh
```

⚠️ **Gotcha**: antes de correr `deploy.sh`, **matar el `next dev` local de Sonaq** (`pgrep -f "sonaq.*next dev"` + `kill <pid>`). El dev server churnea archivos en `.next/dev/cache/turbopack/` y el `rsync -az --delete .next/` falla con `open (2): No such file or directory`. Si querés mantener dev activo, agregá `--exclude='dev/' --exclude='cache/'` al rsync (no está hoy en `deploy.sh`).

PM2 staging usa un wrapper script en el VPS que hace `set -a; source .env.staging; set +a` antes de arrancar Next.js (el `env_file` de PM2 no parsea comillas correctamente).

---

## Cómo trabajar con el usuario

**Workflow de código:**
- Para cambios significativos: crear branch → implementar → PR → esperar CodeRabbit → aplicar fixes → mergear
- Para fixes simples (doc-only, backlog updates): commitear directo en main está bien
- Antes de mergear un PR, siempre revisar si CodeRabbit dejó comentarios (`gh pr view <n> --comments`)
- CodeRabbit a veces falla con "Review failed — error occurred". Retriggear con `gh pr comment <n> --body "@coderabbitai full review"` y esperar 1-2 min.
- Todos los commits van firmados: `git commit -S` (Bitwarden SSH agent — el usuario aprueba la firma)
- Si Bitwarden está bloqueado, el commit/push falla con error de SSH — avisar al usuario para desbloquearlo
- **Sin atribución a Claude/Anthropic** en commits ni PR bodies
- Para PRs grandes, auditoría con agentes en paralelo (`ui` + `general-purpose`); reportan a texto, **no se commitea ningún `.md` de auditoría** (la convención de `docs/prompts/audit-*.md` se descartó el 2026-05-23 — los archivos legacy ya en main se dejan, no se crean más)

**Backlog y planificación:**
- La fuente de verdad de items pendientes es **`docs/backlog.md`** (Seguridad, Notificaciones, Admin, Confianza/legal, Deploy, SEO, Newsletter, Tooling/CodeRabbit, UX/Futuro)
- Cuando CodeRabbit deja un nit que decidimos no aplicar, anotarlo en `docs/backlog.md` con la decisión explícita

**Estilo de comunicación:**
- El usuario habla en español rioplatense, responder en español
- Respuestas concisas — no repetir lo que ya se hizo, ir al punto
- Si hay mucho por hacer, proponer crear un branch antes de arrancar
- Pedir confirmación antes de operaciones destructivas o mutaciones en servicios externos (MP, Resend, gh api con POST/DELETE, etc.)

**Convenciones del código:**
- Diseño: paleta terracota (`#b8521a`), oscuro (`#1a0f00`), neutros arena. Sin librerías de UI externas — todo CSS inline o Tailwind
- Sin comentarios obvios en el código
- Server Components por defecto; `"use client"` solo cuando sea necesario
- Los `NEXT_PUBLIC_*` se hornean en build time — si se agregan nuevas variables públicas, hay que rebuild

**Seguridad:**
- Antes de mergear features de pago o auth, correr `/security-review`
- El webhook de MP verifica firma HMAC-SHA256 con `MP_WEBHOOK_SECRET`
- Rate limiting en checkout (5/hora) y newsletter (3/10min) — desactivable con `RATE_LIMIT_DISABLED=true` en staging

---

## Estado actual (cierre 2026-05-23)

**En main + deployado a producción** (https://sonaq.com.ar):
- ✅ Flujo completo de MercadoPago (preference → redirect → webhook con HMAC → /gracias con estados success/pending/failure)
- ✅ Email de confirmación MP **solo tras pago aprobado** vía webhook (PR #51) — antes se mandaba prematuramente
- ✅ Datos bancarios + instrucciones en email de transferencia (PR #48)
- ✅ Carrito se limpia al confirmar pago, distinguiendo estados en /gracias (PR #53)
- ✅ Banner promocional con marquee de 3 cuotas sin interés + logo MP (PRs #47, #54, #59)
- ✅ Hero con imagen en orientación natural + texto a la derecha (PR #55)
- ✅ Sección "Más que un mueble" con video YouTube en 9:16 (PR #54), nuevo VIDEO_ID `rkoVntX4oVY` del canal Sonaq
- ✅ Selector de color con texturas (Faplac/Egger) en PDP
- ✅ Páginas Nosotros + Contacto con metadata SEO propia
- ✅ Panel admin con gestión de pedidos
- ✅ **SEO foundation (PR #57)**: metadata por página, JSON-LD Organization+WebSite, Product en PDP con offers/availability, sitemap.ts dinámico con `_updatedAt` de Sanity, robots.ts con disallow correcto, noindex en privadas
- ✅ **Breadcrumbs visibles + BreadcrumbList JSON-LD** en PDP (PR #58)
- ✅ Banner sin logo de Sonaq duplicado (PR #59) — header del layout ya tiene el logo

**Sin branches abiertas en GitHub** (todas las PRs de SEO + UI mergeadas y deployadas).

**Backlog**: ver `docs/backlog.md` para items pendientes con prioridades. Highlights:
- **Alta**: validar precios server-side antes de crear orden (bloqueante para activar MP en prod), completar `[COMPLETAR]` en `/terminos` y `/privacidad` (CUIT + domicilio legal)
- **Media**: refinar Product JSON-LD (itemCondition, sku dedicado en Sanity, image variants 4:3/16:9), enviar campañas a suscriptores Resend
- **Baja**: varios pulidos SEO (DRY descripciones, hardening JSON-LD, lastModified strategy), pulidos breadcrumbs, double-Sonaq en title de /gracias, `LocalBusiness` JSON-LD si Sonaq atiende público en Malagueño
