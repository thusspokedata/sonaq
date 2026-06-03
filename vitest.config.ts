import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Sin globals: importamos describe/it/expect explícitamente.
    globals: false,
    // Sin red, sin I/O real: forzamos que cualquier import de Sanity/Prisma/MP/Resend
    // tenga que pasar por un mock explícito en el test.
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
