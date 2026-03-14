import { Star, X } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

export interface HotelFilterValues {
  starRating: number | null;
}

interface HotelFiltersProps {
  values: HotelFilterValues;
  onChange: (values: HotelFilterValues) => void;
}


export function HotelFilters({ values, onChange }: HotelFiltersProps) {
  const hasFilters = values.starRating !== null;

  function setStarRating(starRating: number | null) {
    onChange({ ...values, starRating });
  }

  function clearAll() {
    onChange({ starRating: null });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-card-foreground">
          Filtros
        </span>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-auto px-2 py-1 text-xs text-primary"
          >
            Limpiar todo
          </Button>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Estrellas
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                setStarRating(values.starRating === star ? null : star)
              }
              aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
              aria-pressed={
                values.starRating !== null && star <= values.starRating
              }
              className="focus:outline-none"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  values.starRating !== null && star <= values.starRating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-200 hover:text-amber-300",
                )}
              />
            </button>
          ))}
          {values.starRating !== null && (
            <button
              type="button"
              onClick={() => setStarRating(null)}
              className="ml-1 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Limpiar estrellas"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {values.starRating !== null && (
          <p className="text-xs text-muted-foreground">
            {values.starRating} estrella{values.starRating !== 1 ? "s" : ""} o
            mas
          </p>
        )}
      </div>
    </div>
  );
}
