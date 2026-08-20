import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Página no encontrada</h1>
      <p className="mt-2 text-zinc-500">No encontramos lo que buscabas.</p>
      <Link href="/" className="mt-6 text-emerald-700 hover:underline dark:text-emerald-400">
        ← Volver al inicio
      </Link>
    </div>
  );
}
