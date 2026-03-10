import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";

/**
 * Dashboard layout — adds a sticky left sidebar for authenticated app sections
 * (/dashboard, /settings). The sidebar collapses to a mobile nav on small screens.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — sticky, full height, scrollable internally */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white md:block">
        <Sidebar />
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Top bar — visible on all screens */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          {/* Mobile: show logo (sidebar hidden) */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-gray-900 md:hidden"
          >
            <span aria-hidden="true">🏨</span>
            <span>StayFinder</span>
          </Link>

          {/* Breadcrumb slot — pages can override via a future slot/context */}
          <div className="hidden md:block" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/hotels"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Browse hotels
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign out
            </Link>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
