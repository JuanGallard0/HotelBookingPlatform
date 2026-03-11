import Link from "next/link";

import { Footer } from "@/components/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-gray-900"
          >
            <span className="text-xl" aria-hidden="true">
              SF
            </span>
            <span>StayFinder</span>
          </Link>
          <nav
            aria-label="Marketing navigation"
            className="flex items-center gap-6"
          >
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              About
            </Link>
            <Link
              href="/hotels"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Hotels
            </Link>
            <Link
              href="/account"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Customer
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Admin
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
