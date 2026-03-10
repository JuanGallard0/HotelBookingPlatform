import Link from "next/link";
import type { HotelDto } from "@/types/hotel";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const gradients = [
  "from-blue-400 to-indigo-600",
  "from-emerald-400 to-teal-600",
  "from-orange-400 to-rose-600",
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-600",
  "from-amber-400 to-orange-600",
];

function getGradient(id: number) {
  return gradients[id % gradients.length];
}

interface HotelCardProps {
  hotel: HotelDto;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {/* Placeholder image */}
      <div
        className={cn(
          "flex h-44 items-center justify-center bg-linear-to-br text-white",
          getGradient(hotel.id)
        )}
        aria-hidden="true"
      >
        <span className="text-4xl">🏨</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
            {hotel.name}
          </h3>
          <StarRating rating={hotel.starRating} />
        </div>

        <p className="text-sm text-gray-500">
          {hotel.city}, {hotel.country}
        </p>

        <p className="line-clamp-2 text-sm text-gray-600">{hotel.description}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <Badge variant={hotel.isActive ? "green" : "default"}>
            {hotel.isActive ? "Available" : "Unavailable"}
          </Badge>
          {hotel.activeRoomTypeCount > 0 && (
            <span className="text-xs text-gray-500">
              {hotel.activeRoomTypeCount} room type{hotel.activeRoomTypeCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn("h-3.5 w-3.5", i < rating ? "text-amber-400" : "text-gray-200")}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
