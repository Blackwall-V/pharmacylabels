import Link from "next/link";
import { PillIcon } from "./PillIcon";
import { RegulatoryBadge } from "./RegulatoryBadge";

export function MedicationCard({
  slug,
  canonicalName,
  activeIngredient,
  regulatoryClass,
}: {
  slug: string;
  canonicalName: string;
  activeIngredient: string | null;
  regulatoryClass: string | null;
}) {
  return (
    <Link
      href={`/medicamento/${slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:border-brand/50 hover:shadow-[0_2px_0_0_var(--color-brand)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-mint text-brand">
          <PillIcon className="h-4.5 w-4.5" />
        </span>
        <RegulatoryBadge regulatoryClass={regulatoryClass} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display font-semibold text-ink group-hover:text-brand-strong">
          {canonicalName}
        </p>
        {activeIngredient && <p className="truncate text-sm text-ink-soft">{activeIngredient}</p>}
      </div>
    </Link>
  );
}
