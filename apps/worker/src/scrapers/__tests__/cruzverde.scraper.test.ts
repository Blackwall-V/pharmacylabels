import { describe, it, expect } from "vitest";
import { parseApiResponse } from "../cruzverde.scraper";

// Trimmed but structurally real fixture -- mirrors the JSON returned by
// api.cruzverde.cl/product-service/products/detail/{id}, confirmed against a real
// psychotropic ("restricted"), antibiotic ("simple") and OTC (no field) product.
function apiResponse(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    productData: {
      id: "1006",
      name: "Morelin Amitriptilina 12,5 mg 30 Comprimidos",
      price: 27990,
      prices: { "price-list-cl": 27990, "price-sale-cl": 22392 },
      stock: 267,
      ...overrides,
    },
  });
}

describe("cruzverde.scraper parseApiResponse", () => {
  it("prefers the sale price over the list price", () => {
    const result = parseApiResponse(apiResponse(), "https://www.cruzverde.cl/x/1006.html");
    expect(result?.priceClp).toBe(22392);
    expect(result?.sku).toBe("1006");
    expect(result?.inStock).toBe(true);
  });

  it("falls back to the list price when there is no sale price", () => {
    const result = parseApiResponse(apiResponse({ prices: undefined }), "https://www.cruzverde.cl/x/1006.html");
    expect(result?.priceClp).toBe(27990);
  });

  it("maps prescription=restricted to receta_retenida", () => {
    const result = parseApiResponse(apiResponse({ prescription: "restricted" }), "https://example.com");
    expect(result?.regulatoryLabel).toBe("receta_retenida");
  });

  it("maps prescription=simple to receta_simple", () => {
    const result = parseApiResponse(apiResponse({ prescription: "simple" }), "https://example.com");
    expect(result?.regulatoryLabel).toBe("receta_simple");
  });

  it("treats an absent prescription field as venta_libre (OTC)", () => {
    const result = parseApiResponse(apiResponse(), "https://example.com");
    expect(result?.regulatoryLabel).toBe("venta_libre");
  });

  it("marks stock=0 as out of stock", () => {
    const result = parseApiResponse(apiResponse({ stock: 0 }), "https://example.com");
    expect(result?.inStock).toBe(false);
  });

  it("returns null when productData is missing required fields", () => {
    expect(parseApiResponse(JSON.stringify({ productData: { id: "1" } }), "https://example.com")).toBeNull();
  });
});
