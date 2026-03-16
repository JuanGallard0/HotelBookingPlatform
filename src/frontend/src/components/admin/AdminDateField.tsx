"use client";

import { useState } from "react";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Label } from "@/src/components/ui/label";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

export function AdminDateField({
  label,
  value,
  onChange,
  fromDate,
  className,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  fromDate?: Date;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isSelected = selected && isValid(selected);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium text-slate-300">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
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
            disabled={fromDate ? { before: fromDate } : undefined}
            startMonth={fromDate}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
