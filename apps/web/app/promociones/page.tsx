import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { promotions, pharmacyChains } from "@/src/db/schema";
import { ChainBadge } from "@/components/ChainBadge";

// Without this, Next.js statically optimizes this page at build time (no cookies/
// searchParams/params to signal otherwise) and would serve a frozen snapshot of
// promotions to every visitor instead of live data.
export const dynamic = "force-dynamic";

const DAY_LABELS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export default async function PromocionesPage() {
  const active = await db
    .select({ promotion: promotions, chain: pharmacyChains })
    .from(promotions)
    .innerJoin(pharmacyChains, eq(promotions.chainId, pharmacyChains.id))
    .where(eq(promotions.isActive, true))
    .orderBy(desc(promotions.createdAt));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Promociones activas</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Descuentos vigentes en las farmacias que seguimos, cargados a mano y verificados en la
        fuente.
      </p>

      <ul className="mt-6 space-y-4">
        {active.map(({ promotion, chain }) => (
          <li key={promotion.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p className="min-w-0 font-display font-semibold break-words text-ink">
                {promotion.title}
              </p>
              <Link
                href={`/farmacia/${chain.slug}`}
                className="shrink-0 text-sm font-medium text-brand hover:underline"
              >
                <ChainBadge slug={chain.slug} name={chain.name} />
              </Link>
            </div>
            {promotion.description && (
              <p className="mt-2 text-sm text-ink-soft">{promotion.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-soft">
              {promotion.daysOfWeek && promotion.daysOfWeek.length > 0 && (
                <span className="rounded-full bg-brand-mint px-2.5 py-1 text-brand">
                  {promotion.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ")}
                </span>
              )}
              {promotion.requiresConvenio && (
                <span className="rounded-full bg-surface-sunken px-2.5 py-1">
                  Requiere convenio
                </span>
              )}
            </div>
          </li>
        ))}
        {active.length === 0 && (
          <li className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-ink-soft">
            Todavía no hay promociones cargadas.
          </li>
        )}
      </ul>
    </div>
  );
}
