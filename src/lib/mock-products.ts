import { SanityProduct } from "@/types";

export const MOCK_PRODUCTS: SanityProduct[] = [
  {
    _id: "mock-1",
    title: "Vitrina Sonaq Standard",
    slug: { current: "vitrina-sonaq-standard" },
    shortDescription:
      "Vitrina de roble con iluminación LED cálida, cajón extraíble y espacio para amplificador. Capacidad para 3 guitarras.",
    description: [],
    price: 380000,
    category: "vitrina",
    stock: 3,
    featured: true,
    features: [
      "Madera de roble con terminación natural",
      "Iluminación LED cálida integrada",
      "Cajón extraíble para accesorios",
      "Espacio inferior para amplificador",
      "Puerta con vidrio templado",
      "Soportes acolchados para 3 guitarras",
    ],
    dimensions: { width: 55, height: 180, depth: 45 },
    images: [
      { _key: "img1", asset: { _ref: "", _type: "reference" }, alt: "Vitrina Sonaq Standard abierta" },
      { _key: "img2", asset: { _ref: "", _type: "reference" }, alt: "Vitrina Sonaq Standard en sala" },
      { _key: "img3", asset: { _ref: "", _type: "reference" }, alt: "Vitrina Sonaq Standard lifestyle" },
    ],
    localImages: [
      "/products/vitrina-3.jpeg",
      "/products/vitrina-8.jpeg",
      "/products/vitrina-4.jpeg",
    ],
  },
  {
    _id: "mock-2",
    title: "Vitrina Sonaq Pro",
    slug: { current: "vitrina-sonaq-pro" },
    shortDescription:
      "Versión ampliada para coleccionistas. Capacidad para 5 guitarras, doble iluminación y módulo de control de humedad.",
    description: [],
    price: 590000,
    category: "vitrina",
    stock: 2,
    featured: true,
    features: [
      "Madera de roble macizo premium",
      "Doble iluminación LED con regulador",
      "Control de humedad integrado (45-55%)",
      "Capacidad para 5 guitarras",
      "Cajón con cerradura",
      "Espacio inferior para amplificador grande",
      "Puerta doble con vidrio antirreflejo",
    ],
    dimensions: { width: 80, height: 185, depth: 50 },
    images: [
      { _key: "img1", asset: { _ref: "", _type: "reference" }, alt: "Vitrina Sonaq Pro en estudio" },
      { _key: "img2", asset: { _ref: "", _type: "reference" }, alt: "Vitrina Sonaq Pro detalle" },
      { _key: "img3", asset: { _ref: "", _type: "reference" }, alt: "Vitrina Sonaq Pro lifestyle" },
    ],
    localImages: [
      "/products/vitrina-9.jpeg",
      "/products/vitrina-6.jpeg",
      "/products/vitrina-5.jpeg",
    ],
  },
  {
    _id: "mock-3",
    title: "Vitrina Sonaq Compact",
    slug: { current: "vitrina-sonaq-compact" },
    shortDescription:
      "Diseño compacto para espacios reducidos. Capacidad para 2 guitarras con iluminación LED y cajón de accesorios.",
    description: [],
    price: 260000,
    category: "vitrina",
    stock: 5,
    featured: false,
    features: [
      "Madera de roble con terminación natural",
      "Iluminación LED integrada",
      "Cajón para accesorios",
      "Capacidad para 2 guitarras",
      "Puerta con vidrio templado",
      "Patas de madera regulables",
    ],
    dimensions: { width: 40, height: 150, depth: 40 },
    images: [
      { _key: "img1", asset: { _ref: "", _type: "reference" }, alt: "Vitrina Sonaq Compact" },
      { _key: "img2", asset: { _ref: "", _type: "reference" }, alt: "Vitrina Sonaq Compact en sala" },
    ],
    localImages: [
      "/products/vitrina-7.jpeg",
      "/products/vitrina-4.jpeg",
    ],
  },
];
