import type { PharmacyScraper, ScrapedProduct } from "./types";

const USER_AGENT =
  "FarmacomparaBot/0.1 (proyecto personal de comparación de precios de farmacias en Chile; contacto: bastisek.cuello@gmail.com)";

// Salcobrand's own regulatory classification, embedded directly in each product page's
// `product_traker_data.params.saleType` field. Confirmed against real products:
// paracetamol -> not_drug, amoxicilina -> prescription, clonazepam -> restricted.
const SALE_TYPE_TO_REGULATORY_CLASS: Record<string, string> = {
  not_drug: "venta_libre",
  prescription: "receta_simple",
  restricted: "receta_retenida",
};

interface ProductTrakerData {
  name?: string;
  price?: string;
  isAvailable?: boolean;
  productIDs?: string[];
  url?: string;
  pictureUrl?: string;
  params?: { saleType?: string };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, maxAttempts = 3): Promise<Response | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) return res;
    if ((res.status === 403 || res.status === 429) && attempt < maxAttempts) {
      console.warn(`[salcobrand] ${res.status} on attempt ${attempt}/${maxAttempts}, backing off`);
      await delay(3000 * attempt);
      continue;
    }
    console.warn(`[salcobrand] ${res.status} fetching ${url}`);
    return null;
  }
  return null;
}

/** Pure parser, decoupled from fetching -- mirrors fasa.scraper.ts's parseProductHtml. */
export function parseProductHtml(html: string, url: string): ScrapedProduct | null {
  const match = html.match(/var product_traker_data = (\{.*?\});/);
  if (!match) {
    console.warn(`[salcobrand] no product_traker_data found on ${url}`);
    return null;
  }

  let data: ProductTrakerData;
  try {
    data = JSON.parse(match[1]);
  } catch {
    console.warn(`[salcobrand] failed to parse product_traker_data on ${url}`);
    return null;
  }

  const sku = data.productIDs?.[0];
  if (!sku || !data.name || !data.price) return null;

  const saleType = data.params?.saleType;
  const regulatoryLabel = saleType ? SALE_TYPE_TO_REGULATORY_CLASS[saleType] : undefined;

  return {
    sku,
    rawName: data.name,
    priceClp: Math.round(Number(data.price)),
    inStock: data.isAvailable ?? false,
    productUrl: url,
    regulatoryLabel,
    imageUrl: data.pictureUrl,
  };
}

async function fetchProductPage(url: string): Promise<ScrapedProduct | null> {
  const res = await fetchWithRetry(url);
  if (!res) return null;
  const html = await res.text();
  return parseProductHtml(html, url);
}

export const salcobrandScraper: PharmacyScraper = {
  chainSlug: "salcobrand",
  async *scrape(productUrls: string[]) {
    for (const url of productUrls) {
      try {
        const product = await fetchProductPage(url);
        if (product) yield product;
      } catch (err) {
        console.warn(`[salcobrand] error fetching ${url}:`, (err as Error).message);
      }
      await delay(1500);
    }
  },
};
