import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/src/db";
import { RegulatoryBadge } from "@/components/RegulatoryBadge";

interface MedicationRow {
  [key: string]: unknown;
  id: number;
  slug: string;
  canonical_name: string;
  active_ingredient: string | null;
  regulatory_class: string | null;
}

async function searchMedications(query: string): Promise<MedicationRow[]> {
  if (!query.trim()) {
    return db.execute<MedicationRow>(sql`
      select id, slug, canonical_name, active_ingredient, regulatory_class
      from medications
      order by canonical_name
      limit 30
    `);
  }
  return db.execute<MedicationRow>(sql`
    select id, slug, canonical_name, active_ingredient, regulatory_class
    from medications
    where similarity(lower(canonical_name), lower(${query})) > 0.1
       or similarity(lower(coalesce(active_ingredient, '')), lower(${query})) > 0.1
       or lower(canonical_name) like '%' || lower(${query}) || '%'
    order by greatest(
      similarity(lower(canonical_name), lower(${query})),
      similarity(lower(coalesce(active_ingredient, '')), lower(${query}))
    ) desc
    limit 30
  `);
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await searchMedications(q);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← Farmacompara
      </Link>
      <form action="/buscar" className="mt-4 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar medicamento..."
          className="min-w-0 flex-1 rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button type="submit" className="rounded-md bg-emerald-600 px-5 py-2 font-medium text-white">
          Buscar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {results.map((med) => (
          <li key={med.id} className="py-4">
            <Link
              href={`/medicamento/${med.slug}`}
              className="flex items-center justify-between gap-4 hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{med.canonical_name}</p>
                {med.active_ingredient && (
                  <p className="truncate text-sm text-zinc-500">{med.active_ingredient}</p>
                )}
              </div>
              <span className="shrink-0">
                <RegulatoryBadge regulatoryClass={med.regulatory_class} />
              </span>
            </Link>
          </li>
        ))}
        {results.length === 0 && (
          <li className="py-8 text-center text-zinc-500">No se encontraron medicamentos para “{q}”.</li>
        )}
      </ul>
    </div>
  );
}
