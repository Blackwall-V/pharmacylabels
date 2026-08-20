import Link from "next/link";
import { asc, isNotNull } from "drizzle-orm";
import { db } from "@/src/db";
import { medications } from "@/src/db/schema";
import { SearchBar } from "@/components/SearchBar";
import { MedicationCard } from "@/components/MedicationCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await db
    .select()
    .from(medications)
    .where(isNotNull(medications.category))
    .orderBy(asc(medications.canonicalName))
    .limit(8);

  const categories = [...new Set(catalog.map((m) => m.category).filter((c): c is string => !!c))];

  return (
    <div>
      <section className="border-b border-line bg-brand-mint/40">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
          <p className="font-data text-xs font-semibold tracking-[0.2em] text-brand uppercase">
            Comparador independiente
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            El mismo remedio, precios muy distintos
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">
            Buscamos el mismo medicamento en Cruz Verde, Salcobrand y Farmacias Ahumada para que
            pagues el precio más bajo disponible.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <SearchBar size="lg" />
          </div>

          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/buscar?q=${encodeURIComponent(c)}`}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft transition hover:border-brand hover:text-brand"
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {catalog.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-14">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Medicamentos frecuentes</h2>
            <Link href="/buscar" className="text-sm font-medium text-brand hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.map((m) => (
              <MedicationCard
                key={m.id}
                slug={m.slug}
                canonicalName={m.canonicalName}
                activeIngredient={m.activeIngredient}
                regulatoryClass={m.regulatoryClass}
                imageUrl={m.imageUrl}
              />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-14 sm:grid-cols-3">
          {[
            { n: "1", t: "Busca tu medicamento", d: "Por nombre comercial o principio activo." },
            { n: "2", t: "Compara precios reales", d: "Precios actualizados directo de cada farmacia." },
            { n: "3", t: "Elige dónde comprar", d: "Vas a la farmacia más barata, no hay intermediarios." },
          ].map((step) => (
            <div key={step.n}>
              <span className="font-data text-sm font-semibold text-brand">{step.n}</span>
              <p className="mt-2 font-display font-semibold text-ink">{step.t}</p>
              <p className="mt-1 text-sm text-ink-soft">{step.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
