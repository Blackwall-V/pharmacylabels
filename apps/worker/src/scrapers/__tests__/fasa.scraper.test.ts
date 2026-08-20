import { describe, it, expect } from "vitest";
import { parseProductHtml } from "../fasa.scraper";

// Trimmed but structurally real fixture -- mirrors the actual markup found on
// farmaciasahumada.cl product pages (schema.org JSON-LD + a "requiere receta" notice).
const PRESCRIPTION_PRODUCT_HTML = `
<html><head>
<script type="application/ld+json">
{"@context":"http://schema.org/","@type":"Product","name":"Reflexan 10 mg x 20 Comprimidos Recubiertos","mpn":"6","sku":"6","brand":{"@type":"Thing","name":"Reflexan"},"offers":{"url":{},"@type":"Offer","priceCurrency":"CLP","price":"13719","availability":"http://schema.org/InStock"}}
</script>
</head><body>
<ul><li><span>Este producto requiere receta médica simple</span></li></ul>
</body></html>
`;

const OTC_PRODUCT_HTML = `
<html><head>
<script type="application/ld+json">
{"@context":"http://schema.org/","@type":"Product","name":"Paracetamol 500mg 20 comprimidos","sku":"1234","offers":{"@type":"Offer","priceCurrency":"CLP","price":"1990","availability":"http://schema.org/OutOfStock"}}
</script>
</head><body>
<ul><li><span>Retiro en tienda disponible</span></li></ul>
</body></html>
`;

const NO_JSON_LD_HTML = `<html><head></head><body><p>Página sin datos estructurados</p></body></html>`;

describe("fasa.scraper parseProductHtml", () => {
  it("extracts sku, price and the prescription notice from a real product page", () => {
    const result = parseProductHtml(PRESCRIPTION_PRODUCT_HTML, "https://www.farmaciasahumada.cl/reflexan-6.html");
    expect(result).toEqual({
      sku: "6",
      rawName: "Reflexan 10 mg x 20 Comprimidos Recubiertos",
      priceClp: 13719,
      inStock: true,
      productUrl: "https://www.farmaciasahumada.cl/reflexan-6.html",
      regulatoryLabel: "Este producto requiere receta médica simple",
    });
  });

  it("marks out-of-stock products correctly and leaves regulatoryLabel undefined when no notice is present", () => {
    const result = parseProductHtml(OTC_PRODUCT_HTML, "https://www.farmaciasahumada.cl/paracetamol-1234.html");
    expect(result?.inStock).toBe(false);
    expect(result?.regulatoryLabel).toBeUndefined();
    expect(result?.priceClp).toBe(1990);
  });

  it("returns null when the page has no JSON-LD block", () => {
    expect(parseProductHtml(NO_JSON_LD_HTML, "https://www.farmaciasahumada.cl/missing.html")).toBeNull();
  });

  it("returns null for malformed JSON-LD instead of throwing", () => {
    const html = `<script type="application/ld+json">{not valid json</script>`;
    expect(parseProductHtml(html, "https://example.com")).toBeNull();
  });
});
