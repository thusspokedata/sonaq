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

## Newsletter

### Envío de campañas a suscriptores
**Prioridad:** Media  
**Contexto:** Los emails captados en el footer se guardan en Resend Audiences. Hoy no hay forma de enviar un email a toda la lista desde la app — hay que hacerlo manualmente desde el dashboard de Resend (Broadcasts). Funciona para el volumen actual pero no escala bien.  
**Solución:** Evaluar dos opciones: (1) seguir usando Resend Broadcasts manualmente para anuncios puntuales, o (2) construir un formulario en el panel admin (`/admin/newsletter`) que llame a la API de Resend para crear y enviar un broadcast programáticamente.

---

## Bloqueantes para lanzamiento real

- MercadoPago Checkout Pro con cuotas (bloqueante: validar precios server-side primero)

### Soporte de texturas (imágenes) en el selector de color de productos
**Prioridad:** Alta — falta para vender bien
**Contexto:** Los muebles Sonaq no se ofrecen en colores lisos sino con texturas (vetas de madera, acabados artesanales). El schema actual de variantes de color en Sanity tiene `nombre` + `hex (opcional)`, lo que no representa fielmente una textura. Se necesitan 3-4 opciones por producto con imagen real del acabado.
**Solución:**
- Extender el schema de Sanity del producto: agregar campo `textura` (asset de imagen) al objeto de variante de color, junto a `nombre` y `hex`.
- Mantener `hex` como fallback para vistas previas pequeñas o cuando no hay textura cargada.
- Adaptar el selector de color en el PDP (`src/app/(store)/productos/[slug]/`) para renderizar la imagen de textura como swatch en vez del color sólido. Tamaño de swatch sugerido: 48-64px circular o cuadrado redondeado, con `<Image>` de Next.js (no `<img>`).
- Al hacer hover/click en un swatch, opcionalmente mostrar un preview ampliado de la textura.
- Actualizar el tipo TypeScript de variante en `src/types/` y la query GROQ en `src/sanity/`.
- Migración: revisar productos existentes en Sanity y subir la imagen de textura para las variantes que ya tengan `nombre` + `hex`.
**Acceptance:** En el PDP, cada swatch del selector de color muestra la textura real del acabado. Si una variante no tiene `textura` cargada, fallback al `hex`. Si no tiene ninguno de los dos, no se rompe el render.

---

## UX / Futuro

- Página `/nosotros`
- Indicador de compra segura en checkout
