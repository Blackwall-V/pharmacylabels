import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, inArray, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { medications, chainProductMappings, pharmacyChains, prices } from "@/src/db/schema";
import { RegulatoryBadge } from "@/components/RegulatoryBadge";

function timeAgo(date: Date): string {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} días`;
}

export default async function MedicamentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [medication] = await db.select().from(medications).where(eq(medications.slug, slug)).limit(1);
  if (!medication) notFound();

  const mappings = await db
    .select({ mapping: chainProductMappings, chain: pharmacyChains })
    .from(chainProductMappings)
    .innerJoin(pharmacyChains, eq(chainProductMappings.chainId, pharmacyChains.id))
    .where(
      and(
        eq(chainProductMappings.medicationId, medication.id),
        inArray(chainProductMappings.matchStatus, ["confirmed", "auto_matched"]),
      ),
    );

  const rows = await Promise.all(
    mappings.map(async ({ mapping, chain }) => {
      const [latestPrice] = await db
        .select()
        .from(prices)
        .where(eq(prices.chainProductMappingId, mapping.id))
        .orderBy(desc(prices.scrapedAt))
        .limit(1);
      return { mapping, chain, latestPrice };
    }),
  );

  const sortedRows = rows
    .filter((r) => r.latestPrice)
    .sort((a, b) => a.latestPrice!.priceClp - b.latestPrice!.priceClp);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/buscar" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← Volver a la búsqueda
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {medication.canonicalName}
          </h1>
          {medication.activeIngredient && (
            <p className="text-zinc-500">
              {medication.activeIngredient}
              {medication.dosage ? ` · ${medication.dosage}` : ""}
              {medication.presentation ? ` · ${medication.presentation}` : ""}
            </p>
          )}
        </div>
        <RegulatoryBadge regulatoryClass={medication.regulatoryClass} />
      </div>

      <div className="mt-8">
        {sortedRows.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
            Todavía no hay precios confirmados de ninguna cadena para este medicamento. Los productos
            recién scrapeados pasan primero por una cola de revisión manual antes de aparecer aquí.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {sortedRows.map(({ mapping, chain, latestPrice }, i) => (
              <li key={mapping.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {chain.name} {i === 0 && <span className="ml-1 text-xs text-emerald-600">· más barato</span>}
                  </p>
                  <p className="text-xs text-zinc-500">
                    actualizado {timeAgo(latestPrice!.scrapedAt)}
                    {!latestPrice!.inStock && " · sin stock"}
                  </p>
                </div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  ${latestPrice!.priceClp.toLocaleString("es-CL")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
