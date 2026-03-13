"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AdminHotelsDashboard } from "@/src/components/admin/AdminHotelsDashboard";
import { useAuth } from "@/src/context/AuthContext";
import {
  getAdminHotels,
  isAdminAccessError,
  toAdminErrorMessage,
} from "@/src/lib/api/admin-hotels";
import type { HotelDto } from "@/src/lib/api/generated/api-client";

export function AdminHotelsPageClient() {
  const { authReady, runWithAuth } = useAuth();
  const [hotels, setHotels] = useState<HotelDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          setError(null);
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

          setError(
            toAdminErrorMessage(
              loadError,
              "No se pudieron cargar los hoteles.",
            ),
          );
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
            {error ?? "Cargando modulo administrativo..."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(251,191,36,0.14),rgba(15,23,42,0.2)_34%,rgba(30,41,59,0.65)_100%)] p-8 shadow-[0_25px_60px_rgba(2,6,23,0.35)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Modo administrador
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50 sm:text-4xl">
            Gestion de hoteles
          </h1>
        </div>

        {accessDenied ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            No tienes permisos de administrador para acceder a este modulo.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {!accessDenied ? <AdminHotelsDashboard initialHotels={hotels} /> : null}
      </div>
    </main>
  );
}
