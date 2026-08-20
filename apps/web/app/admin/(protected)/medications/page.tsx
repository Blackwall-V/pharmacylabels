import { asc } from "drizzle-orm";
import { db } from "@/src/db";
import { medications } from "@/src/db/schema";
import { createMedication, updateRegulatoryClass, updateImageUrl } from "./actions";

// Without this, Next.js statically optimizes admin pages at build time and would
// serve a frozen snapshot instead of the live catalog.
export const dynamic = "force-dynamic";

const CLASS_OPTIONS = [
  { value: "", label: "Sin clasificar" },
  { value: "venta_libre", label: "Venta libre" },
  { value: "receta_simple", label: "Receta simple" },
  { value: "receta_retenida", label: "Receta retenida" },
];

export default async function AdminMedicationsPage() {
  const all = await db.select().from(medications).orderBy(asc(medications.canonicalName)).limit(300);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Catálogo de medicamentos</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {all.length} medicamentos. La clasificación regulatoria debe confirmarse contra el Registro
        Sanitario del ISP antes de confiar en ella en producción. Las imágenes se llenan solas con
        la primera foto real que trae el scraper para ese producto; puedes sobrescribirlas acá.
      </p>

      <form action={createMedication} className="mt-6 grid grid-cols-1 gap-2 rounded-md border border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800">
        <input name="canonicalName" required placeholder="Nombre canónico (ej: Ibuprofeno 400mg)" className="rounded border border-zinc-300 px-2 py-1.5 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-900" />
        <input name="activeIngredient" placeholder="Principio activo" className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        <input name="dosage" placeholder="Dosis (ej: 400mg)" className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        <input name="presentation" placeholder="Presentación (ej: Comprimidos)" className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        <input name="category" placeholder="Categoría" className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        <input name="imageUrl" type="url" placeholder="URL de imagen (opcional)" className="rounded border border-zinc-300 px-2 py-1.5 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-900" />
        <select name="regulatoryClass" className="rounded border border-zinc-300 px-2 py-1.5 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-900">
          {CLASS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white sm:col-span-2">
          Agregar medicamento
        </button>
      </form>

      <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
        {all.map((m) => (
          <li key={m.id} className="flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {m.imageUrl ? (
                // Real product photo scraped from the chain's own page -- plain <img>
                // since it's hotlinked from an external, unpredictable set of hosts.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-md border border-zinc-200 object-contain dark:border-zinc-700" />
              ) : (
                <span className="h-10 w-10 shrink-0 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700" />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{m.canonicalName}</p>
                {m.activeIngredient && <p className="truncate text-zinc-500">{m.activeIngredient}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <form action={updateImageUrl} className="flex items-center gap-2">
                <input type="hidden" name="medicationId" value={m.id} />
                <input
                  name="imageUrl"
                  type="url"
                  defaultValue={m.imageUrl ?? ""}
                  placeholder="URL de imagen"
                  className="w-40 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
                <button type="submit" className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
                  Guardar
                </button>
              </form>
              <form action={updateRegulatoryClass} className="flex items-center gap-2">
                <input type="hidden" name="medicationId" value={m.id} />
                <select name="regulatoryClass" defaultValue={m.regulatoryClass ?? ""} className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900">
                  {CLASS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button type="submit" className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
                  Guardar
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
