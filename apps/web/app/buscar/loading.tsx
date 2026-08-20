export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="h-11 w-full animate-pulse rounded-full bg-surface-sunken" />
      <div className="mt-6 h-4 w-40 animate-pulse rounded bg-surface-sunken" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 w-full animate-pulse rounded-2xl bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}
