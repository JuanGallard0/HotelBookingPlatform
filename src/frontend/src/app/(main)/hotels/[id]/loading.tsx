export default function HotelLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading hotel">
      <div className="mb-6 h-4 w-32 rounded bg-gray-200" aria-hidden="true" />
      <div className="mb-8 h-64 rounded-2xl bg-gray-200 sm:h-80" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-8 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="space-y-2 pt-2">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
        <div className="h-48 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
