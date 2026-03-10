import Link from "next/link";

export default function HotelNotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-6xl font-bold text-blue-600" aria-hidden="true">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Hotel not found</h1>
      <p className="mt-2 text-gray-500">
        This hotel does not exist or has been removed.
      </p>
      <Link
        href="/hotels"
        className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Browse all hotels
      </Link>
    </div>
  );
}
