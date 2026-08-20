import { eq, and } from "drizzle-orm";
import { db } from "../../../web/src/db/index";
import { pharmacyChains, chainProductMappings, prices } from "../../../web/src/db/schema";
import type { ScrapedProduct } from "../scrapers/types";
import { matchProductToMedication, isAutoConfirm } from "./match";

export async function persistScrapedProduct(chainSlug: string, product: ScrapedProduct) {
  const [chain] = await db
    .select()
    .from(pharmacyChains)
    .where(eq(pharmacyChains.slug, chainSlug))
    .limit(1);
  if (!chain) throw new Error(`Unknown chain slug: ${chainSlug}`);

  const [existingMapping] = await db
    .select()
    .from(chainProductMappings)
    .where(
      and(eq(chainProductMappings.chainId, chain.id), eq(chainProductMappings.chainSku, product.sku)),
    )
    .limit(1);

  let mappingId: number;

  if (existingMapping) {
    mappingId = existingMapping.id;
    await db
      .update(chainProductMappings)
      .set({ lastSeenAt: new Date(), chainProductName: product.rawName })
      .where(eq(chainProductMappings.id, mappingId));
  } else {
    const { medicationId, confidence } = await matchProductToMedication(product.rawName);
    const autoConfirm = medicationId !== null && isAutoConfirm(confidence);

    const [inserted] = await db
      .insert(chainProductMappings)
      .values({
        chainId: chain.id,
        medicationId: autoConfirm ? medicationId : null,
        chainSku: product.sku,
        chainProductName: product.rawName,
        chainProductUrl: product.productUrl,
        matchStatus: autoConfirm ? "auto_matched" : "pending_review",
        matchConfidence: confidence,
        matchedBy: autoConfirm ? "algorithm" : null,
      })
      .returning();
    mappingId = inserted.id;

    if (autoConfirm) {
      console.log(`  matched -> medication #${medicationId} (confidence ${confidence.toFixed(2)})`);
    } else {
      console.log(`  pending_review (best confidence ${confidence.toFixed(2)})`);
    }
  }

  await db.insert(prices).values({
    chainProductMappingId: mappingId,
    priceClp: product.priceClp,
    inStock: product.inStock,
    source: "scraper",
  });

  if (product.regulatoryLabel) {
    console.log(`  regulatory label on page: "${product.regulatoryLabel}" (not auto-applied -- curate via /admin)`);
  }
}
