const bookings = [
  {
    hotel: "Blue Harbor Hotel",
    city: "Lisbon",
    dates: "Apr 12 - Apr 16",
    status: "Confirmed",
  },
  {
    hotel: "Cedar Lane Suites",
    city: "Kyoto",
    dates: "May 03 - May 08",
    status: "Pending",
  },
] as const;

export default function CustomerBookingsPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
        Customer bookings
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        Upcoming reservations and self-service actions
      </h2>

      <div className="mt-8 space-y-4">
        {bookings.map((booking) => (
          <article
            key={`${booking.hotel}-${booking.dates}`}
            className="rounded-2xl border border-slate-200 p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {booking.hotel}
                </h3>
                <p className="text-sm text-slate-500">
                  {booking.city} · {booking.dates}
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                {booking.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
