import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import { SanityProduct } from "@/types";
import { BASE_URL } from "@/lib/base-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/productos`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE_URL}/nosotros`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/contacto`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/terminos`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/privacidad`, priority: 0.3, changeFrequency: "yearly" },
  ];

  let products: SanityProduct[] = [];
  try {
    products = await sanityClient.fetch(ALL_PRODUCTS_QUERY);
  } catch {
    // Sanity not configured — sitemap will only include static routes
  }

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => typeof p.slug?.current === "string" && p.slug.current.length > 0)
    .map((p) => ({
      url: `${BASE_URL}/productos/${p.slug.current}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }));

  return [...staticRoutes, ...productRoutes];
}
