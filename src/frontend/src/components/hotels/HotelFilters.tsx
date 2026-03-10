"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SORT_OPTIONS } from "@/lib/constants";

export function HotelFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = (form.get("q") as string).trim();
    const city = (form.get("city") as string).trim();
    const country = (form.get("country") as string).trim();
    router.push(
      `${pathname}?${createQueryString({
        q: q || undefined,
        city: city || undefined,
        country: country || undefined,
      })}`
    );
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [sortBy, sortDirection] = e.target.value.split("|");
    router.push(
      `${pathname}?${createQueryString({ sortBy, sortDirection })}`
    );
  }

  const currentSort = `${searchParams.get("sortBy") ?? ""}|${searchParams.get("sortDirection") ?? ""}`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <Input
          name="q"
          type="search"
          placeholder="Search hotels…"
          defaultValue={searchParams.get("q") ?? ""}
          aria-label="Search hotels by name"
          className="flex-1"
        />
        <Input
          name="city"
          type="text"
          placeholder="City"
          defaultValue={searchParams.get("city") ?? ""}
          aria-label="Filter by city"
          className="sm:w-36"
        />
        <Input
          name="country"
          type="text"
          placeholder="Country"
          defaultValue={searchParams.get("country") ?? ""}
          aria-label="Filter by country"
          className="sm:w-36"
        />
        <Button type="submit" variant="primary" size="md" className="shrink-0">
          Search
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <label htmlFor="sort" className="shrink-0 text-sm font-medium text-gray-700">
          Sort by
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={handleSortChange}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="|">Default</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={`${opt.value}|${opt.direction}`} value={`${opt.value}|${opt.direction}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
