import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/src/db";
import { chainProductMappings, pharmacyChains } from "@/src/db/schema";
import { confirmMapping, rejectMapping, createMedicationFromMapping } from "../actions";

// Without this, Next.js statically optimizes admin pages at build time and would
// serve a frozen snapshot instead of the live matching queue.
export const dynamic = "force-dynamic";

interface CandidateRow {
  [key: string]: unknown;
  id: number;
  canonical_name: string;
  similarity: number;
}

async function getCandidates(rawName: string): Promise<CandidateRow[]> {
  return db.execute<CandidateRow>(sql`
    select id, canonical_name, similarity(lower(canonical_name), lower(${rawName})) as similarity
    from medications
    order by similarity desc
    limit 5
  `);
}

export default async function MatchingQueuePage() {
  const pending = await db
    .select({ mapping: chainProductMappings, chain: pharmacyChains })
    .from(chainProductMappings)
    .innerJoin(pharmacyChains, eq(chainProductMappings.chainId, pharmacyChains.id))
    .where(eq(chainProductMappings.matchStatus, "pending_review"));

  const withCandidates = await Promise.all(
    pending.map(async (row) => ({
      ...row,
      candidates: await getCandidates(row.mapping.chainProductName),
    })),
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Cola de revisión de matching</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Productos scrapeados que no alcanzaron el umbral de confianza para auto-confirmarse.
      </p>

      <ul className="mt-8 space-y-6">
        {withCandidates.map(({ mapping, chain, candidates }) => (
          <li key={mapping.id} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{chain.name}</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{mapping.chainProductName}</p>
            <p className="text-xs text-zinc-500">SKU {mapping.chainSku}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {candidates.map((c) => (
                <form key={c.id} action={confirmMapping}>
                  <input type="hidden" name="mappingId" value={mapping.id} />
                  <input type="hidden" name="medicationId" value={c.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-emerald-300 px-3 py-1 text-sm text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  >
                    {c.canonical_name} ({(c.similarity * 100).toFixed(0)}%)
                  </button>
                </form>
              ))}
              <form action={rejectMapping}>
                <input type="hidden" name="mappingId" value={mapping.id} />
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  No es ninguno
                </button>
              </form>
            </div>

            <form action={createMedicationFromMapping} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="mappingId" value={mapping.id} />
              <input
                name="canonicalName"
                defaultValue={mapping.chainProductName}
                placeholder="Nombre canónico del medicamento nuevo"
                className="min-w-0 flex-1 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-md bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Crear como medicamento nuevo
              </button>
            </form>
          </li>
        ))}
        {withCandidates.length === 0 && (
          <li className="py-8 text-center text-zinc-500">No hay productos pendientes de revisión.</li>
        )}
      </ul>
    </div>
  );
}
