import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getHotelDetail } from "@/src/lib/api/hotels";
import { BookNowButton } from "@/src/components/hotels/BookNowButton";
import { HotelAvailabilitySection } from "@/src/components/hotels/HotelAvailabilitySection";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";
import h1 from "@/src/assets/h1.webp";
import h2 from "@/src/assets/h2.webp";
import h3 from "@/src/assets/h3.webp";
import h4 from "@/src/assets/h4.webp";
import h5 from "@/src/assets/h5.webp";

const HOTEL_IMAGES = [h1, h2, h3, h4, h5];

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${i < stars ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotelId = parseInt(id, 10);

  if (isNaN(hotelId)) notFound();

  let hotel;
  try {
    hotel = await getHotelDetail(hotelId);
  } catch {
    notFound();
  }

  const image = HOTEL_IMAGES[((hotel.hotelId ?? 0) - 1) % 5];

  return (
    <main className="flex-1">
      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/hotels"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Ver todos los hoteles
        </Link>

        <div className="mb-8">
          <StarRating stars={hotel.starRating ?? 0} />
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {hotel.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {hotel.city}, {hotel.country}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80">
              <Image
                src={image}
                alt={hotel.name ?? "Hotel"}
                fill
                loading="eager"
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                Sobre el hotel
              </h2>
              <p className="leading-7 text-slate-600">
                {hotel.description ?? "Sin descripción disponible."}
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <InfoRow
                  icon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                  }
                  label="Dirección"
                  value={[hotel.address, hotel.city, hotel.country]
                    .filter(Boolean)
                    .join(", ")}
                />

                {hotel.email && (
                  <InfoRow
                    icon={
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                      </svg>
                    }
                    label="Correo"
                    value={hotel.email}
                  />
                )}

                {hotel.phoneNumber && (
                  <InfoRow
                    icon={
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z"
                        />
                      </svg>
                    }
                    label="Teléfono"
                    value={hotel.phoneNumber}
                  />
                )}

                <InfoRow
                  icon={
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  }
                  label="Categoría"
                  value={`${hotel.starRating ?? 0} estrellas`}
                />
              </CardContent>
            </Card>
            <BookNowButton />
          </aside>
        </div>

        {/* Availability table */}
        <HotelAvailabilitySection hotelId={hotelId} />
      </div>
    </main>
  );
}
