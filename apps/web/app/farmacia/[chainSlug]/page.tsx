import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { pharmacyChains, pharmacyBranches, chainConvenios, cajasDeCompensacion, promotions } from "@/src/db/schema";
import { ChainBadge } from "@/components/ChainBadge";

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
      <h1 className="font-display text-2xl font-semibold text-ink">
        <ChainBadge slug={chain.slug} name={chain.name} />
      </h1>
      {chain.websiteUrl && (
        <a
          href={chain.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ink-soft hover:text-brand hover:underline"
        >
          {chain.websiteUrl}
        </a>
      )}

      <section className="mt-8">
        <h2 className="font-data text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Convenios
        </h2>
        {convenios.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Sin convenios cargados aún.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {convenios.map(({ convenio, caja }) => (
              <li key={convenio.id} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                <p className="font-medium text-ink">{caja.name}</p>
                {convenio.description && <p className="mt-1 text-ink-soft">{convenio.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-data text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Promociones
        </h2>
        {chainPromotions.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Sin promociones cargadas aún.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {chainPromotions.map((p) => (
              <li key={p.id} className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink">
                {p.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-data text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Sucursales
        </h2>
        {branches.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            Sin datos de sucursales aún (la mayoría de estas cadenas muestra un precio único
            nacional, no por sucursal).
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {branches.map((b) => (
              <li key={b.id} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                <p className="font-medium text-ink">{b.name}</p>
                <p className="text-ink-soft">
                  {b.address}, {b.comuna}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
