import { db } from "./index";
import { pharmacyChains, cajasDeCompensacion, medications } from "./schema";

async function main() {
  console.log("Seeding pharmacy_chains...");
  await db
    .insert(pharmacyChains)
    .values([
      {
        slug: "cruz-verde",
        name: "Cruz Verde",
        websiteUrl: "https://www.cruzverde.cl",
        // Validated via Playwright: product data comes from api.cruzverde.cl/product-service,
        // behind an Incapsula WAF requiring a browser session -- see
        // apps/worker/src/scrapers/cruzverde.scraper.ts.
        scraperEnabled: true,
      },
      {
        slug: "salcobrand",
        name: "Salcobrand",
        websiteUrl: "https://salcobrand.cl",
        // Validated: server-rendered (Spree Commerce) with a `product_traker_data` JS object
        // exposing sku/name/price/stock AND a structured saleType regulatory field --
        // see apps/worker/src/scrapers/salcobrand.scraper.ts.
        scraperEnabled: true,
      },
      {
        slug: "farmacias-ahumada",
        name: "Farmacias Ahumada",
        websiteUrl: "https://www.farmaciasahumada.cl",
        // Validated: product pages are server-rendered (Salesforce Commerce Cloud) with a
        // schema.org JSON-LD block exposing sku/name/price -- see apps/worker/src/scrapers/fasa.scraper.ts.
        scraperEnabled: true,
      },
      {
        slug: "dr-simi",
        name: "Farmacias Dr. Simi",
        websiteUrl: "https://www.drsimi.cl",
        // robots.txt disallows ClaudeBot explicitly -- no automated scraping, manual-entry only if ever included.
        scraperEnabled: false,
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding cajas_de_compensacion...");
  await db
    .insert(cajasDeCompensacion)
    .values([
      { slug: "los-andes", name: "Caja Los Andes" },
      { slug: "la-araucana", name: "Caja La Araucana" },
      { slug: "18-de-septiembre", name: "Caja 18 de Septiembre" },
      { slug: "los-heroes", name: "Caja Los Héroes" },
    ])
    .onConflictDoNothing();

  console.log("Seeding medications (small curated starter set)...");
  // NOTE: regulatory_class values here are a starting point for common,
  // well-established Chilean OTC/prescription categories. Each entry needs
  // to be verified/confirmed against the ISP Registro Sanitario before being
  // trusted in production -- see regulatoryClassSource: "manual_curated".
  await db
    .insert(medications)
    .values([
      {
        slug: "paracetamol-500mg",
        canonicalName: "Paracetamol 500mg",
        activeIngredient: "Paracetamol",
        presentation: "Comprimidos",
        dosage: "500mg",
        category: "Analgésico",
        regulatoryClass: "venta_libre",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "ibuprofeno-400mg",
        canonicalName: "Ibuprofeno 400mg",
        activeIngredient: "Ibuprofeno",
        presentation: "Comprimidos",
        dosage: "400mg",
        category: "Analgésico/Antiinflamatorio",
        regulatoryClass: "venta_libre",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "loratadina-10mg",
        canonicalName: "Loratadina 10mg",
        activeIngredient: "Loratadina",
        presentation: "Comprimidos",
        dosage: "10mg",
        category: "Antihistamínico",
        regulatoryClass: "venta_libre",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "omeprazol-20mg",
        canonicalName: "Omeprazol 20mg",
        activeIngredient: "Omeprazol",
        presentation: "Cápsulas",
        dosage: "20mg",
        category: "Antiácido",
        regulatoryClass: "venta_libre",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "amoxicilina-500mg",
        canonicalName: "Amoxicilina 500mg",
        activeIngredient: "Amoxicilina",
        presentation: "Cápsulas",
        dosage: "500mg",
        category: "Antibiótico",
        regulatoryClass: "receta_simple",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "losartan-50mg",
        canonicalName: "Losartán 50mg",
        activeIngredient: "Losartán potásico",
        presentation: "Comprimidos",
        dosage: "50mg",
        category: "Antihipertensivo",
        regulatoryClass: "receta_simple",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "metformina-850mg",
        canonicalName: "Metformina 850mg",
        activeIngredient: "Metformina",
        presentation: "Comprimidos",
        dosage: "850mg",
        category: "Antidiabético",
        regulatoryClass: "receta_simple",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "clonazepam-2mg",
        canonicalName: "Clonazepam 2mg",
        activeIngredient: "Clonazepam",
        presentation: "Comprimidos",
        dosage: "2mg",
        category: "Ansiolítico",
        regulatoryClass: "receta_retenida",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "tramadol-50mg",
        canonicalName: "Tramadol 50mg",
        activeIngredient: "Tramadol",
        presentation: "Cápsulas",
        dosage: "50mg",
        category: "Analgésico opioide",
        regulatoryClass: "receta_retenida",
        regulatoryClassSource: "manual_curated",
      },
      {
        slug: "alprazolam-0-5mg",
        canonicalName: "Alprazolam 0.5mg",
        activeIngredient: "Alprazolam",
        presentation: "Comprimidos",
        dosage: "0.5mg",
        category: "Ansiolítico",
        regulatoryClass: "receta_retenida",
        regulatoryClassSource: "manual_curated",
      },
    ])
    .onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
