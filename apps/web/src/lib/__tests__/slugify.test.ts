import { describe, it, expect } from "vitest";
import { slugify } from "../slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Ibuprofeno 400mg")).toBe("ibuprofeno-400mg");
  });

  it("strips accents", () => {
    expect(slugify("Clonazepám Retenido")).toBe("clonazepam-retenido");
  });

  it("strips punctuation and collapses separators", () => {
    expect(slugify("Kitadol (B) Paracetamol, 500mg!!")).toBe("kitadol-b-paracetamol-500mg");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  -Amoxicilina-  ")).toBe("amoxicilina");
  });
});
