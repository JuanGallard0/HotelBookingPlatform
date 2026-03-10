import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getHotels } from "@/lib/api/hotels";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your bookings and account.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Welcome back. Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Stats grid */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Account statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Real data: hotel count fetched from API */}
          <Suspense fallback={<StatCardSkeleton />}>
            <HotelCountCard />
          </Suspense>

          {/* Placeholder stats — wire up when booking API is ready */}
          <StatCard label="Upcoming stays" value="—" icon="📅" />
          <StatCard label="Past trips" value="—" icon="✈️" />
          <StatCard label="Saved hotels" value="—" icon="❤️" />
        </div>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="actions-heading">
        <h2
          id="actions-heading"
          className="mb-4 text-lg font-semibold text-gray-900"
        >
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/hotels"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Browse hotels
          </Link>
          <Link
            href="/bookings"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View bookings
          </Link>
          <Link
            href="/settings"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Account settings
          </Link>
        </div>
      </section>

      {/* Recent bookings */}
      <section aria-labelledby="recent-heading">
        <h2
          id="recent-heading"
          className="mb-4 text-lg font-semibold text-gray-900"
        >
          Recent bookings
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-4xl" aria-hidden="true">🗓️</p>
          <p className="mt-3 font-medium text-gray-900">No bookings yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Your confirmed reservations will appear here.
          </p>
          <Link
            href="/hotels"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Find a hotel →
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Fetches the real total hotel count from the API. */
async function HotelCountCard() {
  const data = await getHotels({ pageNumber: 1, pageSize: 1 });
  return (
    <StatCard label="Hotels available" value={data.totalCount.toLocaleString()} icon="🏨" />
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <span className="text-3xl" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="h-10 w-10 rounded-lg bg-gray-200" />
      <div className="space-y-2">
        <div className="h-6 w-16 rounded bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}
