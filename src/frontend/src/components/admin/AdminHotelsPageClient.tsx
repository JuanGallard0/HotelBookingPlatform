"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AdminHotelsDashboard,
  type AdminHotelsParams,
  type SortField,
  type StatusFilter,
} from "@/src/components/admin/AdminHotelsDashboard";
import { useAuth } from "@/src/context/AuthContext";
import {
  getAdminHotels,
  isAdminAccessError,
} from "@/src/lib/api/admin-hotels";
import { handleApiError } from "@/src/lib/api/handle-error";
import type { HotelDto } from "@/src/lib/api/generated/api-client";

const PAGE_SIZE = 10;

const SORT_BY_MAP: Record<SortField, string> = {
  name: "Name",
  starRating: "StarRating",
  city: "City",
  country: "Country",
};

function readParams(searchParams: URLSearchParams): AdminHotelsParams {
  return {
    search: searchParams.get("q") ?? "",
    statusFilter: (searchParams.get("status") ?? "all") as StatusFilter,
    sortField: (searchParams.get("sort") ?? "name") as SortField,
    sortDir: (searchParams.get("dir") ?? "asc") as "asc" | "desc",
    page: Math.max(1, Number(searchParams.get("page") ?? "1")),
  };
}

export function AdminHotelsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authReady, runWithAuth } = useAuth();

  const [hotels, setHotels] = useState<HotelDto[] | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [accessDenied, setAccessDenied] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  // Track which (paramsKey) was last successfully loaded — used to derive isLoading
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const paramsKey = searchParams.toString() + "|" + fetchKey;
  // Show loading overlay only after the initial load (hotels !== null) and when
  // params have changed but the new data hasn't arrived yet.
  const isLoading = hotels !== null && loadedKey !== paramsKey;

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;
    const key = searchParams.toString() + "|" + fetchKey;
    const p = readParams(searchParams);
    const isActive =
      p.statusFilter === "all" ? undefined : p.statusFilter === "active";

    void runWithAuth(() =>
      getAdminHotels({
        search: p.search.trim() || undefined,
        isActive,
        page: p.page,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY_MAP[p.sortField],
        sortDirection: p.sortDir,
      }),
    )
      .then((result) => {
        if (!cancelled) {
          setAccessDenied(false);
          setHotels(result.hotels);
          setTotalRecords(result.totalRecords);
          setTotalPages(result.totalPages);
          setLoadedKey(key);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setLoadedKey(key);
          if (isAdminAccessError(loadError)) {
            setAccessDenied(true);
            setHotels([]);
            return;
          }
          handleApiError(loadError, "No se pudieron cargar los hoteles.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, runWithAuth, searchParams, fetchKey]);

  function handleParamsChange(patch: Partial<AdminHotelsParams>) {
    const next = new URLSearchParams(searchParams.toString());
    const merged = { ...readParams(searchParams), ...patch };

    if (merged.search.trim()) next.set("q", merged.search.trim());
    else next.delete("q");

    if (merged.statusFilter !== "all") next.set("status", merged.statusFilter);
    else next.delete("status");

    if (merged.sortField !== "name") next.set("sort", merged.sortField);
    else next.delete("sort");

    if (merged.sortDir !== "asc") next.set("dir", merged.sortDir);
    else next.delete("dir");

    if (merged.page > 1) next.set("page", String(merged.page));
    else next.delete("page");

    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleRefetch() {
    setFetchKey((k) => k + 1);
  }

  if (!authReady || hotels === null) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="h-9 w-64 animate-pulse rounded-lg bg-white/8" />
            <div className="h-9 w-28 animate-pulse rounded-lg bg-white/8" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-white/10" />
                      <div className="h-4 w-48 rounded bg-white/10" />
                      <div className="h-3.5 w-20 rounded bg-white/10" />
                    </div>
                    <div className="h-3 w-full max-w-sm rounded bg-white/8" />
                    <div className="flex gap-4">
                      <div className="h-3 w-28 rounded bg-white/8" />
                      <div className="h-3 w-36 rounded bg-white/8" />
                    </div>
                  </div>
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-white/8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {accessDenied ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            No tienes permisos de administrador para acceder a este modulo.
          </div>
        ) : (
          <AdminHotelsDashboard
            hotels={hotels}
            totalRecords={totalRecords}
            totalPages={totalPages}
            params={readParams(searchParams)}
            isLoading={isLoading}
            onParamsChange={handleParamsChange}
            onRefetch={handleRefetch}
          />
        )}
      </div>
    </main>
  );
}
