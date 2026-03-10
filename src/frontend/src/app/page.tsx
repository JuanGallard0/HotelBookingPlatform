import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StayFinder — Find Your Perfect Hotel",
  description:
    "Discover and book hotels worldwide with the best prices guaranteed.",
};

const FEATURES = [
  {
    icon: "🌍",
    title: "Global coverage",
    description: "Thousands of hotels in hundreds of cities worldwide.",
  },
  {
    icon: "💰",
    title: "Best prices",
    description: "Guaranteed best rates with no hidden booking fees.",
  },
  {
    icon: "⚡",
    title: "Instant booking",
    description: "Confirm your reservation in seconds.",
  },
] as const;

/**
 * Home / landing page.
 *
 * Lives outside all route groups so it uses only the root layout (HTML shell)
 * and can define its own full-page design without inheriting any shared chrome.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="text-2xl" aria-hidden="true">🏨</span>
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
            href="/auth/login"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Sign in
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
              Find your perfect stay
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Browse thousands of hotels worldwide. Competitive prices, no
              hidden fees.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/hotels"
                className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-colors hover:bg-blue-50"
              >
                Explore hotels →
              </Link>
              <Link
                href="/about"
                className="rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Learn more
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
            Why StayFinder?
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map(({ icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="mb-3 text-4xl" aria-hidden="true">{icon}</div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} StayFinder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
