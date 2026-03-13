import { Star, X } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

export interface HotelFilterValues {
  country: string;
  city: string;
  starRating: number | null;
}

interface HotelFiltersProps {
  values: HotelFilterValues;
  onChange: (values: HotelFilterValues) => void;
}

const CA_DATA = [
  { country: "Guatemala", city: "Ciudad de Guatemala" },
  { country: "Belice", city: "Belmopan" },
  { country: "Honduras", city: "Tegucigalpa" },
  { country: "El Salvador", city: "San Salvador" },
  { country: "Nicaragua", city: "Managua" },
  { country: "Costa Rica", city: "San Jose" },
  { country: "Panama", city: "Ciudad de Panama" },
] as const;

const CA_COUNTRIES = CA_DATA.map((d) => d.country);

export function HotelFilters({ values, onChange }: HotelFiltersProps) {
  const hasFilters =
    values.country !== "" || values.city !== "" || values.starRating !== null;

  function setCountry(country: string) {
    const match = CA_DATA.find((d) => d.country === country);
    const cityStillValid = match?.city === values.city;

    onChange({
      ...values,
      country,
      city: cityStillValid ? values.city : "",
    });
  }

  function setCity(city: string) {
    onChange({ ...values, city });
  }

  function setStarRating(starRating: number | null) {
    onChange({ ...values, starRating });
  }

  function clearAll() {
    onChange({ country: "", city: "", starRating: null });
  }

  const visibleCities =
    values.country !== ""
      ? CA_DATA.filter((d) => d.country === values.country).map((d) => d.city)
      : CA_DATA.map((d) => d.city);

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

      <Separator />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pais
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CA_COUNTRIES.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() =>
                setCountry(values.country === country ? "" : country)
              }
              aria-pressed={values.country === country}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                values.country === country
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground hover:border-primary/40 hover:bg-primary/10",
              )}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ciudad
        </span>
        <div className="flex flex-wrap gap-1.5">
          {visibleCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setCity(values.city === city ? "" : city)}
              aria-pressed={values.city === city}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                values.city === city
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground hover:border-primary/40 hover:bg-primary/10",
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
