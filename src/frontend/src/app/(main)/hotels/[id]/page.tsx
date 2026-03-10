import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getHotel } from "@/lib/api/hotels";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { RoomTypeSummaryDto } from "@/types/hotel";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hotel = await getHotel(Number(id));
  if (!hotel) return { title: "Hotel not found" };
  return { title: hotel.name, description: hotel.description };
}

export default async function HotelPage({ params }: Props) {
  const { id } = await params;
  const hotel = await getHotel(Number(id));

  if (!hotel) notFound();

  const minPrice =
    hotel.roomTypes.length > 0
      ? Math.min(...hotel.roomTypes.map((r) => r.basePrice))
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/hotels" className="transition-colors hover:text-gray-900">
              Hotels
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900" aria-current="page">
            {hotel.name}
          </li>
        </ol>
      </nav>

      {/* Hero placeholder */}
      <div className="mb-8 flex h-64 items-center justify-center rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 sm:h-80">
        <svg className="h-24 w-24 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
              <div className="flex shrink-0 items-center gap-0.5" aria-label={`${hotel.starRating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`h-5 w-5 ${i < hotel.starRating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="mt-1 text-gray-500">{hotel.city}, {hotel.country}</p>
            {hotel.address && <p className="mt-0.5 text-sm text-gray-400">{hotel.address}</p>}
          </div>

          {hotel.description && (
            <section aria-labelledby="description-heading">
              <h2 id="description-heading" className="mb-2 text-lg font-semibold text-gray-900">About</h2>
              <p className="leading-relaxed text-gray-600">{hotel.description}</p>
            </section>
          )}

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="mb-3 text-lg font-semibold text-gray-900">Contact</h2>
            <dl className="flex flex-col gap-1 text-sm">
              {hotel.email && (
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-700">Email</dt>
                  <dd><a href={`mailto:${hotel.email}`} className="text-blue-600 hover:underline">{hotel.email}</a></dd>
                </div>
              )}
              {hotel.phoneNumber && (
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-700">Phone</dt>
                  <dd><a href={`tel:${hotel.phoneNumber}`} className="text-blue-600 hover:underline">{hotel.phoneNumber}</a></dd>
                </div>
              )}
            </dl>
          </section>

          {hotel.roomTypes.length > 0 && (
            <section aria-labelledby="rooms-heading">
              <h2 id="rooms-heading" className="mb-3 text-lg font-semibold text-gray-900">Room types</h2>
              <ul className="space-y-3">
                {hotel.roomTypes.map((room) => (
                  <RoomTypeCard key={room.id} room={room} />
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Booking card */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {minPrice !== null ? (
              <>
                <p className="text-sm text-gray-500">From</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(minPrice)}
                  <span className="text-base font-normal text-gray-500"> / night</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Contact for pricing</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {hotel.roomTypes.length} {hotel.roomTypes.length === 1 ? "room type" : "room types"} available
            </p>
            <Button className="mt-5 w-full" size="lg">Book now</Button>
            <p className="mt-3 text-center text-xs text-gray-400">No charge until confirmation</p>
            <Badge
              variant={hotel.isActive ? "success" : "danger"}
              className="mt-3 w-full justify-center"
            >
              {hotel.isActive ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RoomTypeCard({ room }: { room: RoomTypeSummaryDto }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{room.name}</p>
        {room.description && (
          <p className="mt-0.5 truncate text-sm text-gray-500">{room.description}</p>
        )}
        <p className="mt-0.5 text-xs text-gray-400">
          Up to {room.maxOccupancy} guest{room.maxOccupancy !== 1 ? "s" : ""}
        </p>
      </div>
      <p className="ml-4 shrink-0 font-semibold text-gray-900">
        {formatPrice(room.basePrice)}
        <span className="text-xs font-normal text-gray-500"> / night</span>
      </p>
    </li>
  );
}
