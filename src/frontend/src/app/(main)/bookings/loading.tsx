export default function BookingsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-7 w-36 animate-pulse rounded bg-gray-200" aria-hidden="true" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white" aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
