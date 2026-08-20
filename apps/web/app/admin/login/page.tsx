import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/admin/matching-queue", error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Acceso admin</h1>
      {error && <p className="mt-2 text-sm text-red-600">Contraseña incorrecta.</p>}
      <form action={login} className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Contraseña"
          className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button type="submit" className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white">
          Entrar
        </button>
      </form>
    </div>
  );
}
