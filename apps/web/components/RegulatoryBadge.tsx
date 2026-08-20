const LABELS: Record<string, { text: string; className: string }> = {
  venta_libre: {
    text: "Venta libre",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  receta_simple: {
    text: "Receta simple",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  receta_retenida: {
    text: "Receta retenida",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
};

export function RegulatoryBadge({ regulatoryClass }: { regulatoryClass: string | null }) {
  if (!regulatoryClass || !LABELS[regulatoryClass]) {
    return (
      <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Sin clasificar
      </span>
    );
  }
  const { text, className } = LABELS[regulatoryClass];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${className}`}>{text}</span>
  );
}
