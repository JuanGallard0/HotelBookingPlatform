export default function CustomerProfilePage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
        Profile settings
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        Personal details, preferences, and payment defaults
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
        Traveler settings belong in the customer area because they are tied to
        the booking journey. This section is intentionally simpler than the
        admin tooling and should stay that way.
      </p>
    </section>
  );
}
