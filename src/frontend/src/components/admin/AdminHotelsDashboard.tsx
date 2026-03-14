"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { HotelDto } from "@/src/lib/api/generated/api-client";
import {
  createAdminHotel,
  deleteAdminHotel,
  toAdminErrorMessage,
} from "@/src/lib/api/admin-hotels";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";

type CreateHotelFormState = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phoneNumber: string;
  starRating: string;
};

const emptyForm: CreateHotelFormState = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "",
  email: "",
  phoneNumber: "",
  starRating: "4",
};

type SortField = "name" | "starRating" | "city" | "country";
type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE = 8;

function HotelStarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < stars ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-600"}`}
        />
      ))}
    </span>
  );
}

function StarFilterControl({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
          aria-pressed={value !== null && star <= value}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              value !== null && star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-600 hover:text-amber-400",
            )}
          />
        </button>
      ))}
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-1 text-slate-400 hover:text-slate-100"
          aria-label="Limpiar estrellas"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function AdminHotelsDashboard({
  initialHotels,
}: {
  initialHotels: HotelDto[];
}) {
  const router = useRouter();
  const [hotels, setHotels] = useState(initialHotels);
  const [form, setForm] = useState<CreateHotelFormState>(emptyForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HotelDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = hotels;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (h) =>
          h.name?.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q) ||
          h.country?.toLowerCase().includes(q),
      );
    }

    if (starFilter !== null) {
      result = result.filter((h) => (h.starRating ?? 0) >= starFilter);
    }

    if (statusFilter === "active") {
      result = result.filter((h) => h.isActive);
    } else if (statusFilter === "inactive") {
      result = result.filter((h) => !h.isActive);
    }

    return [...result].sort((a, b) => {
      if (sortField === "starRating") {
        const diff = (a.starRating ?? 0) - (b.starRating ?? 0);
        return sortDir === "asc" ? diff : -diff;
      }
      const aVal = String(a[sortField] ?? "");
      const bVal = String(b[sortField] ?? "");
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [hotels, search, starFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const hasFilters =
    search.trim() !== "" || starFilter !== null || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStarFilter(null);
    setStatusFilter("all");
    setPage(1);
  }

  function applyFilter(fn: () => void) {
    fn();
    setPage(1);
  }

  async function handleDeleteHotel() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminHotel(deleteTarget.hotelId!);
      setHotels((current) => current.filter((h) => h.hotelId !== deleteTarget.hotelId));
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(toAdminErrorMessage(error, "No se pudo eliminar el hotel."));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCreateHotel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);

    try {
      const hotelId = await createAdminHotel({
        name: form.name,
        description: form.description,
        address: form.address,
        city: form.city,
        country: form.country,
        email: form.email,
        phoneNumber: form.phoneNumber,
        starRating: Number(form.starRating),
      });

      if (typeof hotelId === "number") {
        setHotels((current) => [
          ...current,
          {
            hotelId,
            name: form.name,
            description: form.description,
            address: form.address,
            city: form.city,
            country: form.country,
            email: form.email,
            phoneNumber: form.phoneNumber,
            starRating: Number(form.starRating),
            isActive: true,
          } as HotelDto,
        ]);
        setForm(emptyForm);
        setCreateOpen(false);
        router.push(`/admin/hotels/${hotelId}`);
      }
    } catch (error) {
      setCreateError(toAdminErrorMessage(error, "No se pudo crear el hotel."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar: filters + create button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-9 w-64 pl-9 text-sm"
              placeholder="Nombre, ciudad o pais..."
              value={search}
              onChange={(e) => applyFilter(() => setSearch(e.target.value))}
            />
          </div>

          <StarFilterControl
            value={starFilter}
            onChange={(v) => applyFilter(() => setStarFilter(v))}
          />

          <div className="flex overflow-hidden rounded-lg border border-white/10 text-xs font-medium">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => applyFilter(() => setStatusFilter(s))}
                className={cn(
                  "px-3 py-1.5 transition",
                  statusFilter === s
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/8 hover:text-slate-100",
                )}
              >
                {s === "all"
                  ? "Todos"
                  : s === "active"
                    ? "Activos"
                    : "Inactivos"}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>

        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Crear hotel
        </Button>
      </div>

      {/* Count + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {filtered.length} hotel{filtered.length !== 1 ? "es" : ""}
          {hasFilters ? " encontrados" : " registrados"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ordenar por</span>
          <Select
            value={sortField}
            onValueChange={(v) => applyFilter(() => setSortField(v as SortField))}
          >
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="starRating">Estrellas</SelectItem>
              <SelectItem value="city">Ciudad</SelectItem>
              <SelectItem value="country">Pais</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => applyFilter(() => setSortDir((d) => (d === "asc" ? "desc" : "asc")))}
            aria-label={
              sortDir === "asc" ? "Orden ascendente" : "Orden descendente"
            }
          >
            {sortDir === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Hotel list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
          <Building2 className="h-10 w-10 opacity-30" />
          <p className="text-base font-medium">No se encontraron hoteles</p>
          {hasFilters && (
            <p className="text-sm">Intenta con otros filtros</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((hotel) => (
            <Card
              key={hotel.hotelId}
              className="cursor-pointer border-white/10 bg-white/5 text-slate-100 transition hover:border-white/20 hover:bg-white/8"
              onClick={() => router.push(`/admin/hotels/${hotel.hotelId}`)}
            >
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                    <h3 className="text-base font-semibold text-slate-100">
                      {hotel.name}
                    </h3>
                    <HotelStarRating stars={hotel.starRating ?? 0} />
                    <Badge variant={hotel.isActive ? "secondary" : "outline"}>
                      {hotel.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-400">
                    {hotel.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {hotel.city}, {hotel.country}
                    </span>
                    {hotel.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {hotel.email}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-red-400/20 text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(hotel); setDeleteError(null); }}
                  aria-label="Eliminar hotel"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <span className="text-sm text-slate-400">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Eliminar hotel</DialogTitle>
            <DialogDescription className="text-slate-400">
              ¿Confirmas que deseas eliminar{" "}
              <span className="font-semibold text-slate-200">{deleteTarget?.name}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="border-white/15 text-slate-100 hover:text-slate-100"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHotel}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create hotel dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Crear hotel</DialogTitle>
          </DialogHeader>

          <form
            id="create-hotel-form"
            className="space-y-3"
            onSubmit={handleCreateHotel}
          >
            <Input
              placeholder="Nombre"
              value={form.name}
              onChange={(e) =>
                setForm((c) => ({ ...c, name: e.target.value }))
              }
            />
            <textarea
              className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Descripcion"
              value={form.description}
              onChange={(e) =>
                setForm((c) => ({ ...c, description: e.target.value }))
              }
            />
            <Input
              placeholder="Direccion"
              value={form.address}
              onChange={(e) =>
                setForm((c) => ({ ...c, address: e.target.value }))
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Ciudad"
                value={form.city}
                onChange={(e) =>
                  setForm((c) => ({ ...c, city: e.target.value }))
                }
              />
              <Input
                placeholder="Pais"
                value={form.country}
                onChange={(e) =>
                  setForm((c) => ({ ...c, country: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Correo"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((c) => ({ ...c, email: e.target.value }))
                }
              />
              <Input
                placeholder="Telefono"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((c) => ({ ...c, phoneNumber: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Categoria (estrellas)</label>
              <Input
                placeholder="1 - 5"
                type="number"
                min={1}
                max={5}
                value={form.starRating}
                onChange={(e) =>
                  setForm((c) => ({ ...c, starRating: e.target.value }))
                }
              />
            </div>

            {createError ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {createError}
              </div>
            ) : null}
          </form>

          <DialogFooter className="border-white/10 bg-transparent">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              form="create-hotel-form"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear y gestionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
