import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../../web/src/db/index";
import { pharmacyChains, chainProductMappings, prices, medications } from "../../../web/src/db/schema";
import type { ScrapedProduct } from "../scrapers/types";
import { matchProductToMedication, isAutoConfirm } from "./match";

/** Only fills in a canonical image the first time -- never overwrites a curated choice. */
async function applyImageIfMissing(medicationId: number, imageUrl: string | undefined) {
  if (!imageUrl) return;
  await db
    .update(medications)
    .set({ imageUrl })
    .where(and(eq(medications.id, medicationId), isNull(medications.imageUrl)));
}

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
      .set({ lastSeenAt: new Date(), chainProductName: product.rawName, imageUrl: product.imageUrl })
      .where(eq(chainProductMappings.id, mappingId));

    if (existingMapping.medicationId) {
      await applyImageIfMissing(existingMapping.medicationId, product.imageUrl);
    }
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
        imageUrl: product.imageUrl,
        matchStatus: autoConfirm ? "auto_matched" : "pending_review",
        matchConfidence: confidence,
        matchedBy: autoConfirm ? "algorithm" : null,
      })
      .returning();
    mappingId = inserted.id;

    if (autoConfirm) {
      console.log(`  matched -> medication #${medicationId} (confidence ${confidence.toFixed(2)})`);
      await applyImageIfMissing(medicationId!, product.imageUrl);
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
