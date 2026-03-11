"use client";

import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";

interface HotelSearchBarProps {
  /** Extra classes applied to the outer <form> element */
  className?: string;
  /**
   * "dark" (default) — labels in blue-100, white button; for use on dark/hero backgrounds.
   * "light" — labels in slate-600, blue button; for use on light page backgrounds.
   */
  variant?: "dark" | "light";
  /**
   * When true, uses router.replace instead of router.push so the catalog
   * refreshes in place without adding a new history entry.
   */
  replace?: boolean;
}

export function HotelSearchBar({
  className = "",
  variant = "dark",
  replace = false,
}: HotelSearchBarProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const labelCls =
    variant === "light"
      ? "text-xs font-semibold uppercase tracking-wide text-slate-600"
      : "text-xs font-semibold uppercase tracking-wide text-blue-100";

  const inputCls =
    variant === "light"
      ? "rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
      : "rounded-lg border-0 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300";

  const btnCls =
    variant === "light"
      ? "rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
      : "rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-50";

  function handleSearch(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("numberOfGuests", guests);
    const url = `/hotels?${params.toString()}`;
    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`flex flex-col gap-3 sm:flex-row sm:items-end ${className}`}
    >
      <div className="flex flex-1 flex-col gap-1">
        <label className={labelCls}>Hotel</label>
        <input
          type="text"
          placeholder="Nombre del hotel"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Entrada</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Salida</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Huespedes</label>
        <input
          type="number"
          min={1}
          placeholder="1"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className={`w-24 ${inputCls}`}
        />
      </div>

      <button type="submit" className={btnCls}>
        Buscar
      </button>
    </form>
  );
}
