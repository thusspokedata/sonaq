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
**Solución:** En `src/app/(store)/checkout/actions.ts`, tras `prisma.order.create`, enviar dos emails con Resend:
1. **Al cliente** — confirmación del pedido con detalle de ítems, total y, si es transferencia, los datos bancarios.
2. **Al equipo de Sonaq** — notificación interna con nombre del cliente, email, teléfono, dirección, ítems y total.

---

## Panel de administración

### Vista de pedidos para el equipo de Sonaq
**Prioridad:** Media — diferir hasta que el volumen lo justifique (por ahora Neon console es suficiente)  
**Contexto:** No hay interfaz para que Sonaq vea, filtre o gestione los pedidos sin acceder directamente a la DB.  
**Solución:** Ruta Next.js protegida `/admin/pedidos` con:
- Lista de órdenes ordenada por fecha, filtrable por estado (`PAYMENT_PENDING`, `PAID`, `SHIPPED`, etc.)
- Detalle de cada orden con datos del cliente e ítems
- Botones para cambiar estado (pagado, enviado, cancelado)
- Auth con NextAuth (credenciales simples para uso interno)

---

## Confianza y legal

### Completar datos de empresa en páginas legales
**Prioridad:** Alta — las páginas `/terminos` y `/privacidad` tienen `[COMPLETAR]` como placeholder  
**Contexto:** Se necesita el CUIT y el domicilio legal exacto de Sonaq para cumplir con el art. 8 de la Ley 24.240.  
**Solución:** Reemplazar `[COMPLETAR]` en `src/app/(store)/terminos/page.tsx` y `src/app/(store)/privacidad/page.tsx` con el CUIT real y la razón social/domicilio legal.

### Indicador de compra segura en checkout
**Prioridad:** Baja  
**Contexto:** El cliente no tiene señales visuales de que el sitio es confiable más allá del HTTPS.  
**Solución:** Pequeño bloque debajo del botón "Confirmar pedido" con íconos de candado, "Datos protegidos" y "Compra 100% segura".

---

## Deploy pendiente tras merge de PRs abiertos

### Migraciones en VPS al mergear feat/color-selector y feat/guest-checkout
**Prioridad:** Alta — sin esto la VPS corre con un schema desactualizado  
**Contexto:** Los PRs #11 y #12 incluyen migraciones Prisma (`color`, `image` en `order_items`). Una vez mergeados hay que correrlas en producción.  
**Solución:** En la VPS, tras hacer `git pull` y `npm run build`:
```bash
source ~/.nvm/nvm.sh && nvm use 20
npx prisma migrate deploy
```

---

## UX / Futuro

- MercadoPago Checkout Pro con cuotas (bloqueante: validar precios server-side primero)
- Newsletter con captura de email en el footer
- Página `/nosotros`
- SEO: OpenGraph, sitemap.xml, robots.txt, metadata por producto
