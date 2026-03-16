"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { AdminHotelManager } from "@/src/components/admin/AdminHotelManager";
import { useAuth } from "@/src/context/AuthContext";
import {
  getAdminHotelDetails,
  isAdminAccessError,
} from "@/src/lib/api/admin-hotels";
import { handleApiError } from "@/src/lib/api/handle-error";
import { Button } from "@/src/components/ui/button";
import type { HotelDetailsDto } from "@/src/lib/api/generated/api-client";

export function AdminHotelDetailPageClient({
  hotelId,
}: {
  hotelId: number;
}) {
  const { authReady, runWithAuth } = useAuth();
  const [hotel, setHotel] = useState<HotelDetailsDto | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!authReady) return;
    if (!Number.isFinite(hotelId)) return;

    let cancelled = false;
    setLoadError(false);

    void runWithAuth(() => getAdminHotelDetails(hotelId))
      .then((result) => {
        if (!cancelled) {
          setAccessDenied(false);
          setLoadError(false);
          setHotel(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (isAdminAccessError(err)) {
            setAccessDenied(true);
            return;
          }
          setLoadError(true);
          handleApiError(err, "No se pudo cargar el detalle del hotel.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, hotelId, runWithAuth, retryKey]);

  const backLink = (
    <Link
      href="/admin/hotels"
      className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver al módulo admin
    </Link>
  );

  if (!Number.isFinite(hotelId)) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {backLink}
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-sm text-red-200 shadow-sm">
            Hotel inválido.
          </div>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {backLink}
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-red-400/20 bg-red-400/5 py-16 text-center">
            <p className="text-base font-semibold text-red-300">No se pudo cargar el hotel</p>
            <p className="text-sm text-slate-400">Hubo un problema al obtener los datos. Intenta de nuevo.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryKey((k) => k + 1)}
              className="border-white/15 text-slate-100 hover:text-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!authReady || (!accessDenied && !hotel)) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {backLink}
          <div className="animate-pulse space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-8 w-64 rounded bg-white/10" />
                  <div className="h-3 w-96 max-w-full rounded bg-white/8" />
                </div>
                <div className="h-6 w-16 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="flex gap-4 border-b border-white/10 pb-2">
              <div className="h-8 w-28 rounded bg-white/10" />
              <div className="h-8 w-28 rounded bg-white/8" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="h-5 w-36 rounded bg-white/10" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-10 rounded-lg bg-white/8" />
                <div className="h-10 rounded-lg bg-white/8" />
              </div>
              <div className="h-24 rounded-lg bg-white/8" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-10 rounded-lg bg-white/8" />
                <div className="h-10 rounded-lg bg-white/8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {backLink}

        {accessDenied ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            No tienes permisos de administrador para gestionar este hotel.
          </div>
        ) : (
          <AdminHotelManager initialHotel={hotel!} />
        )}
      </div>
    </main>
  );
}
