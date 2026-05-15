# Setup de staging.sonaq.com.ar

Guía paso a paso para montar el entorno de staging en el VPS.
Ejecutar como `root` en `187.33.155.194`.

---

## Pre-requisitos (hechos desde fuera del VPS)

- [x] Registro DNS `A staging.sonaq.com.ar → 187.33.155.194`
- [x] Branch `staging` creado en Neon — anotar el connection string
- [x] Dataset `staging` creado en Sanity Studio
- [ ] Credenciales TEST de MercadoPago (Access Token + Public Key)
- [ ] Archivo `.env.staging` listo en la máquina local (copiar de `.env.staging.example`)

---

## 1. Preparar el directorio en el VPS

```bash
mkdir -p /var/www/sonaq-staging
cd /var/www/sonaq-staging
git clone git@github.com:thusspokedata/sonaq.git .
cp .env.staging.example .env.staging
nano .env.staging   # reemplazar cada REPLACE_WITH_... con el valor real
```

> **Importante:** `RESEND_API_KEY` debe estar configurado incluso cuando `EMAIL_DRY_RUN=true`.
> El módulo `src/lib/resend.ts` valida la clave al arrancar el servidor — si falta, el proceso crashea antes de servir requests.

---

## 2. HTTP Basic Auth (htpasswd)

Instalar apache2-utils si no está:

```bash
apt-get install -y apache2-utils
```

Crear el archivo htpasswd (reemplazar `<usuario>` con el usuario elegido):

```bash
sudo htpasswd -c /etc/nginx/.htpasswd-staging <usuario>
# pedirá el password dos veces
```

---

## 3. Bloque Nginx

Crear el archivo de configuración:

```bash
nano /etc/nginx/sites-available/staging.sonaq.com.ar
```

Pegar el siguiente contenido:

```nginx
server {
    listen 80;
    server_name staging.sonaq.com.ar;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.sonaq.com.ar;

    ssl_certificate     /etc/letsencrypt/live/staging.sonaq.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.sonaq.com.ar/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Bloquear indexación
    add_header X-Robots-Tag "noindex, nofollow, nosnippet, noarchive" always;

    # Seguridad estándar
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # HTTP Basic Auth
    auth_basic "Staging — acceso restringido";
    auth_basic_user_file /etc/nginx/.htpasswd-staging;

    location / {
        proxy_pass         http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar el sitio:

```bash
ln -sfn /etc/nginx/sites-available/staging.sonaq.com.ar /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 4. Certificado SSL (Let's Encrypt)

```bash
certbot --nginx -d staging.sonaq.com.ar
```

Verificar que Nginx levanta con SSL:

```bash
nginx -t && systemctl reload nginx
```

---

## 5. PM2 — proceso staging en puerto 3001

PM2 no re-lee `.env.staging` en cada restart. Para que las variables persistan tras reinicios del VPS, usar un ecosystem file:

```bash
cat > /var/www/sonaq-staging/ecosystem.staging.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "sonaq-staging",
    script: "npm",
    args: "start -- -p 3001",
    cwd: "/var/www/sonaq-staging",
    env_file: "/var/www/sonaq-staging/.env.staging",
  }],
};
EOF

pm2 start ecosystem.staging.config.js
pm2 save
```

Verificar que está corriendo:

```bash
pm2 list
```

---

## 6. Primer deploy

Desde la máquina local (con `.env.staging` completo):

```bash
bash deploy-staging.sh
```

---

## Operaciones de mantenimiento

### Re-deploy staging

```bash
bash deploy-staging.sh
```

### Correr migraciones de Prisma contra staging

Desde el VPS:

```bash
cd /var/www/sonaq-staging
set -a; source .env.staging; set +a
npx prisma migrate deploy
```

### Renovar certificado SSL

Certbot renueva automáticamente. Para forzar:

```bash
certbot renew --nginx
```

### Copiar datos de prod a staging (opcional)

Con Neon, la forma más simple es crear el branch `staging` desde el branch `main` de producción en el dashboard de Neon — esto copia todos los datos en el momento del branching. Para una sincronización manual:

```bash
# En máquina local, con psql instalado:
pg_dump "$DATABASE_URL_PROD" | psql "$DATABASE_URL_STAGING"
```

### Webhook de MercadoPago (modo TEST)

En el panel de MercadoPago → Tus integraciones → modo Prueba → Webhooks:

- URL: `https://staging.sonaq.com.ar/api/webhooks/mercadopago`
- Eventos: `payment`

---

## Checklist de verificación post-setup

- [ ] `https://staging.sonaq.com.ar` pide usuario y password
- [ ] Banner amarillo "Entorno de pruebas" visible en todas las páginas
- [ ] `https://staging.sonaq.com.ar/robots.txt` devuelve `Disallow: /`
- [ ] Los emails en staging se loguean en PM2 (`pm2 logs sonaq-staging`) en vez de enviarse
- [ ] El checkout conecta con DB de Neon branch staging (no prod)
- [ ] Webhook de MP prueba llega a staging
