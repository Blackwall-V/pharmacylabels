import { sql } from "drizzle-orm";
import { db } from "@/src/db";
import { SearchBar } from "@/components/SearchBar";
import { MedicationCard } from "@/components/MedicationCard";

export const dynamic = "force-dynamic";

interface MedicationRow {
  [key: string]: unknown;
  id: number;
  slug: string;
  canonical_name: string;
  active_ingredient: string | null;
  regulatory_class: string | null;
  image_url: string | null;
}

async function searchMedications(query: string): Promise<MedicationRow[]> {
  if (!query.trim()) {
    return db.execute<MedicationRow>(sql`
      select id, slug, canonical_name, active_ingredient, regulatory_class, image_url
      from medications
      order by canonical_name
      limit 30
    `);
  }
  return db.execute<MedicationRow>(sql`
    select id, slug, canonical_name, active_ingredient, regulatory_class, image_url
    from medications
    where similarity(lower(canonical_name), lower(${query})) > 0.1
       or similarity(lower(coalesce(active_ingredient, '')), lower(${query})) > 0.1
       or lower(canonical_name) like '%' || lower(${query}) || '%'
       or lower(coalesce(category, '')) like '%' || lower(${query}) || '%'
    order by greatest(
      similarity(lower(canonical_name), lower(${query})),
      similarity(lower(coalesce(active_ingredient, '')), lower(${query})),
      case when lower(coalesce(category, '')) like '%' || lower(${query}) || '%' then 0.5 else 0 end
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <SearchBar defaultValue={q} />

      <p className="mt-6 text-sm text-ink-soft">
        {q ? (
          <>
            {results.length} resultado{results.length === 1 ? "" : "s"} para “{q}”
          </>
        ) : (
          "Catálogo completo"
        )}
      </p>

      {results.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((med) => (
            <MedicationCard
              key={med.id}
              slug={med.slug}
              canonicalName={med.canonical_name}
              activeIngredient={med.active_ingredient}
              regulatoryClass={med.regulatory_class}
              imageUrl={med.image_url}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-ink-soft">
          No encontramos medicamentos para “{q}”. Prueba con el nombre del principio activo.
        </div>
      )}
    </div>
  );
}
