import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:opacity-80 transition-opacity"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white"
          >
            HB
          </span>
          <span className="text-lg">HotelBooking</span>
        </Link>

        <nav
          aria-label="Navegacion principal"
          className="flex items-center gap-3"
        >
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                Menu
              </span>
            </summary>
            <div className="absolute right-0 top-11 z-20 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <Link
                href="/account/reservations"
                className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Mis reservas
              </Link>
            </div>
          </details>

          <Link
            href="/auth/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Iniciar sesion
          </Link>
        </nav>
      </div>
    </header>
  );
}
