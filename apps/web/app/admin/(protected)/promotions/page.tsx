import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { promotions, pharmacyChains } from "@/src/db/schema";
import { createPromotion } from "./actions";

// Without this, Next.js statically optimizes admin pages at build time and would
// serve a frozen snapshot instead of live data.
export const dynamic = "force-dynamic";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function AdminPromotionsPage() {
  const chains = await db.select().from(pharmacyChains);
  const existing = await db
    .select({ promotion: promotions, chain: pharmacyChains })
    .from(promotions)
    .innerJoin(pharmacyChains, eq(promotions.chainId, pharmacyChains.id))
    .orderBy(desc(promotions.createdAt));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Promociones</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Cargadas a mano revisando la página de promociones de cada cadena. No hay fuente pública
        estructurada para esto.
      </p>

      <form action={createPromotion} className="mt-8 space-y-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select name="chainId" required className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">Cadena...</option>
            {chains.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="scope" required defaultValue="chain_wide" className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="chain_wide">Toda la cadena</option>
            <option value="category">Categoría</option>
            <option value="specific_medications">Medicamentos específicos</option>
          </select>
        </div>
        <input name="title" required placeholder="Título (ej: Martes de descuento adulto mayor)" className="w-full rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        <textarea name="description" placeholder="Descripción" className="w-full rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        <input name="category" placeholder="Categoría (si aplica)" className="w-full rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select name="discountType" className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">Tipo de descuento...</option>
            <option value="percentage">Porcentaje</option>
            <option value="fixed_amount">Monto fijo</option>
            <option value="nx_price">Nx precio (ej: 3x2)</option>
          </select>
          <input name="discountValue" type="number" step="0.01" placeholder="Valor" className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        </div>
        <div>
          <p className="mb-1 text-xs text-zinc-500">Días de la semana (vacío = todos los días)</p>
          <div className="flex flex-wrap gap-3">
            {DAY_LABELS.map((label, i) => (
              <label key={i} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="daysOfWeek" value={i} /> {label}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="validFrom" type="date" className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
          <input name="validTo" type="date" className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requiresConvenio" /> Requiere convenio (ej. caja de compensación)
        </label>
        <input name="sourceUrl" placeholder="URL fuente" className="w-full rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        <button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white">
          Agregar promoción
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {existing.map(({ promotion, chain }) => (
          <li key={promotion.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {chain.name} — {promotion.title}
            </p>
            {promotion.description && <p className="text-zinc-500">{promotion.description}</p>}
            {promotion.daysOfWeek && promotion.daysOfWeek.length > 0 && (
              <p className="text-xs text-zinc-500">
                Días: {promotion.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ")}
              </p>
            )}
          </li>
        ))}
        {existing.length === 0 && <li className="text-center text-zinc-500">Sin promociones cargadas aún.</li>}
      </ul>
    </div>
  );
}
