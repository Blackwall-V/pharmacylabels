const LABELS: Record<string, { text: string; fg: string; bg: string }> = {
  venta_libre: { text: "Venta libre", fg: "text-otc", bg: "bg-otc-soft" },
  receta_simple: { text: "Receta simple", fg: "text-simple", bg: "bg-simple-soft" },
  receta_retenida: { text: "Receta retenida", fg: "text-retenida", bg: "bg-retenida-soft" },
};

export function RegulatoryBadge({ regulatoryClass }: { regulatoryClass: string | null }) {
  if (!regulatoryClass || !LABELS[regulatoryClass]) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink-soft">
        Sin clasificar
      </span>
    );
  }
  const { text, fg, bg } = LABELS[regulatoryClass];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${fg}`}>
      {text}
    </span>
  );
}
