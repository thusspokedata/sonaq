# Sonaq

E-commerce de muebles y vitrinas para guitarras. [sonaq.com.ar](https://sonaq.com.ar)

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Sanity CMS · PostgreSQL · Prisma · NextAuth v5 · PM2 · Nginx

---

## Estado del proyecto

### ✅ Hecho

**Tienda**
- [x] Catálogo de productos con Sanity CMS
- [x] Página de detalle de producto (PDP) con galería de imágenes
- [x] Carrito con Zustand (persistido en localStorage)
- [x] Header con logo, navegación y badge del carrito
- [x] Banner "sitio en construcción" dismissible
- [x] Aviso de precios de ejemplo cuando no hay productos en Sanity
- [x] Página 404 branded con botones volver/inicio

**Admin**
- [x] Autenticación con NextAuth v5 (email + contraseña)
- [x] Panel admin protegido por rol ADMIN
- [x] Listado de pedidos con filtro por estado
- [x] Detalle de pedido con cambio de estado
- [x] Flujo de estados: Pendiente → Pago pendiente → Pagado → En preparación → Enviado → Entregado
- [x] Gestión de productos via Sanity Studio (`/studio`)

**Infraestructura**
- [x] Base de datos PostgreSQL con Prisma (migraciones)
- [x] Docker Compose para desarrollo local
- [x] Deploy en VPS con PM2 (puerto 3001) + Nginx
- [x] SSL con Certbot (HTTPS)
- [x] Sanity Studio embebido en `/studio`

---

### ⬜ Pendiente

**Tienda**
- [ ] Checkout con transferencia bancaria (formulario → resumen → instrucciones CBU → pedido en DB)
- [ ] Página de confirmación (`/gracias`)
- [ ] Checkout con MercadoPago (cuotas)
- [ ] Páginas de contenido: `/nosotros` y `/contacto`

**Admin**
- [ ] Dashboard con métricas (pedidos del día, ingresos, stock bajo)
- [ ] Notificación por email al recibir un pedido nuevo

**Producción**
- [ ] Script de deploy automatizado (`deploy.sh`)
- [ ] Variables de entorno documentadas para el VPS

---

## Desarrollo local

### Requisitos
- Node.js 20+
- Docker (para Postgres)

### Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar base de datos
docker compose up -d

# 3. Crear variables de entorno
cp .env.example .env
# Editar .env con los valores reales

# 4. Crear tablas y usuario admin
npx prisma migrate dev
npm run seed

# 5. Correr en desarrollo
npm run dev
```

### Variables de entorno necesarias

```env
DATABASE_URL=postgresql://usuario:clave@localhost:5433/sonaq
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NEXT_PUBLIC_SANITY_PROJECT_ID=tu-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=tu-token-viewer
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

---

## Deploy a producción

El build se hace **localmente** (la VPS no tiene RAM suficiente) y se sube via rsync.

```bash
# 1. Buildear
npm run build

# 2. Subir build al VPS
rsync -avz --progress .next/ root@187.33.155.194:/var/www/sonaq/.next/

# 3. Reiniciar en el VPS
ssh root@187.33.155.194 "cd /var/www/sonaq && pm2 restart sonaq"
```

**VPS:** `root@187.33.155.194` → `/var/www/sonaq`  
**Puerto:** 3001  
**Variables de entorno:** `/var/www/sonaq/.env` (no se sube al repo)

---

## Gestión de contenido

Los productos se administran desde **Sanity Studio**: [sonaq.com.ar/studio](https://sonaq.com.ar/studio)

Para agregar un editor al Studio: [sanity.io/manage](https://sanity.io/manage) → Proyecto Sonaq → Members → Invite.
