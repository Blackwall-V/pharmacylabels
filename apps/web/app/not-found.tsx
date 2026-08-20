import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">Página no encontrada</h1>
      <p className="mt-2 text-ink-soft">No encontramos lo que buscabas.</p>
      <Link href="/" className="mt-6 font-medium text-brand hover:underline">
        ← Volver al inicio
      </Link>
    </div>
  );
}
