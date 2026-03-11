const stats = [
  { label: "Upcoming stays", value: "2" },
  { label: "Saved hotels", value: "12" },
  { label: "Reward nights", value: "4" },
] as const;

export default function AccountOverviewPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Customer overview
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          A focused workspace for travel details and booking follow-up
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Keep customer UI centered on upcoming trips, reservation changes,
          profile updates, and support actions. Guests should never have to
          navigate around operational tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {item.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
