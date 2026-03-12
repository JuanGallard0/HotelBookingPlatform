"use client";

import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";

interface HotelSearchBarProps {
  /** Extra classes applied to the outer <form> element */
  className?: string;
  /**
   * "dark" (default) — labels in blue-100; for use on dark/hero backgrounds.
   * "light" — labels in slate-600; for use on light page backgrounds.
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

  const labelCls = cn(
    "text-xs font-semibold uppercase tracking-wide",
    variant === "light" ? "text-slate-600" : "text-blue-100",
  );

  const inputCls =
    variant === "dark" ? "border-0 bg-white focus-visible:ring-blue-300" : "";

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
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-end", className)}
    >
      <div className="flex flex-1 flex-col gap-1">
        <Label className={labelCls}>Hotel</Label>
        <Input
          type="text"
          placeholder="Nombre del hotel"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className={labelCls}>Entrada</Label>
        <Input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className={labelCls}>Salida</Label>
        <Input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className={labelCls}>Huespedes</Label>
        <Input
          type="number"
          min={1}
          placeholder="1"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className={cn("w-24", inputCls)}
        />
      </div>

      <Button
        type="submit"
        variant={variant === "dark" ? "secondary" : "default"}
        className={variant === "dark" ? "text-primary font-semibold" : ""}
      >
        Buscar
      </Button>
    </form>
  );
}
