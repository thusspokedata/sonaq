import type { NextConfig } from "next";

const umamiOrigin = new URL(
  process.env.NEXT_PUBLIC_UMAMI_SRC || "https://umami.lahuelladelcaminante.de/script.js",
).origin;

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${umamiOrigin} https://www.youtube.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "font-src 'self' data:",
  `connect-src 'self' ${umamiOrigin}`,
  "frame-src https://www.youtube.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const commonHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  serverExternalPackages: ["@sanity/client"],
  async headers() {
    const rules = [{ source: "/:path*", headers: commonHeaders }];

    if (process.env.NODE_ENV === "production") {
      rules.push(
        {
          source: "/studio/:path*",
          headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" }],
        },
        {
          source: "/((?!studio(?:/|$)).*)",
          headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy }],
        },
      );
    }

    return rules;
  },
};

export default nextConfig;
