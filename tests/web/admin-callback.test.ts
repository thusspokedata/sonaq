import { describe, expect, it } from "vitest";
import { safeAdminCallback } from "@/lib/admin-callback";

describe("safeAdminCallback", () => {
  it.each([
    "https://ejemplo.com",
    "//ejemplo.com",
    "/\\ejemplo.com",
    "/admin/../x",
    "/admin/./pedidos",
    "/admin//pedidos",
    "/admin/pedidos\n",
    "",
    null,
    undefined,
  ])("usa /admin para %j", (value) => {
    expect(safeAdminCallback(value)).toBe("/admin");
  });

  it.each(["/admin", "/admin/pedidos"])("conserva la ruta válida %s", (value) => {
    expect(safeAdminCallback(value)).toBe(value);
  });
});
