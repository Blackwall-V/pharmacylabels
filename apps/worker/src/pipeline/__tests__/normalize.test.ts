import { describe, it, expect } from "vitest";
import { normalizeProductName } from "../normalize";

describe("normalizeProductName", () => {
  it("strips accents", () => {
    expect(normalizeProductName("Clonazepám")).toBe("clonazepam");
  });

  it("lowercases", () => {
    expect(normalizeProductName("PARACETAMOL")).toBe("paracetamol");
  });

  it("collapses spaced-out mg/ml units", () => {
    expect(normalizeProductName("Ibuprofeno 400 mg")).toBe("ibuprofeno 400mg");
    expect(normalizeProductName("Jarabe 60 ml")).toBe("jarabe 60ml");
  });

  it("strips punctuation", () => {
    expect(normalizeProductName("Kitadol (B) Paracetamol 500mg")).toBe("kitadol b paracetamol 500mg");
  });

  it("collapses repeated whitespace", () => {
    expect(normalizeProductName("Amoxicilina   1000mg")).toBe("amoxicilina 1000mg");
  });

  it("trims leading/trailing whitespace", () => {
    expect(normalizeProductName("  Losartan 50mg  ")).toBe("losartan 50mg");
  });
});
