export type { OrderStatus, PaymentMethod, Role } from "@prisma/client";

export interface CartItem {
  productId: string;
  title: string;
  price: number;
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
  description: string;
  price: number;
  images: SanityImage[];
  category: string;
  features?: string[];
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  stock: number;
  featured: boolean;
}

export interface SanityImage {
  _key: string;
  asset: {
    _ref: string;
    _type: string;
  };
  alt?: string;
}
