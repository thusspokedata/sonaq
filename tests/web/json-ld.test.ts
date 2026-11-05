import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/lib/json-ld";

describe("serializeJsonLd", () => {
  it("no deja un cierre de script literal y conserva el objeto al parsear", () => {
    const value = {
      "@type": "Product",
      name: '</script><script>alert(1)</script>',
    };

    const serialized = serializeJsonLd(value);

    expect(serialized.toLowerCase()).not.toContain("</script");
    expect(JSON.parse(serialized)).toEqual(value);
  });

  it("escapa caracteres especiales sin cambiar su valor", () => {
    const value = { text: "<>&\u2028\u2029" };

    const serialized = serializeJsonLd(value);

    expect(serialized).toBe('{"text":"\\u003c\\u003e\\u0026\\u2028\\u2029"}');
    expect(JSON.parse(serialized)).toEqual(value);
  });
});
