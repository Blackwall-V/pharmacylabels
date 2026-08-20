// A small identifying color per chain -- not their logo/trademark, just a
// recognizable dot so a comparison list scans quickly (the way any
// price-comparison service visually distinguishes the sellers it lists).
const CHAIN_DOT: Record<string, string> = {
  "cruz-verde": "#2f9e5c",
  salcobrand: "#1f6fb2",
  "farmacias-ahumada": "#c23b3b",
  "dr-simi": "#d23e8f",
};

export function ChainBadge({ slug, name }: { slug: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: CHAIN_DOT[slug] ?? "var(--ink-soft)" }}
        aria-hidden
      />
      {name}
    </span>
  );
}
