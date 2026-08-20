import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { promotions, pharmacyChains } from "@/src/db/schema";

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
      <Link href="/" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← Farmacompara
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Promociones activas</h1>

      <ul className="mt-6 space-y-4">
        {active.map(({ promotion, chain }) => (
          <li key={promotion.id} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{promotion.title}</p>
              <Link href={`/farmacia/${chain.slug}`} className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
                {chain.name}
              </Link>
            </div>
            {promotion.description && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{promotion.description}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
              {promotion.daysOfWeek && promotion.daysOfWeek.length > 0 && (
                <span>Válido: {promotion.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ")}</span>
              )}
              {promotion.requiresConvenio && <span>· Requiere convenio</span>}
            </div>
          </li>
        ))}
        {active.length === 0 && (
          <li className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
            Todavía no hay promociones cargadas.
          </li>
        )}
      </ul>
    </div>
  );
}
