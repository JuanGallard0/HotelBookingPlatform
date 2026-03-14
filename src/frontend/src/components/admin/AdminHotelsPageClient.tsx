"use client";

import { useEffect, useState } from "react";
import { AdminHotelsDashboard } from "@/src/components/admin/AdminHotelsDashboard";
import { useAuth } from "@/src/context/AuthContext";
import {
  getAdminHotels,
  isAdminAccessError,
} from "@/src/lib/api/admin-hotels";
import { handleApiError } from "@/src/lib/api/handle-error";
import type { HotelDto } from "@/src/lib/api/generated/api-client";

export function AdminHotelsPageClient() {
  const { authReady, runWithAuth } = useAuth();
  const [hotels, setHotels] = useState<HotelDto[] | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    let cancelled = false;

    void runWithAuth(() => getAdminHotels())
      .then((response) => {
        if (!cancelled) {
          setAccessDenied(false);
          setHotels(response);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
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
  }, [authReady, runWithAuth]);

  if (!authReady || hotels === null) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300 shadow-sm">
            Cargando modulo administrativo...
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
        ) : null}

        {!accessDenied ? <AdminHotelsDashboard initialHotels={hotels} /> : null}
      </div>
    </main>
  );
}
