const reservations = [
  { code: "RSV-1042", guest: "Jordan Guest", action: "Payment review" },
  { code: "RSV-1088", guest: "Mia Carter", action: "Room reassignment" },
  { code: "RSV-1121", guest: "Liam Park", action: "Late arrival note" },
] as const;

export default function AdminReservationsPage() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
        Reservation operations
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Support queues and exceptions for staff review
      </h2>

      <div className="mt-8 space-y-4">
        {reservations.map((reservation) => (
          <article
            key={reservation.code}
            className="rounded-2xl border border-slate-800 p-5"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {reservation.code}
                </h3>
                <p className="text-sm text-slate-400">{reservation.guest}</p>
              </div>
              <p className="text-sm font-medium text-cyan-300">
                {reservation.action}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
