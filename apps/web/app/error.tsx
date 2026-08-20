"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">Algo salió mal</h1>
      <p className="mt-2 text-ink-soft">Ocurrió un error inesperado. Puedes intentar de nuevo.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-strong"
      >
        Reintentar
      </button>
    </div>
  );
}
