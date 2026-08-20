import { describe, it, expect } from "vitest";
import { parseProductHtml } from "../salcobrand.scraper";

// Trimmed but structurally real fixture -- mirrors salcobrand.cl's `product_traker_data`
// script block, confirmed against real paracetamol/amoxicilina/clonazepam product pages.
function pageWithSaleType(saleType: string | undefined) {
  const saleTypeField = saleType ? `,"saleType":"${saleType}"` : "";
  return `
<html><body>
<script type="text/javascript">
var product_traker_data = {"groupId":22656,"name":"Clonazepam (B) 2mg 30 Comprimidos","price":"5103.0","isAvailable":true,"url":"https://salcobrand.cl/products/clonazepam-b-2mg-30-comprimidos","productIDs":["430254"],"products":{"430254":{"isAvailable":true}},"params":{"badge":null${saleTypeField}}};
</script>
</body></html>
`;
}

describe("salcobrand.scraper parseProductHtml", () => {
  it("maps saleType=restricted to receta_retenida (confirmed against clonazepam)", () => {
    const result = parseProductHtml(pageWithSaleType("restricted"), "https://salcobrand.cl/products/clonazepam");
    expect(result?.regulatoryLabel).toBe("receta_retenida");
    expect(result?.sku).toBe("430254");
    expect(result?.priceClp).toBe(5103);
    expect(result?.inStock).toBe(true);
  });

  it("maps saleType=prescription to receta_simple (confirmed against amoxicilina)", () => {
    const result = parseProductHtml(pageWithSaleType("prescription"), "https://salcobrand.cl/products/amoxicilina");
    expect(result?.regulatoryLabel).toBe("receta_simple");
  });

  it("maps saleType=not_drug to venta_libre (confirmed against paracetamol)", () => {
    const result = parseProductHtml(pageWithSaleType("not_drug"), "https://salcobrand.cl/products/paracetamol");
    expect(result?.regulatoryLabel).toBe("venta_libre");
  });

  it("returns undefined regulatoryLabel when saleType is absent", () => {
    const result = parseProductHtml(pageWithSaleType(undefined), "https://salcobrand.cl/products/x");
    expect(result?.regulatoryLabel).toBeUndefined();
  });

  it("returns null when product_traker_data is missing", () => {
    expect(parseProductHtml("<html><body>no data here</body></html>", "https://example.com")).toBeNull();
  });
});
