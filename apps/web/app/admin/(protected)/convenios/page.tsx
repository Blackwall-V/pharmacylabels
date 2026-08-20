import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { chainConvenios, pharmacyChains, cajasDeCompensacion } from "@/src/db/schema";
import { createConvenio } from "./actions";

// Without this, Next.js statically optimizes admin pages at build time and would
// serve a frozen snapshot instead of live data.
export const dynamic = "force-dynamic";

export default async function AdminConveniosPage() {
  const chains = await db.select().from(pharmacyChains);
  const cajas = await db.select().from(cajasDeCompensacion);
  const existing = await db
    .select({ convenio: chainConvenios, chain: pharmacyChains, caja: cajasDeCompensacion })
    .from(chainConvenios)
    .innerJoin(pharmacyChains, eq(chainConvenios.chainId, pharmacyChains.id))
    .innerJoin(cajasDeCompensacion, eq(chainConvenios.cajaId, cajasDeCompensacion.id))
    .orderBy(desc(chainConvenios.id));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Convenios con cajas de compensación</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Cargados a mano revisando la página de convenios de cada caja de compensación.
      </p>

      <form action={createConvenio} className="mt-8 space-y-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select name="chainId" required className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">Cadena...</option>
            {chains.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="cajaId" required className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">Caja de compensación...</option>
            {cajas.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <textarea name="description" placeholder="Descripción del convenio / términos del descuento" className="w-full rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="validFrom" type="date" className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
          <input name="validTo" type="date" className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        </div>
        <input name="sourceUrl" placeholder="URL fuente" className="w-full rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900" />
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
          Agregar convenio
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {existing.map(({ convenio, chain, caja }) => (
          <li key={convenio.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {chain.name} × {caja.name}
            </p>
            {convenio.description && <p className="text-zinc-500">{convenio.description}</p>}
          </li>
        ))}
        {existing.length === 0 && <li className="text-center text-zinc-500">Sin convenios cargados aún.</li>}
      </ul>
    </div>
  );
}
