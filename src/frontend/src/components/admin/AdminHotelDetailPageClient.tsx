"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminHotelManager } from "@/src/components/admin/AdminHotelManager";
import { useAuth } from "@/src/context/AuthContext";
import {
  getAdminHotelDetails,
  getAdminHotelInventory,
  isAdminAccessError,
  toAdminErrorMessage,
} from "@/src/lib/api/admin-hotels";
import type {
  HotelDetailsDto,
  HotelInventoryDto,
} from "@/src/lib/api/generated/api-client";

function getMonthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  );

  return { start, end };
}

export function AdminHotelDetailPageClient({
  hotelId,
}: {
  hotelId: number;
}) {
  const { authReady, runWithAuth } = useAuth();
  const [hotel, setHotel] = useState<HotelDetailsDto | null>(null);
  const [inventory, setInventory] = useState<HotelInventoryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!Number.isFinite(hotelId)) {
      return;
    }

    let cancelled = false;
    const { start, end } = getMonthRange();

    void runWithAuth(async () => {
      const [nextHotel, nextInventory] = await Promise.all([
        getAdminHotelDetails(hotelId),
        getAdminHotelInventory(hotelId, start, end),
      ]);

      return { nextHotel, nextInventory };
    })
      .then((result) => {
        if (!cancelled) {
          setAccessDenied(false);
          setError(null);
          setHotel(result.nextHotel);
          setInventory(result.nextInventory);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          if (isAdminAccessError(loadError)) {
            setAccessDenied(true);
            return;
          }

          setError(
            toAdminErrorMessage(
              loadError,
              "No se pudo cargar el detalle del hotel.",
            ),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, hotelId, runWithAuth]);

  if (!Number.isFinite(hotelId)) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-sm text-red-200 shadow-sm">
            Hotel invalido.
          </div>
        </div>
      </main>
    );
  }

  if (!authReady || (!accessDenied && (!hotel || !inventory))) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300 shadow-sm">
            {error ?? "Cargando detalle del hotel..."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/admin/hotels"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al modulo admin
        </Link>

        {accessDenied ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            No tienes permisos de administrador para gestionar este hotel.
          </div>
        ) : (
          <AdminHotelManager
            initialHotel={hotel}
            initialInventory={inventory}
          />
        )}
      </div>
    </main>
  );
}
