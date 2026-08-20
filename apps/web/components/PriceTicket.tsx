import Link from "next/link";
import { ChainBadge } from "./ChainBadge";

export function PriceTicket({
  chainSlug,
  chainName,
  priceClp,
  freshnessLabel,
  inStock,
  isCheapest,
}: {
  chainSlug: string;
  chainName: string;
  priceClp: number;
  freshnessLabel: string;
  inStock: boolean;
  isCheapest: boolean;
}) {
  return (
    <div className="ticket-punch relative flex items-center justify-between gap-4 rounded-xl border border-line bg-surface py-4 pr-5 pl-7">
      <div className="min-w-0">
        <Link
          href={`/farmacia/${chainSlug}`}
          className="truncate font-medium text-ink hover:underline"
        >
          <ChainBadge slug={chainSlug} name={chainName} />
        </Link>
        <p className="truncate text-xs text-ink-soft">
          {freshnessLabel}
          {!inStock && " · sin stock"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {isCheapest && (
          <span className="-rotate-6 rounded-full border-2 border-dashed border-price px-2 py-0.5 text-[10px] font-bold tracking-wide text-price uppercase">
            Mejor precio
          </span>
        )}
        <span className="font-data text-xl font-semibold tabular-nums text-ink">
          ${priceClp.toLocaleString("es-CL")}
        </span>
      </div>
    </div>
  );
}
