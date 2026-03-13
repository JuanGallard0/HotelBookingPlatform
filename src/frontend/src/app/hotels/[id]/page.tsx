import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Star,
  UserRound,
} from "lucide-react";

import { BookNowButton } from "@/src/components/hotels/BookNowButton";
import { HotelAvailabilityTable } from "@/src/components/hotels/HotelAvailabilityTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import h1 from "@/src/assets/h1.webp";
import h2 from "@/src/assets/h2.webp";
import h3 from "@/src/assets/h3.webp";
import h4 from "@/src/assets/h4.webp";
import h5 from "@/src/assets/h5.webp";
import { getHotelDetail } from "@/src/lib/api/hotels";

const HOTEL_IMAGES = [h1, h2, h3, h4, h5];

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < stars ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-200"}`}
        />
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

  if (Number.isNaN(hotelId)) notFound();

  let hotel;
  try {
    hotel = await getHotelDetail(hotelId);
  } catch {
    notFound();
  }

  const image = HOTEL_IMAGES[((hotel.hotelId ?? 0) - 1) % 5];

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/hotels"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
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
          <div className="space-y-6 lg:col-span-2">
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
                {hotel.description ?? "Sin descripcion disponible."}
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informacion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <InfoRow
                  icon={<MapPin className="h-4 w-4" strokeWidth={1.8} />}
                  label="Direccion"
                  value={[hotel.address, hotel.city, hotel.country]
                    .filter(Boolean)
                    .join(", ")}
                />

                {hotel.email && (
                  <InfoRow
                    icon={<Mail className="h-4 w-4" strokeWidth={1.8} />}
                    label="Correo"
                    value={hotel.email}
                  />
                )}

                {hotel.phoneNumber && (
                  <InfoRow
                    icon={<Phone className="h-4 w-4" strokeWidth={1.8} />}
                    label="Telefono"
                    value={hotel.phoneNumber}
                  />
                )}

                <InfoRow
                  icon={<UserRound className="h-4 w-4" strokeWidth={1.8} />}
                  label="Categoria"
                  value={`${hotel.starRating ?? 0} estrellas`}
                />
              </CardContent>
            </Card>
            <BookNowButton />
          </aside>
        </div>

        <HotelAvailabilityTable hotelId={hotelId} />
      </div>
    </main>
  );
}
