import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { pharmacyChains, pharmacyBranches, chainConvenios, cajasDeCompensacion, promotions } from "@/src/db/schema";

export default async function FarmaciaPage({
  params,
}: {
  params: Promise<{ chainSlug: string }>;
}) {
  const { chainSlug } = await params;

  const [chain] = await db.select().from(pharmacyChains).where(eq(pharmacyChains.slug, chainSlug)).limit(1);
  if (!chain) notFound();

  const branches = await db.select().from(pharmacyBranches).where(eq(pharmacyBranches.chainId, chain.id));
  const convenios = await db
    .select({ convenio: chainConvenios, caja: cajasDeCompensacion })
    .from(chainConvenios)
    .innerJoin(cajasDeCompensacion, eq(chainConvenios.cajaId, cajasDeCompensacion.id))
    .where(eq(chainConvenios.chainId, chain.id));
  const chainPromotions = await db.select().from(promotions).where(eq(promotions.chainId, chain.id));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← Farmacompara
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{chain.name}</h1>
      {chain.websiteUrl && (
        <a href={chain.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:underline">
          {chain.websiteUrl}
        </a>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Convenios</h2>
        {convenios.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Sin convenios cargados aún.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {convenios.map(({ convenio, caja }) => (
              <li key={convenio.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{caja.name}</p>
                {convenio.description && <p className="text-zinc-500">{convenio.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Promociones</h2>
        {chainPromotions.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Sin promociones cargadas aún.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {chainPromotions.map((p) => (
              <li key={p.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                {p.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Sucursales</h2>
        {branches.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Sin datos de sucursales aún (la mayoría de estas cadenas muestra un precio único
            nacional, no por sucursal).
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {branches.map((b) => (
              <li key={b.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p className="font-medium">{b.name}</p>
                <p className="text-zinc-500">{b.address}, {b.comuna}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
