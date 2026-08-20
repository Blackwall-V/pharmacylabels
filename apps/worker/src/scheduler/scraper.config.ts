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
      "Angular SPA with no data in initial HTML; lazy-loaded chunks not discoverable via plain HTTP. Needs a Playwright-based scraper (network interception on api.cruzverde.cl) -- not implemented yet.",
  },
  salcobrand: {
    chainSlug: "salcobrand",
    cronExpression: "0 6 * * *",
    minDelayMs: 1500,
    respectRobotsTxt: true,
    notes: "robots.txt permits crawling; page rendering approach not yet investigated. Feasibility pending.",
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
