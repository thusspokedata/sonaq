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
    (store)/checkout/
      actions.ts      # Server action createOrder() — honeypot + Zod items + rate limit + Sanity re-fetch
      validation.ts   # itemSchema/itemsArraySchema + extractClientIp() (puros, testeables)
    api/
      auth/           # NextAuth handlers
      webhooks/
        mercadopago/
          route.ts            # Webhook MP — handler
          verify-signature.ts # verifySignature() HMAC-SHA256 (extraído, testeable)
    studio/           # Sanity Studio embebido
  lib/
    cart-store.ts     # Zustand, persistido en localStorage
    emails.ts         # Templates HTML + wrapper EMAIL_DRY_RUN
    mercadopago.ts    # createMPPreference() — usa sandbox en TEST tokens
    rate-limit.ts     # In-memory sliding window (RATE_LIMIT_DISABLED para staging)
    base-url.ts       # Usa NEXT_PUBLIC_SITE_URL ?? NEXT_PUBLIC_BASE_URL
  components/
    store/            # Componentes de la tienda (PromoBanner, VideoWithSound, etc.)
    analytics/UmamiScript.tsx  # Tracker Umami, solo en NODE_ENV=production
  sanity/             # Schemas, queries GROQ (incluye SITEMAP_PRODUCTS_QUERY), cliente

tests/                # Vitest — unit/lógica pura, todo mockeado (sin red, sin DB)
  checkout/           # item-schema, extract-client-ip, honeypot
  webhook/            # verify-signature (HMAC + ancla viva del hallazgo B1)

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

**Testing (Vitest):** `npm test` (corre una vez) / `npm run test:watch`. 53 tests + 1 todo. Todo mockeado (Sanity, Prisma, MercadoPago, Resend, `next/headers`) — sin red ni I/O real, corre offline en ~800ms. Cubre: validación Zod de items (A1/A2), extracción de IP del rate limit (E1), guard del honeypot (E2), verificación HMAC del webhook MP. **El hallazgo B1 (webhook `timingSafeEqual` tira RangeError con `v1` malformado) está "anclado vivo"** en `tests/webhook/verify-signature.test.ts`: 2 tests `CURRENT behavior` que se romperán cuando B1 se arregle + un `it.todo` con la receta — sirve de recordatorio activo, no de hueco silencioso. Sin CI todavía (corre local; CI es un branch futuro).

**Analytics (Umami):** self-hosted en `umami.lahuelladelcaminante.de` (mismo VPS), cookieless, sin IPs ni perfiles. `UmamiScript.tsx` carga el tracker solo en `NODE_ENV=production` con `data-domains="sonaq.com.ar"` (filtra staging/previews). website-id `f32589aa-48ac-41b0-8c9d-1d52ae01d40d`. Overrideable por `NEXT_PUBLIC_UMAMI_{SRC,WEBSITE_ID,DOMAINS}`. Sin banner de consentimiento (cookieless). Documentado en `/privacidad` sección 8.

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
- Todos los commits van firmados: `git commit -S`. La firma usa una **clave SSH en disco** (`~/.ssh/macbookpro1_ed25519`, vía `git user.signingkey` + `gpg.format=ssh`). **Bitwarden ya no interviene**: `gpg.ssh.program` apunta a un wrapper (`~/.config/git/ssh-sign-no-agent`) que corre `ssh-keygen` con `SSH_AUTH_SOCK` borrado, así el agente de Bitwarden nunca se contacta al firmar. No salta ningún prompt. (SSH al VPS/Pis también usa claves en disco vía `~/.ssh/config` con `IdentityAgent none`.)
- La firma no requiere desbloquear nada — al ser clave en disco, `git commit -S` no falla por un agente bloqueado
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
- Antes de mergear features de pago o auth, correr `/security-review`. Tras tocar validación/flujo de compra, correr también `npm test` (la suite blinda A1/A2/E1/E2 + HMAC).
- El webhook de MP verifica firma HMAC-SHA256 con `MP_WEBHOOK_SECRET`
- Rate limiting en checkout (5/hora) y newsletter (3/10min) — desactivable con `RATE_LIMIT_DISABLED=true` en staging. La IP sale de `extractClientIp()`: usa `X-Real-IP` (no spoofable, Nginx prod/staging lo setea) y cae al ÚLTIMO elemento de `X-Forwarded-For` — NO el primero (que el cliente controla)
- Checkout valida los items del carrito server-side con Zod (`validation.ts`) ANTES de tocar Sanity/DB/MP: rechaza quantity ≤0/fraccional/>50, carrito vacío/>20 items, URLs no-http(s). Los precios igual se re-fetchean de Sanity (nunca se confía en el `price` del cliente)
- Honeypot en el checkout: campo oculto `website`; si llega lleno → fake-success con UUID, sin crear orden ni emails, log `[checkout] honeypot triggered` (sin PII)
- **No hay CSP** en Nginx prod ni `next.config.ts` (hallazgo E6 del backlog). Si se agrega en el futuro, incluir `umami.lahuelladelcaminante.de` en `script-src`/`connect-src`

