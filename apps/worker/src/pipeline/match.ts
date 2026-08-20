import { sql } from "drizzle-orm";
import { db } from "../../../web/src/db/index";
import { normalizeProductName } from "./normalize";

export interface MatchResult {
  medicationId: number | null;
  confidence: number;
}

const AUTO_CONFIRM_THRESHOLD = 0.45;

/**
 * Fuzzy-matches a scraped product name against the canonical medications catalog
 * using pg_trgm similarity. Never writes to `medications` directly -- callers decide
 * whether to auto-confirm (above threshold) or queue for manual review.
 */
export async function matchProductToMedication(rawName: string): Promise<MatchResult> {
  const normalized = normalizeProductName(rawName);

  const rows = await db.execute<{ id: number; similarity: number }>(sql`
    select id, similarity(lower(canonical_name), ${normalized}) as similarity
    from medications
    order by similarity desc
    limit 1
  `);

  const best = rows[0];
  if (!best || best.similarity < 0.15) {
    return { medicationId: null, confidence: best?.similarity ?? 0 };
  }

  return { medicationId: best.id, confidence: best.similarity };
}

export function isAutoConfirm(confidence: number): boolean {
  return confidence >= AUTO_CONFIRM_THRESHOLD;
}
