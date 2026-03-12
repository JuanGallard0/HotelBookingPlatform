import Image from "next/image";
import Link from "next/link";
import type { AvailableHotelDto } from "@/src/lib/api/generated/api-client";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import h1 from "@/src/assets/h1.webp";
import h2 from "@/src/assets/h2.webp";
import h3 from "@/src/assets/h3.webp";
import h4 from "@/src/assets/h4.webp";
import h5 from "@/src/assets/h5.webp";

const HOTEL_IMAGES = [h1, h2, h3, h4, h5];

export type Hotel = AvailableHotelDto;

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < stars ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export function HotelListCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link href={`/hotels/${hotel.hotelId}`}>
      <Card className="flex flex-col sm:flex-row sm:items-stretch gap-0 sm:gap-5 sm:p-4 overflow-hidden transition-shadow hover:shadow-md">
        {/* Image — full width on mobile, fixed sidebar on sm+ */}
        <div className="relative h-48 w-full sm:h-auto sm:min-h-32 sm:w-40 sm:shrink-0 sm:overflow-hidden sm:rounded-xl">
          <Image
            src={HOTEL_IMAGES[((hotel.hotelId ?? 0) - 1) % 5]}
            alt={hotel.name ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 160px"
          />
        </div>
        <CardContent className="flex flex-1 flex-col gap-1 p-4 sm:p-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-card-foreground">
              {hotel.name}
            </h3>
            <StarRating stars={hotel.starRating ?? 0} />
          </div>
          <p className="text-sm text-muted-foreground">
            {hotel.city}, {hotel.country}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {hotel.description}
          </p>
          <div className="mt-auto flex items-end justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              {hotel.availableRoomTypeCount} tipo
              {hotel.availableRoomTypeCount !== 1 ? "s" : ""} de habitacion
            </p>
            {hotel.pricePerNightFrom != null && (
              <div className="flex flex-col items-end gap-0.5">
                {hotel.discountPercentage != null &&
                  hotel.discountPercentage > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      -{hotel.discountPercentage}%
                    </Badge>
                  )}
                <span className="text-sm font-semibold text-card-foreground">
                  {hotel.currency ?? ""} {hotel.pricePerNightFrom.toFixed(2)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / noche
                  </span>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
