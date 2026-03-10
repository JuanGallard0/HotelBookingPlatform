import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-gray-900">
            <span aria-hidden="true">🏨</span>
            <span>StayFinder</span>
          </Link>
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link href="/hotels" className="text-sm text-gray-500 hover:text-gray-700">Hotels</Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-700">About</Link>
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700">Sign in</Link>
          </nav>
          <p className="text-sm text-gray-400">© {year} StayFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
