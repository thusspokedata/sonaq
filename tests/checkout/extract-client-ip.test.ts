/**
 * Blinda la extracción del IP del cliente para rate limit (E1 de la auditoría).
 *
 * Regresión histórica: el código tomaba `XFF.split(",")[0]` — el primer
 * elemento del header X-Forwarded-For, que es CONTROLADO POR EL CLIENTE
 * cuando Nginx hace `proxy_add_x_forwarded_for` (append). Bypasear el rate
 * limit era trivial rotando ese header.
 *
 * El fix:
 *  - X-Real-IP primero (Nginx lo setea con $remote_addr, no spoofable).
 *  - Fallback al ÚLTIMO elemento de XFF (el que Nginx anexa).
 *  - "unknown" si no hay ninguno.
 */
import { describe, it, expect } from "vitest";
import { extractClientIp } from "../../src/app/(store)/checkout/validation";

function makeHeaders(map: Record<string, string>) {
  return {
    get(name: string): string | null {
      return map[name.toLowerCase()] ?? null;
    },
  };
}

describe("E1 — extractClientIp", () => {
  it("E1: uses X-Real-IP when present (Nginx prod/staging setup)", () => {
    const h = makeHeaders({ "x-real-ip": "1.2.3.4" });
    expect(extractClientIp(h)).toBe("1.2.3.4");
  });

  it("E1: trims surrounding whitespace from X-Real-IP", () => {
    const h = makeHeaders({ "x-real-ip": "  1.2.3.4  " });
    expect(extractClientIp(h)).toBe("1.2.3.4");
  });

  it("E1: prefers X-Real-IP over X-Forwarded-For even if both are present", () => {
    const h = makeHeaders({
      "x-real-ip": "9.9.9.9",
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    });
    expect(extractClientIp(h)).toBe("9.9.9.9");
  });

  it("E1: without X-Real-IP, uses LAST element of X-Forwarded-For (not the first / spoofable)", () => {
    const h = makeHeaders({ "x-forwarded-for": "spoofed, real" });
    expect(extractClientIp(h)).toBe("real");
  });

  it("E1: ignores spoofed leading entries — attacker IPs in XFF do not leak through", () => {
    const h = makeHeaders({
      "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3, 198.51.100.42",
    });
    expect(extractClientIp(h)).toBe("198.51.100.42");
  });

  it("E1: trims whitespace from the last XFF element", () => {
    const h = makeHeaders({ "x-forwarded-for": "spoofed,  real-ip-with-padding  " });
    expect(extractClientIp(h)).toBe("real-ip-with-padding");
  });

  it("E1: falls back to 'unknown' when no IP header is present", () => {
    const h = makeHeaders({});
    expect(extractClientIp(h)).toBe("unknown");
  });

  it("E1: treats empty X-Real-IP as missing (falls through to XFF)", () => {
    const h = makeHeaders({ "x-real-ip": "   ", "x-forwarded-for": "spoofed, real" });
    expect(extractClientIp(h)).toBe("real");
  });

  it("E1: treats single-element XFF as that element (no first/last ambiguity)", () => {
    const h = makeHeaders({ "x-forwarded-for": "1.2.3.4" });
    expect(extractClientIp(h)).toBe("1.2.3.4");
  });
});
