import { Suspense } from "react";
import { Footer } from "@/src/components/layout/Footer";
import { Navbar } from "@/src/components/home/Navbar";
import { HotelCatalog } from "@/src/components/hotels/HotelCatalog";

export default function HotelsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Hoteles disponibles
          </h2>
          <Suspense>
            <HotelCatalog />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
