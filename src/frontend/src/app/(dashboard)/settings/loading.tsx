export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-busy="true" aria-label="Loading settings">
      <div className="space-y-2">
        <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white"
          aria-hidden="true"
        >
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-3 px-6 py-5">
            <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
