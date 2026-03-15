"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

interface HotelSearchBarProps {
  className?: string;
  variant?: "dark" | "light";
  replace?: boolean;
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function DatePickerField({
  label,
  value,
  onChange,
  fromDate,
  labelCls,
  triggerCls,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  fromDate?: Date;
  labelCls: string;
  triggerCls: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isSelected = selected && isValid(selected);

  return (
    <div className="flex flex-col gap-1">
      <Label className={labelCls}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-36 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
              triggerCls,
              !isSelected && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
            {isSelected ? format(selected, "dd/MM/yyyy") : "dd/mm/yyyy"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={isSelected ? selected : undefined}
            onSelect={(day) => {
              onChange(day ? format(day, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
            disabled={{ before: fromDate ?? today() }}
            startMonth={fromDate ?? today()}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function HotelSearchBar({
  className = "",
  variant = "dark",
  replace = false,
}: HotelSearchBarProps) {
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();

  return (
    <HotelSearchBarInner
      key={paramsKey}
      initialName={searchParams.get("search") ?? ""}
      initialCheckIn={searchParams.get("checkIn") ?? ""}
      initialCheckOut={searchParams.get("checkOut") ?? ""}
      initialGuests={searchParams.get("numberOfGuests") ?? ""}
      initialRooms={searchParams.get("numberOfRooms") ?? ""}
      className={className}
      variant={variant}
      replace={replace}
    />
  );
}

function HotelSearchBarInner({
  className = "",
  variant = "dark",
  replace = false,
  initialName,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialRooms,
}: HotelSearchBarProps & {
  initialName: string;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: string;
  initialRooms: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [rooms, setRooms] = useState(initialRooms);

  const labelCls = cn(
    "text-xs font-semibold uppercase tracking-wide",
    variant === "light" ? "text-slate-600" : "text-blue-100",
  );

  const inputCls =
    variant === "dark" ? "border-0 bg-white focus-visible:ring-blue-300" : "";

  const triggerCls =
    variant === "dark"
      ? "border-0 bg-white text-slate-900 hover:bg-white/90 focus-visible:ring-blue-300"
      : "border-border bg-background hover:bg-accent";

  function handleSearch(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmedName = name.trim();
    const normalizedGuests = Number(guests);
    const normalizedRooms = Number(rooms);

    if (trimmedName) params.set("search", trimmedName);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (Number.isInteger(normalizedGuests) && normalizedGuests > 0) {
      params.set("numberOfGuests", String(normalizedGuests));
    }
    if (Number.isInteger(normalizedRooms) && normalizedRooms > 0) {
      params.set("numberOfRooms", String(normalizedRooms));
    }
    const query = params.toString();
    const url = query ? `/hotels?${query}` : "/hotels";
    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }

  const checkInDate = checkIn
    ? parse(checkIn, "yyyy-MM-dd", new Date())
    : undefined;
  const minCheckOut =
    checkInDate && isValid(checkInDate)
      ? new Date(checkInDate.getTime() + 86400000)
      : tomorrow();

  return (
    <form
      onSubmit={handleSearch}
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-end", className)}
    >
      <div className="flex flex-1 flex-col gap-1">
        <Label className={labelCls}>Hotel / Ciudad / País</Label>
        <Input
          type="text"
          placeholder="Nombre del hotel, ciudad o país"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </div>

      <DatePickerField
        label="Entrada"
        value={checkIn}
        onChange={(v) => {
          setCheckIn(v);
          // clear checkout if it's now before checkin
          if (checkOut && v >= checkOut) setCheckOut("");
        }}
        labelCls={labelCls}
        triggerCls={triggerCls}
      />

      <DatePickerField
        label="Salida"
        value={checkOut}
        onChange={setCheckOut}
        fromDate={minCheckOut}
        labelCls={labelCls}
        triggerCls={triggerCls}
      />

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

      <div className="flex flex-col gap-1">
        <Label className={labelCls}>Habitaciones</Label>
        <Input
          type="number"
          min={1}
          placeholder="1"
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
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
