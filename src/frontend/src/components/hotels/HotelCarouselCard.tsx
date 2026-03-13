import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Hotel } from "@/src/components/hotels/HotelListCard";
import { Card, CardContent } from "@/src/components/ui/card";
import h1 from "@/src/assets/h1.webp";
import h2 from "@/src/assets/h2.webp";
import h3 from "@/src/assets/h3.webp";
import h4 from "@/src/assets/h4.webp";
import h5 from "@/src/assets/h5.webp";

const HOTEL_IMAGES = [h1, h2, h3, h4, h5];

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < stars ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-200"}`}
        />
      ))}
    </span>
  );
}

export function HotelCarouselCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link href={`/hotels/${hotel.hotelId}`} className="block w-64 shrink-0">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md">
        <div className="relative h-36 overflow-hidden">
          <Image
            src={HOTEL_IMAGES[((hotel.hotelId ?? 0) - 1) % 5]}
            alt={hotel.name ?? ""}
            fill
            className="object-cover"
            sizes="256px"
          />
        </div>
        <CardContent className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-card-foreground">
              {hotel.name}
            </h3>
            <StarRating stars={hotel.starRating ?? 0} />
          </div>
          <p className="text-xs text-muted-foreground">
            {hotel.city}, {hotel.country}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {hotel.description}
          </p>
          <p className="mt-auto pt-3 text-xs text-muted-foreground">
            {hotel.availableRoomTypeCount} tipo
            {hotel.availableRoomTypeCount !== 1 ? "s" : ""} de habitacion
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
