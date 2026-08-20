import { chromium, type Browser } from "playwright";
import type { PharmacyScraper, ScrapedProduct } from "./types";

const USER_AGENT =
  "FarmacomparaBot/0.1 (proyecto personal de comparación de precios de farmacias en Chile; contacto: bastisek.cuello@gmail.com)";

// Cruz Verde's Angular SPA renders nothing server-side; the actual product data comes
// from an internal API (api.cruzverde.cl/product-service/products/detail/{id}) that sits
// behind an Incapsula WAF requiring a browser-established session. Driving a real headless
// browser is the only way found to reach it -- see apps/worker/src/scheduler/scraper.config.ts.
const API_PATH = "/product-service/products/detail/";

interface CruzVerdeProductData {
  id: string;
  name: string;
  price: number;
  prices?: Record<string, number>;
  stock?: number;
  prescription?: "simple" | "restricted";
  activeIngredient?: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function regulatoryLabelFor(prescription: string | undefined): string | undefined {
  if (prescription === "restricted") return "receta_retenida";
  if (prescription === "simple") return "receta_simple";
  return "venta_libre"; // field is absent entirely for OTC products
}

/** Pure parser, decoupled from the browser -- mirrors the other scrapers' parseProductHtml. */
export function parseApiResponse(apiBody: string, url: string): ScrapedProduct | null {
  const parsed = JSON.parse(apiBody) as { productData?: CruzVerdeProductData };
  const data = parsed.productData;
  if (!data?.id || !data.name || typeof data.price !== "number") return null;

  const salePrice = data.prices?.["price-sale-cl"];

  return {
    sku: data.id,
    rawName: data.name,
    priceClp: Math.round(salePrice ?? data.price),
    inStock: (data.stock ?? 0) > 0,
    productUrl: url,
    regulatoryLabel: regulatoryLabelFor(data.prescription),
  };
}

async function scrapeOne(browser: Browser, url: string): Promise<ScrapedProduct | null> {
  const page = await browser.newPage({ userAgent: USER_AGENT });
  try {
    let apiBody: string | null = null;
    page.on("response", async (res) => {
      if (res.url().includes(API_PATH) && res.status() === 200 && !apiBody) {
        apiBody = await res.text().catch(() => null);
      }
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    if (!apiBody) {
      console.warn(`[cruzverde] no product-service response captured for ${url}`);
      return null;
    }

    return parseApiResponse(apiBody, url);
  } catch (err) {
    console.warn(`[cruzverde] error scraping ${url}:`, (err as Error).message);
    return null;
  } finally {
    await page.close();
  }
}

export const cruzVerdeScraper: PharmacyScraper = {
  chainSlug: "cruz-verde",
  async *scrape(productUrls: string[]) {
    const browser = await chromium.launch();
    try {
      for (const url of productUrls) {
        const product = await scrapeOne(browser, url);
        if (product) yield product;
        await delay(1500);
      }
    } finally {
      await browser.close();
    }
  },
};
