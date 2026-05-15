import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/base-url";

export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_STAGING_BANNER === "true") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/studio/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
