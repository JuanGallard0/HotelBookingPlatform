"use client";

import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
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
} from "@/src/lib/api/admin-hotels";
import { handleApiError } from "@/src/lib/api/handle-error";
import { toast } from "sonner";
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

export type SortField = "name" | "starRating" | "city" | "country";
export type StatusFilter = "all" | "active" | "inactive";

export type AdminHotelsParams = {
  search: string;
  statusFilter: StatusFilter;
  sortField: SortField;
  sortDir: "asc" | "desc";
  page: number;
};

function AdminHotelsToolbar({
  params,
  onParamsChange,
  onCreateHotel,
}: {
  params: AdminHotelsParams;
  onParamsChange: (patch: Partial<AdminHotelsParams>) => void;
  onCreateHotel: () => void;
}) {
  const [searchInput, setSearchInput] = useState(params.search);
  const hasFilters = params.search.trim() !== "" || params.statusFilter !== "all";

  function submitSearch() {
    onParamsChange({ search: searchInput.trim(), page: 1 });
  }

  function clearFilters() {
    setSearchInput("");
    onParamsChange({ search: "", statusFilter: "all", page: 1 });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-9 w-56 pl-9 text-sm"
              placeholder="Nombre, ciudad o pais..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 border-white/10 text-slate-300 hover:bg-white/8 hover:text-slate-100"
            onClick={submitSearch}
          >
            Buscar
          </Button>
        </div>

        <div className="flex overflow-hidden rounded-lg border border-white/10 text-xs font-medium">
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onParamsChange({ statusFilter: status, page: 1 })}
              className={cn(
                "px-3 py-1.5 transition",
                params.statusFilter === status
                  ? "bg-amber-400 text-slate-950"
                  : "text-slate-300 hover:bg-white/8 hover:text-slate-100",
              )}
            >
              {status === "all"
                ? "Todos"
                : status === "active"
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

      <Button onClick={onCreateHotel} className="shrink-0">
        <Plus className="h-4 w-4" />
        Crear hotel
      </Button>
    </div>
  );
}

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

function StarPickerControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
          aria-pressed={star <= value}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-600 hover:text-amber-400",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function CreateHotelDialog({
  open,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: CreateHotelFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateHotelFormState>(emptyForm);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setForm(emptyForm);
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Crear hotel</DialogTitle>
        </DialogHeader>

        <form id="create-hotel-form" className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Nombre <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="Nombre del hotel"
              value={form.name}
              required
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Descripcion <span className="text-red-400">*</span>
            </label>
            <textarea
              className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Descripcion del hotel"
              value={form.description}
              required
              onChange={(e) =>
                setForm((c) => ({ ...c, description: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Direccion <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="Direccion"
              value={form.address}
              required
              onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Ciudad <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="Ciudad"
                value={form.city}
                required
                onChange={(e) => setForm((c) => ({ ...c, city: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Pais <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="Pais"
                value={form.country}
                required
                onChange={(e) =>
                  setForm((c) => ({ ...c, country: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Correo <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="correo@hotel.com"
                type="email"
                value={form.email}
                required
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Telefono <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="+503 0000-0000"
                value={form.phoneNumber}
                required
                onChange={(e) =>
                  setForm((c) => ({ ...c, phoneNumber: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Categoria (estrellas) <span className="text-red-400">*</span>
            </label>
            <StarPickerControl
              value={Number(form.starRating)}
              onChange={(v) => setForm((c) => ({ ...c, starRating: String(v) }))}
            />
          </div>
        </form>

        <DialogFooter className="border-white/10 bg-transparent">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            type="button"
          >
            Cancelar
          </Button>
          <Button form="create-hotel-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear y gestionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const HotelsResults = memo(function HotelsResults({
  hotels,
  totalRecords,
  totalPages,
  params,
  isLoading,
  hasFilters,
  onParamsChange,
  onCreateHotel,
  onDeleteHotel,
}: {
  hotels: HotelDto[];
  totalRecords: number;
  totalPages: number;
  params: AdminHotelsParams;
  isLoading: boolean;
  hasFilters: boolean;
  onParamsChange: (patch: Partial<AdminHotelsParams>) => void;
  onCreateHotel: () => void;
  onDeleteHotel: (hotel: HotelDto) => void;
}) {
  const router = useRouter();

  function clearFilters() {
    onParamsChange({ search: "", statusFilter: "all", page: 1 });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {totalRecords} hotel{totalRecords !== 1 ? "es" : ""}
          {hasFilters ? " encontrados" : " registrados"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ordenar por</span>
          <Select
            value={params.sortField}
            onValueChange={(v) =>
              onParamsChange({ sortField: v as SortField, page: 1 })
            }
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
            onClick={() =>
              onParamsChange({
                sortDir: params.sortDir === "asc" ? "desc" : "asc",
                page: 1,
              })
            }
            aria-label={
              params.sortDir === "asc"
                ? "Orden ascendente"
                : "Orden descendente"
            }
          >
            {params.sortDir === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "transition-opacity duration-150",
          isLoading && "pointer-events-none opacity-50",
        )}
      >
        {hotels.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Building2 className="h-8 w-8 text-slate-500" />
            </span>
            <div>
              <p className="text-base font-semibold text-slate-300">
                No se encontraron hoteles
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Intenta ajustar los filtros de busqueda."
                  : "Crea tu primer hotel para comenzar."}
              </p>
            </div>
            {!hasFilters && (
              <Button onClick={onCreateHotel} size="sm">
                <Plus className="h-4 w-4" />
                Crear hotel
              </Button>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-amber-400 transition-colors hover:text-amber-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {hotels.map((hotel) => (
              <Card
                key={hotel.hotelId}
                className="cursor-pointer border-white/10 bg-white/5 text-slate-100 transition hover:border-white/20 hover:bg-white/8"
                onClick={() => router.push(`/admin/hotels/${hotel.hotelId}`)}
              >
                <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                      <h3 className="text-sm font-semibold text-slate-100">
                        {hotel.name}
                      </h3>
                      <HotelStarRating stars={hotel.starRating ?? 0} />
                      <Badge variant={hotel.isActive ? "secondary" : "outline"}>
                        {hotel.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="line-clamp-1 text-xs text-slate-400">
                      {hotel.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
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
                      {hotel.phoneNumber && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {hotel.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 border-red-400/20 text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHotel(hotel);
                    }}
                    aria-label="Eliminar hotel"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={params.page <= 1 || isLoading}
            onClick={() => onParamsChange({ page: params.page - 1 })}
            aria-label="Pagina anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-28 text-center text-sm text-slate-400">
            Pagina <span className="font-medium text-slate-200">{params.page}</span>{" "}
            de <span className="font-medium text-slate-200">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={params.page >= totalPages || isLoading}
            onClick={() => onParamsChange({ page: params.page + 1 })}
            aria-label="Pagina siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
});

export function AdminHotelsDashboard({
  hotels,
  totalRecords,
  totalPages,
  params,
  isLoading,
  onParamsChange,
  onRefetch,
}: {
  hotels: HotelDto[];
  totalRecords: number;
  totalPages: number;
  params: AdminHotelsParams;
  isLoading: boolean;
  onParamsChange: (patch: Partial<AdminHotelsParams>) => void;
  onRefetch: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HotelDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasFilters = params.search.trim() !== "" || params.statusFilter !== "all";

  async function handleDeleteHotel() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAdminHotel(deleteTarget.hotelId!);
      setDeleteTarget(null);
      toast.success("Hotel eliminado.");
      onRefetch();
    } catch (error) {
      handleApiError(error, "No se pudo eliminar el hotel.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCreateHotel(form: CreateHotelFormState) {
    setIsSubmitting(true);
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
        setCreateOpen(false);
        toast.success("Hotel creado.");
        router.push(`/admin/hotels/${hotelId}`);
      }
    } catch (error) {
      handleApiError(error, "No se pudo crear el hotel.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminHotelsToolbar
        key={params.search}
        params={params}
        onParamsChange={onParamsChange}
        onCreateHotel={() => setCreateOpen(true)}
      />

      <HotelsResults
        hotels={hotels}
        totalRecords={totalRecords}
        totalPages={totalPages}
        params={params}
        isLoading={isLoading}
        hasFilters={hasFilters}
        onParamsChange={onParamsChange}
        onCreateHotel={() => setCreateOpen(true)}
        onDeleteHotel={setDeleteTarget}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Eliminar hotel</DialogTitle>
            <DialogDescription className="text-slate-400">
              Confirmas que deseas eliminar{" "}
              <span className="font-semibold text-slate-200">
                {deleteTarget?.name}
              </span>
              ? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
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

      <CreateHotelDialog
        open={createOpen}
        isSubmitting={isSubmitting}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateHotel}
      />
    </div>
  );
}
