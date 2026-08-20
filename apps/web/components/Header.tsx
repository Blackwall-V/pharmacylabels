import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            +
          </span>
          <span className="truncate font-display text-lg font-semibold tracking-tight text-ink">
            Farmacompara
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-3 text-sm font-medium text-ink-soft sm:gap-5">
          <Link href="/buscar" className="hover:text-ink">
            Buscar
          </Link>
          <Link href="/promociones" className="hover:text-ink">
            Promociones
          </Link>
        </nav>
      </div>
    </header>
  );
}
