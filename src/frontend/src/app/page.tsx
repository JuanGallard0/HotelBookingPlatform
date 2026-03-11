import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white"
            >
              HB
            </span>
            <span className="text-lg">HotelBooking</span>
          </div>

          <nav aria-label="Navegacion principal" className="flex items-center gap-3">
            <details className="group relative">
              <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                Menu
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

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-700 via-blue-600 to-cyan-500" />
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
              Reserva inteligente
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Encuentra el hotel ideal para tu proximo viaje
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-blue-50">
              Compara precios, revisa disponibilidad en tiempo real y gestiona
              tus reservas en un solo lugar, rapido y sin complicaciones.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/hotels"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-50"
              >
                Explorar hoteles
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-lg border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Conocer mas
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
