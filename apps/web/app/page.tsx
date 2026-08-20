export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Farmacompara
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Compara precios de medicamentos entre farmacias chilenas.
        </p>
        <form action="/buscar" className="mt-8 flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Ej: paracetamol, ibuprofeno..."
            className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700"
          >
            Buscar
          </button>
        </form>
        <a
          href="/promociones"
          className="mt-4 inline-block text-sm text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Ver promociones activas →
        </a>
      </div>
    </div>
  );
}
