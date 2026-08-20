import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "../../../web/src/db/index";
import { pharmacyChains, scrapeRuns } from "../../../web/src/db/schema";
import { fasaScraper } from "../scrapers/fasa.scraper";
import { salcobrandScraper } from "../scrapers/salcobrand.scraper";
import { cruzVerdeScraper } from "../scrapers/cruzverde.scraper";
import { persistScrapedProduct } from "../pipeline/persist";
import type { PharmacyScraper } from "../scrapers/types";

const USER_AGENT =
  "FarmacomparaBot/0.1 (proyecto personal de comparación de precios de farmacias en Chile; contacto: bastisek.cuello@gmail.com)";

const scrapers: Record<string, PharmacyScraper> = {
  "farmacias-ahumada": fasaScraper,
  salcobrand: salcobrandScraper,
  "cruz-verde": cruzVerdeScraper,
};

const SITEMAP_URLS: Record<string, string> = {
  "farmacias-ahumada": "https://www.farmaciasahumada.cl/sitemap_0-product.xml",
  salcobrand: "https://salcobrand.cl/sitemap3.xml",
  "cruz-verde": "https://www.cruzverde.cl/sitemap_0-product.xml",
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The site's WAF applies a short-window burst rate limit (observed: occasional 403s
 * that clear within a few seconds), not a hard block. Retry with backoff instead of
 * failing the whole run on a transient hit.
 */
async function getProductUrlsFromSitemap(
  sitemapUrl: string,
  limit: number,
  urlFilter: (url: string) => boolean = () => true,
): Promise<string[]> {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(sitemapUrl, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      const xml = await res.text();
      const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter(urlFilter);
      return matches.slice(0, limit);
    }
    console.warn(`  sitemap fetch got ${res.status} (attempt ${attempt}/${maxAttempts})`);
    if (attempt < maxAttempts) await delay(3000 * attempt);
  }
  throw new Error(`Failed to fetch sitemap after ${maxAttempts} attempts: ${sitemapUrl}`);
}

// Salcobrand's sitemap mixes non-product listing/category pages in with real products.
const SITEMAP_URL_FILTERS: Record<string, (url: string) => boolean> = {
  salcobrand: (url) => /\/products\/.+/.test(url),
};

async function main() {
  const chainSlug = process.argv.find((a) => a.startsWith("--chain="))?.split("=")[1];
  const limit = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "15");
  const urlsFile = process.argv.find((a) => a.startsWith("--urls-file="))?.split("=")[1];

  if (!chainSlug || !scrapers[chainSlug]) {
    console.error(`Usage: run-scraper.ts --chain=<${Object.keys(scrapers).join("|")}> [--limit=N]`);
    process.exit(1);
  }

  const [chain] = await db.select().from(pharmacyChains).where(eq(pharmacyChains.slug, chainSlug)).limit(1);
  if (!chain) throw new Error(`Chain ${chainSlug} not found in DB -- run db:seed first`);

  const [run] = await db.insert(scrapeRuns).values({ chainId: chain.id }).returning();

  let found = 0;
  let matched = 0;
  const errors: string[] = [];

  try {
    let productUrls: string[];
    if (urlsFile) {
      console.log(`Reading product URLs from ${urlsFile}...`);
      productUrls = readFileSync(urlsFile, "utf-8")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, limit);
    } else {
      console.log(`Fetching product URLs for ${chainSlug} from sitemap (limit ${limit})...`);
      productUrls = await getProductUrlsFromSitemap(
        SITEMAP_URLS[chainSlug],
        limit,
        SITEMAP_URL_FILTERS[chainSlug],
      );
    }
    console.log(`Got ${productUrls.length} URLs. Scraping...`);

    for await (const product of scrapers[chainSlug].scrape(productUrls)) {
      found++;
      console.log(`[${found}/${productUrls.length}] ${product.rawName} -> $${product.priceClp}`);
      try {
        await persistScrapedProduct(chainSlug, product);
        matched++;
      } catch (err) {
        errors.push(`${product.sku}: ${(err as Error).message}`);
      }
    }

    await db
      .update(scrapeRuns)
      .set({
        finishedAt: new Date(),
        status: errors.length === 0 ? "success" : "partial",
        productsFound: found,
        productsMatched: matched,
        errors: errors.length ? errors : null,
      })
      .where(eq(scrapeRuns.id, run.id));
  } catch (err) {
    await db
      .update(scrapeRuns)
      .set({
        finishedAt: new Date(),
        status: "failed",
        productsFound: found,
        productsMatched: matched,
        errors: [(err as Error).message],
      })
      .where(eq(scrapeRuns.id, run.id));
    throw err;
  }

  console.log(`Done. Found ${found}, persisted ${matched}, errors ${errors.length}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
