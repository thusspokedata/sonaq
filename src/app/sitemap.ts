import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity";
import { SITEMAP_PRODUCTS_QUERY } from "@/sanity/queries";
import { BASE_URL } from "@/lib/base-url";

export const revalidate = 3600;

// Fecha fija de última actualización de las páginas estáticas.
// Bumpear cuando el contenido de esas páginas cambie — Google la usa para
// presupuesto de crawl y no la queremos mover en cada revalidate.
const STATIC_LAST_MODIFIED = new Date("2026-05-23");

type SitemapProduct = { slug: string | null; _updatedAt: string | null };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: STATIC_LAST_MODIFIED, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/productos`, lastModified: STATIC_LAST_MODIFIED, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE_URL}/nosotros`, lastModified: STATIC_LAST_MODIFIED, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/contacto`, lastModified: STATIC_LAST_MODIFIED, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/terminos`, lastModified: STATIC_LAST_MODIFIED, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/privacidad`, lastModified: STATIC_LAST_MODIFIED, priority: 0.3, changeFrequency: "yearly" },
  ];

  let products: SitemapProduct[] = [];
  try {
    products = await sanityClient.fetch(SITEMAP_PRODUCTS_QUERY);
  } catch {
    // Sanity no configurado — sitemap solo incluye rutas estáticas
  }

  const productRoutes: MetadataRoute.Sitemap = products
    .filter(
      (p): p is { slug: string; _updatedAt: string } =>
        typeof p.slug === "string" && p.slug.length > 0 && typeof p._updatedAt === "string"
    )
    .map((p) => ({
      url: `${BASE_URL}/productos/${p.slug}`,
      lastModified: new Date(p._updatedAt),
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }));

  return [...staticRoutes, ...productRoutes];
}
