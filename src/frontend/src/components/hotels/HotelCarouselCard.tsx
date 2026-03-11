import Image from "next/image";
import type { Hotel } from "@/src/components/hotels/HotelListCard";
import h1 from "@/src/assets/h1.jpg";
import h2 from "@/src/assets/h2.jpg";
import h3 from "@/src/assets/h3.jpg";
import h4 from "@/src/assets/h4.jpg";
import h5 from "@/src/assets/h5.jpg";

const HOTEL_IMAGES = [h1, h2, h3, h4, h5];

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < stars ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export function HotelCarouselCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="flex w-64 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-36 overflow-hidden rounded-t-2xl">
        <Image
          src={HOTEL_IMAGES[(hotel.id - 1) % 5]}
          alt={hotel.name}
          fill
          className="object-cover"
          sizes="256px"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-slate-900">
            {hotel.name}
          </h3>
          <StarRating stars={hotel.starRating} />
        </div>
        <p className="text-xs text-slate-500">
          {hotel.city}, {hotel.country}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
          {hotel.description}
        </p>
        <p className="mt-auto pt-3 text-xs text-slate-400">
          {hotel.activeRoomTypeCount} tipo
          {hotel.activeRoomTypeCount !== 1 ? "s" : ""} de habitacion
        </p>
      </div>
    </div>
  );
}
