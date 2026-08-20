import Link from "next/link";
import { logout } from "./actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-y-2 text-sm">
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/matching-queue" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Matching
            </Link>
            <Link href="/admin/medications" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Medicamentos
            </Link>
            <Link href="/admin/promotions" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Promociones
            </Link>
            <Link href="/admin/convenios" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Convenios
            </Link>
          </div>
          <form action={logout}>
            <button type="submit" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
