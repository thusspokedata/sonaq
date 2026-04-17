# Sonaq

Plataforma de eventos y artistas en [sonaq.com.ar](https://sonaq.com.ar).

Stack: Next.js 16, Prisma, Sanity, MercadoPago.

## Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Deploy a producción

El build se hace localmente (la VPS no tiene RAM suficiente para buildear) y se sube via rsync.

```bash
bash deploy.sh
```

El script:
1. Hace `npm run build` en tu máquina
2. Sincroniza el código con `git pull` en la VPS
3. Sube `.next/` via rsync
4. Sube `node_modules/` via rsync
5. Instala paquetes nativos Linux (`@parcel/watcher-linux-x64-glibc`)
6. Regenera el cliente Prisma en la VPS
7. Reinicia el proceso PM2 (`sonaq`, puerto 3001)

**VPS:** `root@187.33.155.194` → `/var/www/sonaq`
**Variables de entorno:** `/var/www/sonaq/.env` (no se sube al repo)
