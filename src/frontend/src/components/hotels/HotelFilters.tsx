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
  { country: "Belice", city: "Belmopán" },
  { country: "Honduras", city: "Tegucigalpa" },
  { country: "El Salvador", city: "San Salvador" },
  { country: "Nicaragua", city: "Managua" },
  { country: "Costa Rica", city: "San José" },
  { country: "Panamá", city: "Ciudad de Panamá" },
] as const;

const CA_COUNTRIES = CA_DATA.map((d) => d.country);

export function HotelFilters({ values, onChange }: HotelFiltersProps) {
  const hasFilters =
    values.country !== "" || values.city !== "" || values.starRating !== null;

  function setCountry(country: string) {
    // When country changes, also clear city if it doesn't belong to new country
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

  // Which cities to show: if a country is selected, only its capital
  const visibleCities =
    values.country !== ""
      ? CA_DATA.filter((d) => d.country === values.country).map((d) => d.city)
      : CA_DATA.map((d) => d.city);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Filtros</span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Star rating */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Estrellas
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() =>
                setStarRating(values.starRating === star ? null : star)
              }
              aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
              aria-pressed={
                values.starRating !== null && star <= values.starRating
              }
              className="focus:outline-none"
            >
              <svg
                className={`h-6 w-6 transition-colors ${
                  values.starRating !== null && star <= values.starRating
                    ? "text-amber-400"
                    : "text-slate-200 hover:text-amber-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {values.starRating !== null && (
            <button
              onClick={() => setStarRating(null)}
              className="ml-1 text-xs text-slate-400 hover:text-slate-600"
              aria-label="Limpiar estrellas"
            >
              ✕
            </button>
          )}
        </div>
        {values.starRating !== null && (
          <p className="text-xs text-slate-400">
            {values.starRating} estrella{values.starRating !== 1 ? "s" : ""} o
            más
          </p>
        )}
      </div>

      {/* Country */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          País
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CA_COUNTRIES.map((country) => (
            <button
              key={country}
              onClick={() =>
                setCountry(values.country === country ? "" : country)
              }
              aria-pressed={values.country === country}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                values.country === country
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ciudad
        </span>
        <div className="flex flex-wrap gap-1.5">
          {visibleCities.map((city) => (
            <button
              key={city}
              onClick={() => setCity(values.city === city ? "" : city)}
              aria-pressed={values.city === city}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                values.city === city
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
