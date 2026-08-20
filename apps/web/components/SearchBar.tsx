export function SearchBar({
  defaultValue = "",
  size = "md",
}: {
  defaultValue?: string;
  size?: "md" | "lg";
}) {
  const padding = size === "lg" ? "py-4 pl-12 text-lg" : "py-2.5 pl-11";
  const iconTop = size === "lg" ? "top-4" : "top-1/2 -translate-y-1/2";

  return (
    <form action="/buscar" className="flex min-w-0 gap-2">
      <div className="relative min-w-0 flex-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`pointer-events-none absolute left-4 ${iconTop} h-5 w-5 text-ink-soft`}
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20 L16.2 16.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="Ej: paracetamol, ibuprofeno, amoxicilina..."
          className={`min-w-0 w-full rounded-full border border-line bg-surface px-4 text-ink placeholder:text-ink-soft focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 ${padding}`}
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-brand px-6 font-medium text-white transition hover:bg-brand-strong"
      >
        Buscar
      </button>
    </form>
  );
}
