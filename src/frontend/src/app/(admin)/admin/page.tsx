const summary = [
  { label: "Open incidents", value: "3" },
  { label: "Pending approvals", value: "9" },
  { label: "Occupancy today", value: "82%" },
] as const;

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Admin dashboard
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Operations stay separate from the guest journey
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          Inventory management, reservation oversight, and user administration
          should live in a dedicated interface with its own navigation,
          permissions, and denser information layout.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
