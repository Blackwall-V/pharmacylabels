export interface ChainScraperConfig {
  chainSlug: string;
  /** Cron expression for production scheduling (not wired to an actual cron runner yet -- Milestone 4). */
  cronExpression: string;
  minDelayMs: number;
  respectRobotsTxt: true;
  /** Why this chain is scraped this way -- keep the reasoning next to the config, not buried in code. */
  notes: string;
}

export const scraperConfigs: Record<string, ChainScraperConfig> = {
  "farmacias-ahumada": {
    chainSlug: "farmacias-ahumada",
    cronExpression: "0 6 * * *", // once/day at 06:00
    minDelayMs: 1500,
    respectRobotsTxt: true,
    notes:
      "Server-rendered (Salesforce Commerce Cloud), price + sku + regulatory label available via plain HTTP + schema.org JSON-LD. robots.txt allows product pages.",
  },
  "cruz-verde": {
    chainSlug: "cruz-verde",
    cronExpression: "0 6 * * *",
    minDelayMs: 1500,
    respectRobotsTxt: true,
    notes:
      "Angular SPA with no data in initial HTML. Product data comes from api.cruzverde.cl/product-service/products/detail/{id}, behind an Incapsula WAF that requires a browser-established session -- scraped via Playwright, intercepting that response instead of parsing the DOM. Also the richest data source of the three: includes live stock count and a structured `prescription` field (absent/simple/restricted).",
  },
  salcobrand: {
    chainSlug: "salcobrand",
    cronExpression: "0 6 * * *",
    minDelayMs: 1500,
    respectRobotsTxt: true,
    notes:
      "Server-rendered (Spree Commerce). Each product page embeds a `product_traker_data` JS object with sku/name/price/stock and a structured saleType field (not_drug/prescription/restricted) that maps cleanly to venta_libre/receta_simple/receta_retenida. robots.txt allows product pages.",
  },
  "dr-simi": {
    chainSlug: "dr-simi",
    cronExpression: "",
    minDelayMs: 0,
    respectRobotsTxt: true,
    notes:
      "robots.txt explicitly disallows ClaudeBot (Disallow: / for User-agent: ClaudeBot). Excluded from automated scraping -- manual entry only if ever included.",
  },
};
