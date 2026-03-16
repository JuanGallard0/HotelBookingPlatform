import { Suspense } from "react";
import { HotelCatalog } from "@/src/components/hotels/HotelCatalog";
import { HotelSearchBar } from "@/src/components/hotels/HotelSearchBar";

export default function HotelsPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Hoteles disponibles
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Filtra por nombre, fechas o número de huéspedes para encontrar tu
          opción ideal.
        </p>
        <Suspense>
          <HotelSearchBar
            variant="light"
            replace
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          />
          <HotelCatalog />
        </Suspense>
      </div>
    </main>
  );
}
