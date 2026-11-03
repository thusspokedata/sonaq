import { z } from "zod";
import type { CartItem, SelectedAddon } from "@/types";

export const itemSchema = z.object({
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
  colorKey: z.string().min(1).max(100).optional(),
  catalogKey: z.string().min(1).max(100).optional(),
  catalogCode: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine((code) => !code.includes(" — "))
    .optional(),
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

export type CheckoutItem = z.infer<typeof itemSchema>;

export interface CheckoutProduct {
  _id: string;
  title: string;
  price: number;
  stock: number;
  image: string | null;
  addons?: SelectedAddon[];
  colors?: { _key: string; name: string }[];
  colorCatalogs?: { _key: string; brand: string; priceExtra: number }[];
}

export type BuildOrderItemsResult =
  | { success: true; items: CartItem[] }
  | { success: false; error: string };

export function buildOrderItems(
  items: CheckoutItem[],
  products: CheckoutProduct[]
): BuildOrderItemsResult {
  const productMap = new Map(products.map((product) => [product._id, product]));
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const validatedItems: CartItem[] = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { success: false, error: "Uno de los productos no está disponible." };
    }

    const productQuantity = quantities.get(item.productId) ?? 0;
    if (!Number.isFinite(product.stock) || product.stock <= 0 || productQuantity > product.stock) {
      return { success: false, error: `No hay stock suficiente de ${product.title}` };
    }

    const addons = item.addons.flatMap((addon) => {
      const serverAddon = product.addons?.find((candidate) => candidate._key === addon._key);
      if (!serverAddon) return [];
      return [{ _key: serverAddon._key, title: serverAddon.title, price: serverAddon.price }];
    });
    const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
    const hasVariants = Boolean(product.colors?.length || product.colorCatalogs?.length);

    let color: string | undefined;
    let colorKey: string | undefined;
    let catalogKey: string | undefined;
    let catalogCode: string | undefined;
    let catalogExtra = 0;

    if (hasVariants) {
      const hasColorKey = item.colorKey !== undefined;
      const hasCatalogKey = item.catalogKey !== undefined;
      const hasCatalogCode = item.catalogCode !== undefined;

      if (hasColorKey && !hasCatalogKey && !hasCatalogCode) {
        const serverColor = product.colors?.find((candidate) => candidate._key === item.colorKey);
        if (!serverColor) {
          return { success: false, error: "El color seleccionado no está disponible." };
        }
        color = serverColor.name;
        colorKey = serverColor._key;
      } else if (!hasColorKey && hasCatalogKey && hasCatalogCode) {
        const catalog = product.colorCatalogs?.find((candidate) => candidate._key === item.catalogKey);
        if (!catalog) {
          return { success: false, error: "El color seleccionado no está disponible." };
        }
        color = `${catalog.brand} — ${item.catalogCode}`;
        catalogKey = catalog._key;
        catalogCode = item.catalogCode;
        catalogExtra = catalog.priceExtra;
      } else {
        return { success: false, error: "Actualizá tu carrito" };
      }
    }

    validatedItems.push({
      cartItemId: item.cartItemId,
      productId: product._id,
      title: product.title,
      basePrice: product.price,
      price: product.price + addonTotal + catalogExtra,
      addons,
      color,
      colorKey,
      catalogKey,
      catalogCode,
      quantity: item.quantity,
      image: product.image ?? undefined,
      slug: item.slug,
    });
  }

  return { success: true, items: validatedItems };
}

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