---

## Estado actual (cierre 2026-06-13)

**En main + deployado a producción** (https://sonaq.com.ar, HEAD `92288b1`):
- ✅ Flujo completo de MercadoPago (preference → redirect → webhook con HMAC → /gracias con estados success/pending/failure)
- ✅ Email de confirmación MP **solo tras pago aprobado** vía webhook (PR #51)
- ✅ Datos bancarios + instrucciones en email de transferencia (PR #48); carrito se limpia al confirmar (PR #53)
- ✅ Banner promocional, hero, video YouTube 9:16, selector de color Faplac/Egger, panel admin
- ✅ **SEO foundation** (PRs #57/#58): metadata por página, JSON-LD Organization+WebSite+Product+BreadcrumbList, sitemap dinámico, robots, noindex en privadas
- ✅ **Hardening de seguridad del checkout (PR #60)**: validación Zod de items server-side (rechaza quantity ≤0/fraccional/absurda, carrito vacío), rate limit con `X-Real-IP` (antes era spoofeable vía `X-Forwarded-For`), honeypot anti-bot. Nació de una auditoría de seguridad del flujo de compra (modo solo-reportar) → ver hallazgos abajo
- ✅ **Suite de tests Vitest (PR #61)**: 53 tests que cristalizan los fixes del PR #60. Refactor minimal-invasive: `validation.ts` + `verify-signature.ts` extraídos (behavior-equivalent). B1 anclado vivo
- ✅ **Umami analytics (PR #68)**: tracker self-hosted cookieless, solo en prod, doc en /privacidad §8
- ✅ **Dependabot al día (2026-06-13)**: @types/node, zustand 5.0.14, @tailwindcss/postcss 4.3.1 (arrastra tailwindcss core), zod 4.4.3, gitleaks-action v3 (PRs #62/63/65/66/67; #64 auto-cerrado redundante)

**Sin branches ni PRs abiertos en GitHub.**

**Validación manual de staging — gotcha de MP:** `MP_ACCESS_TOKEN` en staging es `APP_USR-` (prod), NO `TEST-`. Por eso el checkout con MP en staging genera preferencias de PRODUCCIÓN real, no sandbox. Para validar el flujo MP en staging hay que cambiar el token a uno `TEST-` primero (o validar MP solo en prod). El flujo de transferencia bancaria sí se puede validar normal en staging.

**Backlog de seguridad pendiente** (de la auditoría del flujo de compra, ver `docs/backlog.md`):
- **Branch 2 — webhook hardening + IDOR**: B1 (`crypto.timingSafeEqual` tira RangeError con `v1` de longitud distinta → 500; tests ya anclados esperando), B2 (webhook no compara monto pagado vs total de la orden), B3 (`mpPaymentId` definido en schema pero nunca se persiste), D1 (IDOR en `/gracias?orden=<cuid>` — expone nombre+email+items sin auth; cuid no es unguessable)
- **E7** (lo flagueó CodeRabbit en PR #61): `extractClientIp` trata el literal `"unknown"` como IP válida → si un proxy manda `X-Real-IP: unknown` el rate-limit colapsa al bucket `*:unknown`. Defense in depth, bajo (Nginx nunca manda `unknown`)
- **Polish de tests** (Info del review de PR #61): DRY de `makeHeaders` (duplicado en 2 tests), mover `extractClientIp` a `@/lib/`, edge cases de XFF/x-signature vacíos
- **E6**: sin CSP en Nginx/next.config (si se agrega, incluir Umami)

**Backlog de producto** (`docs/backlog.md`): refinar Product JSON-LD (itemCondition, sku, image variants), campañas Resend a suscriptores, pulidos SEO varios, `LocalBusiness` JSON-LD.
