import { describe, it, expect } from "vitest";

// TEMPORAL: prueba de que el CI falla con un test roto. Se revierte en este mismo PR.
describe("ci demo", () => {
  it("falla a propósito", () => {
    expect(1).toBe(2);
  });
});
