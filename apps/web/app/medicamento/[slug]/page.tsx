import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, inArray, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { medications, chainProductMappings, pharmacyChains, prices } from "@/src/db/schema";
import { RegulatoryBadge } from "@/components/RegulatoryBadge";
import { PriceTicket } from "@/components/PriceTicket";
import { PillIcon } from "@/components/PillIcon";

export const dynamic = "force-dynamic";

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

  const cheapest = sortedRows[0]?.latestPrice?.priceClp;
  const priciest = sortedRows[sortedRows.length - 1]?.latestPrice?.priceClp;
  const savings = cheapest && priciest && priciest > cheapest ? priciest - cheapest : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/buscar" className="text-sm font-medium text-brand hover:underline">
        ← Volver a la búsqueda
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {medication.imageUrl ? (
            // Real product photo scraped from the chain's own page -- plain <img>
            // since it's hotlinked from an external, unpredictable set of hosts.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={medication.imageUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl border border-line bg-white object-contain p-1.5"
            />
          ) : (
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-mint text-brand">
              <PillIcon />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold break-words text-ink">
              {medication.canonicalName}
            </h1>
            {medication.activeIngredient && (
              <p className="text-ink-soft">
                {medication.activeIngredient}
                {medication.dosage ? ` · ${medication.dosage}` : ""}
                {medication.presentation ? ` · ${medication.presentation}` : ""}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0">
          <RegulatoryBadge regulatoryClass={medication.regulatoryClass} />
        </span>
      </div>

      {savings && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-price-soft px-4 py-3">
          <span className="font-data text-lg font-bold text-price">
            Ahorra ${savings.toLocaleString("es-CL")}
          </span>
          <span className="text-sm text-ink-soft">eligiendo la farmacia más barata</span>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {sortedRows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-ink-soft">
            Todavía no hay precios confirmados de ninguna cadena para este medicamento. Los productos
            recién scrapeados pasan primero por una cola de revisión manual antes de aparecer aquí.
          </p>
        ) : (
          sortedRows.map(({ mapping, chain, latestPrice }, i) => (
            <PriceTicket
              key={mapping.id}
              chainSlug={chain.slug}
              chainName={chain.name}
              priceClp={latestPrice!.priceClp}
              freshnessLabel={`actualizado ${timeAgo(latestPrice!.scrapedAt)}`}
              inStock={latestPrice!.inStock}
              isCheapest={i === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
