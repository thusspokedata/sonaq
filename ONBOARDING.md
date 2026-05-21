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
    (store)/          # Tienda pública — layout con header + footer
      page.tsx        # Home con video YouTube y secciones
      productos/      # Catálogo + PDP (datos de Sanity con ISR 1min)
      checkout/       # Formulario + server action createOrder()
      gracias/        # Confirmación post-compra (MP y transferencia)
      carrito/        # Vista del carrito
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
  components/store/   # Componentes de la tienda
  sanity/             # Schemas, queries GROQ, cliente
```

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

PM2 staging usa un wrapper script en el VPS que hace `set -a; source .env.staging; set +a` antes de arrancar Next.js (el `env_file` de PM2 no parsea comillas correctamente).

---

## Cómo trabajar con el usuario

**Workflow de código:**
- Para cambios significativos: crear branch → implementar → PR → esperar CodeRabbit → aplicar fixes → mergear
- Para fixes simples: commitear directo en main está bien
- Antes de mergear un PR, siempre revisar si CodeRabbit dejó comentarios (`gh pr view <n> --comments`)
- Todos los commits van firmados: `git commit -S` (Bitwarden SSH agent — el usuario aprueba la firma)
- Si Bitwarden está bloqueado, el commit falla — avisar al usuario para que lo desbloquee

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

## Estado actual (al cierre de la sesión anterior)

**En main, deployado en staging:**
- ✅ Flujo completo de MercadoPago (preference → redirect → webhook → gracias)
- ✅ Entorno staging completo con banner, robots noindex, EMAIL_DRY_RUN
- ✅ Selector de color con texturas (Faplac/Egger) en PDP
- ✅ Página Nosotros
- ✅ Panel admin con gestión de pedidos

**Branch pendiente de deploy:**
- `fix/cart-clear-after-mp` — limpia el carrito al aterrizar en `/gracias` (commit sin pushear, Bitwarden estaba bloqueado)

**Backlog conocido:**
- Bug: el stock no se descuenta al confirmar una compra (se puede comprar más unidades de las disponibles)
- Email al cliente con datos bancarios para transferencia (falta CBU/alias del vendedor)
- Dashboard de métricas en el admin
