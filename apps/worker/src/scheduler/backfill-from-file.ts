/**
 * One-off tool: parse and persist a product page HTML that was already fetched and
 * saved to disk, without making a new network request. Useful right after a scraper
 * hits a rate limit -- lets the rest of the pipeline (matching, persistence) be
 * exercised/backfilled without hammering the source site again while it's cooling down.
 *
 * Usage: tsx backfill-from-file.ts --chain=farmacias-ahumada --file=<path> --url=<original-url>
 */
import { readFileSync } from "node:fs";
import { parseProductHtml } from "../scrapers/fasa.scraper";
import { persistScrapedProduct } from "../pipeline/persist";

async function main() {
  const chainSlug = process.argv.find((a) => a.startsWith("--chain="))?.split("=")[1];
  const filePath = process.argv.find((a) => a.startsWith("--file="))?.split("=")[1];
  const url = process.argv.find((a) => a.startsWith("--url="))?.split("=")[1];

  if (!chainSlug || !filePath || !url) {
    console.error("Usage: backfill-from-file.ts --chain=<slug> --file=<path> --url=<original-url>");
    process.exit(1);
  }

  const html = readFileSync(filePath, "utf-8");
  const product = parseProductHtml(html, url);
  if (!product) {
    console.error("Could not parse product from file.");
    process.exit(1);
  }

  console.log(`Parsed: ${product.rawName} -> $${product.priceClp} (sku ${product.sku})`);
  await persistScrapedProduct(chainSlug, product);
  console.log("Persisted.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
