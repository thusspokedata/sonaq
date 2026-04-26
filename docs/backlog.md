# Backlog

## Seguridad

### Validar precios en el servidor antes de crear la orden
**Prioridad:** Alta — bloqueante antes de activar MercadoPago  
**Contexto:** Los precios de los items llegan del cart en Zustand (localStorage). Un usuario puede modificarlos en DevTools y crear una orden con `price: 1`. Actualmente el riesgo es bajo porque MercadoPago no está activo, pero hay que resolverlo en el PR de integración de MP.  
**Solución:** En `src/app/(store)/checkout/actions.ts`, re-fetch los precios reales desde Sanity usando los `productId` de los items antes de crear la orden, y comparar con los precios recibidos del cliente.

---

## UX / Futuro

- Newsletter con captura de email en el footer
- Página `/nosotros`
- Páginas legales: `/terminos` y `/privacidad`
- SEO: OpenGraph, sitemap.xml, robots.txt, metadata por producto
- MercadoPago Checkout Pro con cuotas
- Email de confirmación automático (Resend)
