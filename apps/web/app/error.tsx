"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Algo salió mal</h1>
      <p className="mt-2 text-zinc-500">Ocurrió un error inesperado. Puedes intentar de nuevo.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
