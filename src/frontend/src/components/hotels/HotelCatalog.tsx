"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HotelCard, type Hotel } from "@/src/components/hotels/HotelCard";

function SkeletonRow() {
  return (
    <div className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
      <div className="h-28 w-36 shrink-0 rounded-xl bg-slate-100" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-4/5 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function HotelCatalog() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);

    const query = new URLSearchParams();
    query.set("PageSize", "20");
    query.set("SortBy", "name");
    query.set("SortDirection", "asc");
    query.set("IsActive", "true");

    const name = searchParams.get("name");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const numberOfGuests = searchParams.get("numberOfGuests");

    if (name) query.set("name", name);
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    if (numberOfGuests) query.set("numberOfGuests", numberOfGuests);

    fetch(`/api/v1/hotels?${query.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        const items: Hotel[] = (json?.data?.data ?? []).map(
          (h: Record<string, unknown>) => ({
            id: h["id"] as number,
            name: h["name"] as string,
            city: h["city"] as string,
            country: h["country"] as string,
            starRating: (h["starRating"] as number) ?? 0,
            description: h["description"] as string,
            activeRoomTypeCount: (h["activeRoomTypeCount"] as number) ?? 0,
          }),
        );
        setHotels(items);
        setTotal(json?.data?.totalCount ?? items.length);
      })
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
        <span className="text-5xl">🔍</span>
        <p className="text-lg font-medium">No se encontraron hoteles</p>
        <p className="text-sm">Intenta con otros filtros de busqueda</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        {total} hotel{total !== 1 ? "es" : ""} encontrado
        {total !== 1 ? "s" : ""}
      </p>
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}
