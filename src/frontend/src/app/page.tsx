import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StayFinder - Find Your Perfect Hotel",
  description:
    "Discover and book hotels worldwide with clear separation between guest and admin experiences.",
};

const features = [
  {
    eyebrow: "Search",
    title: "Guest discovery",
    description:
      "Public and customer flows stay focused on searching, comparing, and managing reservations.",
  },
  {
    eyebrow: "Account",
    title: "Customer workspace",
    description:
      "Signed-in travelers get a dedicated area for upcoming stays, profile details, and support tasks.",
  },
  {
    eyebrow: "Admin",
    title: "Back-office operations",
    description:
      "Administrators work in a separate shell optimized for inventory, reservations, and user management.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="text-2xl" aria-hidden="true">
            SF
          </span>
          <span className="text-lg">StayFinder</span>
        </div>
        <nav aria-label="Site navigation" className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            About
          </Link>
          <Link
            href="/account"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Customer area
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Admin area
          </Link>
          <Link
            href="/hotels"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Browse hotels
          </Link>
        </nav>
      </header>

      <main>
        <section className="bg-linear-to-br from-blue-600 to-blue-800 py-24 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              One platform, clearly separated experiences for guests and operators.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Keep public discovery fast and welcoming, give customers a focused
              account area, and move operational tools into a dedicated admin
              workspace.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/account"
                className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-colors hover:bg-blue-50"
              >
                Open customer area
              </Link>
              <Link
                href="/admin"
                className="rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Open admin area
              </Link>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
          aria-labelledby="features-heading"
        >
          <h2
            id="features-heading"
            className="mb-12 text-center text-2xl font-bold text-gray-900"
          >
            Why separate the interfaces?
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-200 p-8 text-center"
              >
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                  {feature.eyebrow}
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-200 bg-gray-50 py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Customer interface
              </p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">
                Reservations, profile, and trip management
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Use a lightweight account shell for traveler tasks. This keeps
                booking-related navigation separate from staff tools and reduces
                UI noise.
              </p>
              <Link
                href="/account"
                className="mt-6 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                View customer routes
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Admin interface
              </p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">
                Inventory, reservations, users, and reporting
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Give operators a denser workspace with admin-specific navigation,
                alerts, and tools. This is where permission checks usually
                become stricter.
              </p>
              <Link
                href="/admin"
                className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                View admin routes
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} StayFinder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
