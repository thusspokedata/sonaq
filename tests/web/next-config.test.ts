import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig(nodeEnv: string) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.stubEnv("NEXT_PUBLIC_UMAMI_SRC", "");
  return (await import("../../next.config")).default;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("next.config headers", () => {
  it("exporta los headers comunes y desactiva X-Powered-By", async () => {
    const config = await loadConfig("production");

    expect(config.poweredByHeader).toBe(false);
    expect(config.headers).toBeDefined();
    const rules = await config.headers!();
    const common = rules.find((rule) => rule.source === "/:path*");

    expect(common?.headers).toEqual([
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "X-Frame-Options", value: "DENY" },
    ]);
  });

  it("aplica la CSP de producción fuera de /studio", async () => {
    const config = await loadConfig("production");
    const rules = await config.headers!();
    const cspRule = rules.find((rule) => rule.source === "/((?!studio(?:/|$)).*)");
    const csp = cspRule?.headers.find((header) => header.key === "Content-Security-Policy")?.value;

    expect(csp).toBe(
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://umami.lahuelladelcaminante.de https://www.youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://cdn.sanity.io; font-src 'self' data:; connect-src 'self' https://umami.lahuelladelcaminante.de; frame-src https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
    );
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("nonce-");

    const studioRule = rules.find((rule) => rule.source === "/studio/:path*");
    expect(studioRule?.headers).toEqual([
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
    ]);
  });

  it("no agrega CSP durante desarrollo", async () => {
    const config = await loadConfig("development");
    const rules = await config.headers!();

    expect(rules).toHaveLength(1);
    expect(rules[0].headers.some((header) => header.key === "Content-Security-Policy")).toBe(false);
  });
});
