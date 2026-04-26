export function resolveBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL ?? "https://sonaq.com.ar";
  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(normalized).origin;
  } catch {
    return "https://sonaq.com.ar";
  }
}

export const BASE_URL = resolveBaseUrl();
