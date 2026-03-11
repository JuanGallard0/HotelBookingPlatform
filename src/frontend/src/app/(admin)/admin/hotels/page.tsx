const managedHotels = [
  { name: "Blue Harbor Hotel", status: "Published", rooms: 84 },
  { name: "Cedar Lane Suites", status: "Draft", rooms: 46 },
  { name: "Summit Peak Lodge", status: "Published", rooms: 31 },
] as const;

export default function AdminHotelsPage() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
        Hotel management
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Inventory controls belong in the admin surface
      </h2>

      <div className="mt-8 space-y-4">
        {managedHotels.map((hotel) => (
          <article
            key={hotel.name}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 p-5 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-white">{hotel.name}</h3>
              <p className="text-sm text-slate-400">{hotel.rooms} rooms</p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
              {hotel.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
