export type { OrderStatus, PaymentMethod, Role } from "@prisma/client";

export interface ProductAddon {
  _key: string;
  title: string;
  description?: string;
  price: number;
}

export type SelectedAddon = Pick<ProductAddon, "_key" | "title" | "price">;

export interface CartItem {
  cartItemId: string; // productId + color key + addons key para permitir distintas combinaciones
  productId: string;
  title: string;
  basePrice: number;
  price: number; // basePrice + suma de addons
  addons: SelectedAddon[];
  color?: string;
  quantity: number;
  image?: string;
  slug: string;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  notes?: string;
  paymentMethod: "MERCADOPAGO" | "BANK_TRANSFER";
}

export interface SanityProduct {
  _id: string;
  title: string;
  slug: { current: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sanity Portable Text
  description: any[];
  shortDescription?: string;
  price: number;
  images: SanityImage[];
  category: string;
  features?: string[];
  materials?: string[];
  capacity?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  stock: number;
  featured: boolean;
  localImages?: string[]; // fallback cuando Sanity no está configurado
  addons?: ProductAddon[];
}

export interface SanityImage {
  _key: string;
  asset: {
    _ref: string;
    _type: string;
  };
  alt?: string;
}
