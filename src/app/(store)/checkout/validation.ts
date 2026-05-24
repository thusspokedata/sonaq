/**
 * Validación pura del input del checkout — separada de actions.ts para poder
 * testearla sin depender del runtime "use server" de Next. Cero side effects.
 *
 * Las exportaciones de este módulo son consumidas por la server action
 * createOrder y deben mantener exactamente el mismo comportamiento que tenía
 * inline. Cualquier cambio acá impacta la validación de seguridad del flujo
 * de compra (A1/A2/E1 de la auditoría).
 */
import { z } from "zod";

export const itemSchema = z.object({
  // CartItem.cartItemId / .slug existen para el cliente; el server no los
  // persiste pero el tipo los requiere — usamos defaults vacíos para evitar
  // que el spread los deje en undefined sin agregar lógica condicional.
  cartItemId: z.string().max(200).default(""),
  productId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(50),
  title: z.string().min(1).max(200),
  image: z
    .string()
    .url()
    .max(2048)
    .refine((u) => /^https?:\/\//i.test(u), { message: "Esquema de URL no permitido" })
    .optional(),
  color: z.string().max(100).optional(),
  slug: z.string().max(200).default(""),
  addons: z
    .array(
      z.object({
        _key: z.string().min(1).max(100),
        title: z.string().max(200),
        price: z.number(),
      })
    )
    .max(20)
    .default([]),
});

export const itemsArraySchema = z.array(itemSchema).min(1).max(20);

/**
 * Extrae el IP del cliente para rate limiting.
 *
 * Usa X-Real-IP (lo setea Nginx con $remote_addr — NO es spoofable por el
 * cliente). Cae al ÚLTIMO elemento de X-Forwarded-For solo si X-Real-IP
 * falta: el primer elemento de XFF sí es controlable por el cliente.
 *
 * Recibe un Headers-like object (cualquier cosa con .get(name) que devuelva
 * string | null) para que funcione tanto con el Headers de Next como con
 * objetos de test.
 */
export function extractClientIp(headers: { get(name: string): string | null }): string {
  const xff = headers.get("x-forwarded-for");
  return (
    headers.get("x-real-ip")?.trim() ||
    xff?.split(",").pop()?.trim() ||
    "unknown"
  );
}
