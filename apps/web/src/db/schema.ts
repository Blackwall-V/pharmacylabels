import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  doublePrecision,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const regulatoryClassEnum = pgEnum("regulatory_class", [
  "venta_libre",
  "receta_simple",
  "receta_retenida",
]);

export const regulatoryClassSourceEnum = pgEnum("regulatory_class_source", [
  "isp_registry",
  "manual_curated",
  "inferred",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "auto_matched",
  "pending_review",
  "confirmed",
  "no_match",
  "ignored",
]);

export const matchedByEnum = pgEnum("matched_by", ["algorithm", "manual"]);

export const priceSourceEnum = pgEnum("price_source", ["scraper", "manual"]);

export const promotionScopeEnum = pgEnum("promotion_scope", [
  "chain_wide",
  "category",
  "specific_medications",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed_amount",
  "nx_price",
]);

export const scrapeRunStatusEnum = pgEnum("scrape_run_status", [
  "success",
  "partial",
  "failed",
]);

// --- Reference / curated data ---

export const pharmacyChains = pgTable("pharmacy_chains", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  scraperEnabled: boolean("scraper_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pharmacyBranches = pgTable(
  "pharmacy_branches",
  {
    id: serial("id").primaryKey(),
    chainId: integer("chain_id")
      .notNull()
      .references(() => pharmacyChains.id),
    name: text("name").notNull(),
    address: text("address"),
    comuna: text("comuna"),
    region: text("region"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    phone: text("phone"),
    openingHours: jsonb("opening_hours"),
    externalBranchCode: text("external_branch_code"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("pharmacy_branches_chain_idx").on(t.chainId),
    index("pharmacy_branches_comuna_idx").on(t.comuna),
    index("pharmacy_branches_region_idx").on(t.region),
  ],
);

export const medications = pgTable(
  "medications",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    canonicalName: text("canonical_name").notNull(),
    activeIngredient: text("active_ingredient"),
    presentation: text("presentation"),
    dosage: text("dosage"),
    packSize: text("pack_size"),
    laboratory: text("laboratory"),
    category: text("category"),
    regulatoryClass: regulatoryClassEnum("regulatory_class"),
    regulatoryClassSource: regulatoryClassSourceEnum("regulatory_class_source"),
    ispRegistroSanitario: text("isp_registro_sanitario"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("medications_active_ingredient_idx").on(t.activeIngredient)],
);

// --- Matching layer ---

export const chainProductMappings = pgTable(
  "chain_product_mappings",
  {
    id: serial("id").primaryKey(),
    chainId: integer("chain_id")
      .notNull()
      .references(() => pharmacyChains.id),
    medicationId: integer("medication_id").references(() => medications.id),
    chainSku: text("chain_sku").notNull(),
    chainProductName: text("chain_product_name").notNull(),
    chainProductUrl: text("chain_product_url"),
    matchStatus: matchStatusEnum("match_status").notNull().default("pending_review"),
    matchConfidence: doublePrecision("match_confidence"),
    matchedBy: matchedByEnum("matched_by"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("chain_product_mappings_chain_sku_idx").on(t.chainId, t.chainSku),
    index("chain_product_mappings_medication_idx").on(t.medicationId),
    index("chain_product_mappings_status_idx").on(t.matchStatus),
  ],
);

// --- Time-series price data ---

export const prices = pgTable(
  "prices",
  {
    id: serial("id").primaryKey(),
    chainProductMappingId: integer("chain_product_mapping_id")
      .notNull()
      .references(() => chainProductMappings.id),
    branchId: integer("branch_id").references(() => pharmacyBranches.id),
    priceClp: integer("price_clp").notNull(),
    inStock: boolean("in_stock").notNull().default(true),
    source: priceSourceEnum("source").notNull().default("scraper"),
    scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("prices_mapping_scraped_idx").on(t.chainProductMappingId, t.scrapedAt),
  ],
);

// --- Curated: promotions/discounts ---

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  chainId: integer("chain_id")
    .notNull()
    .references(() => pharmacyChains.id),
  title: text("title").notNull(),
  description: text("description"),
  scope: promotionScopeEnum("scope").notNull(),
  category: text("category"),
  discountType: discountTypeEnum("discount_type"),
  discountValue: doublePrecision("discount_value"),
  daysOfWeek: integer("days_of_week").array(),
  validFrom: date("valid_from"),
  validTo: date("valid_to"),
  requiresConvenio: boolean("requires_convenio").notNull().default(false),
  sourceUrl: text("source_url"),
  isActive: boolean("is_active").notNull().default(true),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const promotionMedications = pgTable(
  "promotion_medications",
  {
    promotionId: integer("promotion_id")
      .notNull()
      .references(() => promotions.id),
    medicationId: integer("medication_id")
      .notNull()
      .references(() => medications.id),
  },
  (t) => [uniqueIndex("promotion_medications_pk").on(t.promotionId, t.medicationId)],
);

// --- Curated: cajas de compensación ---

export const cajasDeCompensacion = pgTable("cajas_de_compensacion", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const chainConvenios = pgTable("chain_convenios", {
  id: serial("id").primaryKey(),
  chainId: integer("chain_id")
    .notNull()
    .references(() => pharmacyChains.id),
  cajaId: integer("caja_id")
    .notNull()
    .references(() => cajasDeCompensacion.id),
  description: text("description"),
  discountTerms: jsonb("discount_terms"),
  validFrom: date("valid_from"),
  validTo: date("valid_to"),
  sourceUrl: text("source_url"),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
});

// --- Ops/monitoring ---

export const scrapeRuns = pgTable("scrape_runs", {
  id: serial("id").primaryKey(),
  chainId: integer("chain_id")
    .notNull()
    .references(() => pharmacyChains.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: scrapeRunStatusEnum("status"),
  productsFound: integer("products_found"),
  productsMatched: integer("products_matched"),
  errors: jsonb("errors"),
  logUrl: text("log_url"),
});

// --- Relations ---

export const pharmacyChainsRelations = relations(pharmacyChains, ({ many }) => ({
  branches: many(pharmacyBranches),
  productMappings: many(chainProductMappings),
  promotions: many(promotions),
  convenios: many(chainConvenios),
  scrapeRuns: many(scrapeRuns),
}));

export const pharmacyBranchesRelations = relations(pharmacyBranches, ({ one }) => ({
  chain: one(pharmacyChains, {
    fields: [pharmacyBranches.chainId],
    references: [pharmacyChains.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ many }) => ({
  chainProductMappings: many(chainProductMappings),
}));

export const chainProductMappingsRelations = relations(chainProductMappings, ({ one, many }) => ({
  chain: one(pharmacyChains, {
    fields: [chainProductMappings.chainId],
    references: [pharmacyChains.id],
  }),
  medication: one(medications, {
    fields: [chainProductMappings.medicationId],
    references: [medications.id],
  }),
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  chainProductMapping: one(chainProductMappings, {
    fields: [prices.chainProductMappingId],
    references: [chainProductMappings.id],
  }),
  branch: one(pharmacyBranches, {
    fields: [prices.branchId],
    references: [pharmacyBranches.id],
  }),
}));
