import * as cheerio from "cheerio";
import type { PharmacyScraper, ScrapedProduct } from "./types";

const USER_AGENT =
  "FarmacomparaBot/0.1 (proyecto personal de comparación de precios de farmacias en Chile; contacto: bastisek.cuello@gmail.com)";

interface ProductLd {
  sku?: string;
  name?: string;
  image?: string[];
  offers?: { price?: string; priceCurrency?: string; availability?: string };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, maxAttempts = 3): Promise<Response | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) return res;
    // Transient WAF/rate-limit response -- back off and retry rather than giving up immediately.
    if ((res.status === 403 || res.status === 429) && attempt < maxAttempts) {
      console.warn(`[fasa] ${res.status} on attempt ${attempt}/${maxAttempts}, backing off`);
      await delay(3000 * attempt);
      continue;
    }
    console.warn(`[fasa] ${res.status} fetching ${url}`);
    return null;
  }
  return null;
}

/** Pure parser, decoupled from fetching -- reused by the live scraper and by fixture-based tests/backfills. */
export function parseProductHtml(html: string, url: string): ScrapedProduct | null {
  const $ = cheerio.load(html);

  const ldJsonRaw = $('script[type="application/ld+json"]').first().html();
  if (!ldJsonRaw) {
    console.warn(`[fasa] no JSON-LD found on ${url}`);
    return null;
  }

  let ld: ProductLd;
  try {
    ld = JSON.parse(ldJsonRaw);
  } catch {
    console.warn(`[fasa] failed to parse JSON-LD on ${url}`);
    return null;
  }

  if (!ld.sku || !ld.name || !ld.offers?.price) {
    return null;
  }

  // Regulatory classification is shown as a plain-text notice near the "add to cart" area,
  // e.g. "Este producto requiere receta médica simple" / "... receta médica retenida".
  let regulatoryLabel: string | undefined;
  $("li span").each((_, el) => {
    const text = $(el).text().trim();
    if (/requiere receta/i.test(text)) {
      regulatoryLabel = text;
    }
  });

  return {
    sku: ld.sku,
    rawName: ld.name,
    priceClp: Math.round(Number(ld.offers.price)),
    inStock: ld.offers.availability?.includes("InStock") ?? false,
    productUrl: url,
    regulatoryLabel,
    imageUrl: ld.image?.[0],
  };
}

async function fetchProductPage(url: string): Promise<ScrapedProduct | null> {
  const res = await fetchWithRetry(url);
  if (!res) return null;
  const html = await res.text();
  return parseProductHtml(html, url);
}

export const fasaScraper: PharmacyScraper = {
  chainSlug: "farmacias-ahumada",
  async *scrape(productUrls: string[]) {
    for (const url of productUrls) {
      try {
        const product = await fetchProductPage(url);
        if (product) yield product;
      } catch (err) {
        console.warn(`[fasa] error fetching ${url}:`, (err as Error).message);
      }
      // Conservative per-request delay -- see scheduler/scraper.config.ts for the rationale.
      await delay(1500);
    }
  },
};
