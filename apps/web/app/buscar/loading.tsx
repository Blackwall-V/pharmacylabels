export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 h-10 w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
