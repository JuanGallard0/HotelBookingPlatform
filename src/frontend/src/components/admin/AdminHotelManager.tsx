"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import type {
  HotelDetailsDto,
  HotelInventoryDto,
  InventoryDayDto,
} from "@/src/lib/api/generated/api-client";
import {
  bulkUpdateAdminInventory,
  createAdminRoomType,
  deleteAdminHotel,
  deleteAdminRoomType,
  getAdminHotelDetails,
  getAdminHotelInventory,
  updateAdminHotel,
  upsertAdminInventory,
} from "@/src/lib/api/admin-hotels";
import { handleApiError } from "@/src/lib/api/handle-error";
import { toast } from "sonner";
import { AdminDateField } from "@/src/components/admin/AdminDateField";
import { AdminRoomTypeEditor } from "@/src/components/admin/AdminRoomTypeEditor";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

type HotelFormState = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phoneNumber: string;
  starRating: string;
  isActive: boolean;
};

type RoomTypeFormState = {
  name: string;
  description: string;
  maxOccupancy: string;
  basePrice: string;
  isActive: boolean;
};

type SingleDayInventoryFormState = {
  roomTypeId: string;
  date: string;
  totalRooms: string;
  availableRooms: string;
  rowVersion: string;
};

type BulkInventoryFormState = {
  roomTypeId: string;
  from: string;
  to: string;
  totalRooms: string;
  availableRooms: string;
};

function formatDateOnly(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function firstDayOfMonth(value: string) {
  const date = parseDateOnly(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function lastDayOfMonth(value: string) {
  const start = firstDayOfMonth(value);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
}

function shiftMonth(date: Date, offset: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

function toMonthLabel(value: string) {
  return parseDateOnly(value).toLocaleDateString("es-SV", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildMonthDays(from: string, to: string) {
  const dates: string[] = [];
  for (
    let current = parseDateOnly(from);
    current <= parseDateOnly(to);
    current = new Date(
      Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate() + 1),
    )
  ) {
    dates.push(formatDateOnly(current));
  }
  return dates;
}

function toHotelFormState(hotel: HotelDetailsDto): HotelFormState {
  return {
    name: hotel.name ?? "",
    description: hotel.description ?? "",
    address: hotel.address ?? "",
    city: hotel.city ?? "",
    country: hotel.country ?? "",
    email: hotel.email ?? "",
    phoneNumber: hotel.phoneNumber ?? "",
    starRating: String(hotel.starRating ?? 0),
    isActive: Boolean(hotel.isActive),
  };
}

function emptyRoomTypeForm(): RoomTypeFormState {
  return {
    name: "",
    description: "",
    maxOccupancy: "2",
    basePrice: "100",
    isActive: true,
  };
}

function currentMonthStart() {
  const now = new Date();
  return formatDateOnly(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
}

export function AdminHotelManager({
  initialHotel,
}: {
  initialHotel: HotelDetailsDto;
}) {
  const router = useRouter();
  const [hotel, setHotel] = useState(initialHotel);
  const [inventory, setInventory] = useState<HotelInventoryDto | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(currentMonthStart);
  const [hotelForm, setHotelForm] = useState(() => toHotelFormState(initialHotel));
  const [newRoomTypeForm, setNewRoomTypeForm] = useState<RoomTypeFormState>(emptyRoomTypeForm());
  const [singleDayForm, setSingleDayForm] = useState<SingleDayInventoryFormState>({
    roomTypeId: String(initialHotel.roomTypes?.[0]?.roomTypeId ?? ""),
    date: currentMonthStart(),
    totalRooms: "0",
    availableRooms: "0",
    rowVersion: "",
  });
  const [bulkForm, setBulkForm] = useState<BulkInventoryFormState>({
    roomTypeId: String(initialHotel.roomTypes?.[0]?.roomTypeId ?? ""),
    from: currentMonthStart(),
    to: currentMonthStart(),
    totalRooms: "0",
    availableRooms: "0",
  });
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [createRoomTypeOpen, setCreateRoomTypeOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const monthDays = useMemo(
    () => inventory
      ? buildMonthDays(String(inventory.from), String(inventory.to))
      : [],
    [inventory],
  );

  const inventoryIndex = useMemo(() => {
    const next = new Map<number, Map<string, InventoryDayDto>>();
    for (const roomType of inventory?.roomTypes ?? []) {
      const daysMap = new Map<string, InventoryDayDto>();
      for (const day of roomType.days ?? []) {
        daysMap.set(formatDateOnly(parseDateOnly(String(day.date))), day);
      }
      next.set(roomType.roomTypeId ?? 0, daysMap);
    }
    return next;
  }, [inventory]);

  useEffect(() => {
    setHotelForm(toHotelFormState(hotel));
  }, [hotel]);

  async function refreshHotelDetails() {
    const nextHotel = await getAdminHotelDetails(hotel.hotelId ?? 0);
    setHotel(nextHotel);
    return nextHotel;
  }

  async function refreshInventoryForMonth(monthFrom: string) {
    const nextInventory = await getAdminHotelInventory(
      hotel.hotelId ?? 0,
      firstDayOfMonth(monthFrom),
      lastDayOfMonth(monthFrom),
    );
    setInventory(nextInventory);
    setCurrentMonth(monthFrom);
    return nextInventory;
  }

  async function loadInventory() {
    setInventoryLoading(true);
    setInventoryError(false);
    try {
      await refreshInventoryForMonth(currentMonth);
    } catch (err) {
      setInventoryError(true);
      handleApiError(err, "No se pudo cargar el inventario.");
    } finally {
      setInventoryLoading(false);
    }
  }

  function handleTabChange(tab: string) {
    if (tab === "inventory" && inventory === null && !inventoryLoading) {
      void loadInventory();
    }
  }

  async function runMutation(
    key: string,
    action: () => Promise<void>,
    successMessage: string,
  ) {
    setBusyKey(key);
    try {
      await action();
      toast.success(successMessage);
    } catch (actionError) {
      handleApiError(actionError, "No se pudo completar la accion.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleHotelSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runMutation("hotel-save", async () => {
      await updateAdminHotel(hotel.hotelId ?? 0, {
        ...hotelForm,
        starRating: Number(hotelForm.starRating),
      });
      await refreshHotelDetails();
    }, "Hotel actualizado.");
  }

  async function handleHotelDelete() {
    setConfirmDeleteOpen(false);
    await runMutation("hotel-delete", async () => {
      await deleteAdminHotel(hotel.hotelId ?? 0);
      router.push("/admin/hotels");
      router.refresh();
    }, "Hotel eliminado.");
  }

  async function handleCreateRoomType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runMutation("room-type-create", async () => {
      await createAdminRoomType(hotel.hotelId ?? 0, {
        ...newRoomTypeForm,
        maxOccupancy: Number(newRoomTypeForm.maxOccupancy),
        basePrice: Number(newRoomTypeForm.basePrice),
      });
      await refreshHotelDetails();
      setNewRoomTypeForm(emptyRoomTypeForm());
      setCreateRoomTypeOpen(false);
    }, "Tipo de habitación creado.");
  }

  async function handleSelectInventoryDay(roomTypeId: number, date: string) {
    const day = inventoryIndex.get(roomTypeId)?.get(date);
    setSingleDayForm({
      roomTypeId: String(roomTypeId),
      date,
      totalRooms: String(day?.totalRooms ?? 0),
      availableRooms: String(day?.availableRooms ?? 0),
      rowVersion: day?.rowVersion ?? "",
    });
  }

  async function handleSingleDayInventorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runMutation("inventory-day", async () => {
      await upsertAdminInventory(
        Number(singleDayForm.roomTypeId),
        parseDateOnly(singleDayForm.date),
        {
          totalRooms: Number(singleDayForm.totalRooms),
          availableRooms: Number(singleDayForm.availableRooms),
          rowVersion: singleDayForm.rowVersion || undefined,
        },
      );
      await refreshInventoryForMonth(singleDayForm.date);
    }, "Inventario diario actualizado.");
  }

  async function handleBulkInventorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runMutation("inventory-bulk", async () => {
      await bulkUpdateAdminInventory(Number(bulkForm.roomTypeId), {
        from: parseDateOnly(bulkForm.from),
        to: parseDateOnly(bulkForm.to),
        totalRooms: Number(bulkForm.totalRooms),
        availableRooms: Number(bulkForm.availableRooms),
      });
      await refreshInventoryForMonth(bulkForm.from);
    }, "Inventario masivo actualizado.");
  }

  async function handleShiftMonth(offset: number) {
    const nextMonth = formatDateOnly(shiftMonth(firstDayOfMonth(currentMonth), offset));
    setInventoryLoading(true);
    try {
      await refreshInventoryForMonth(nextMonth);
    } catch (shiftError) {
      handleApiError(shiftError, "No se pudo cambiar el mes.");
    } finally {
      setInventoryLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{hotel.name}</h1>
          {(hotel.city || hotel.country) && (
            <p className="mt-1 text-sm text-slate-400">
              {[hotel.city, hotel.country].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <Badge variant={hotel.isActive ? "secondary" : "outline"}>
          {hotel.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      <Tabs defaultValue="configuration" onValueChange={handleTabChange} className="gap-5">
        <TabsList variant="line" className="rounded-none bg-transparent p-0">
          <TabsTrigger value="configuration" className="px-3">
            <Layers3 className="h-4 w-4" />
            Configuracion
          </TabsTrigger>
          <TabsTrigger value="inventory" className="px-3">
            <CalendarDays className="h-4 w-4" />
            Inventario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-slate-100">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Datos del hotel</CardTitle>
                <p className="text-sm text-slate-400">
                  Actualiza la informacion base del hotel.
                </p>
                <span className="mt-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Number(hotelForm.starRating) ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-600"}`}
                    />
                  ))}
                </span>
              </div>
              <Button
                variant="destructive"
                onClick={() => setConfirmDeleteOpen(true)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar hotel
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleHotelSave}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input value={hotelForm.name} onChange={(event) => setHotelForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre" />
                  <Input value={hotelForm.starRating} onChange={(event) => setHotelForm((current) => ({ ...current, starRating: event.target.value }))} placeholder="Categoria" type="number" min={1} max={5} />
                </div>
                <textarea className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" value={hotelForm.description} onChange={(event) => setHotelForm((current) => ({ ...current, description: event.target.value }))} placeholder="Descripcion" />
                <Input value={hotelForm.address} onChange={(event) => setHotelForm((current) => ({ ...current, address: event.target.value }))} placeholder="Direccion" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input value={hotelForm.city} onChange={(event) => setHotelForm((current) => ({ ...current, city: event.target.value }))} placeholder="Ciudad" />
                  <Input value={hotelForm.country} onChange={(event) => setHotelForm((current) => ({ ...current, country: event.target.value }))} placeholder="Pais" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input value={hotelForm.email} onChange={(event) => setHotelForm((current) => ({ ...current, email: event.target.value }))} placeholder="Correo" />
                  <Input value={hotelForm.phoneNumber} onChange={(event) => setHotelForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="Telefono" />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input checked={hotelForm.isActive} onChange={(event) => setHotelForm((current) => ({ ...current, isActive: event.target.checked }))} type="checkbox" />
                  Hotel activo
                </label>
                <Button disabled={busyKey === "hotel-save"} type="submit">
                  {busyKey === "hotel-save" ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-300">Tipos de habitación</p>
            <Button size="sm" onClick={() => setCreateRoomTypeOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear tipo de habitacion
            </Button>
          </div>

          <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Eliminar hotel</DialogTitle>
                <DialogDescription className="text-slate-400">
                  ¿Confirmas que deseas eliminar{" "}
                  <span className="font-semibold text-slate-200">{hotel.name}</span>?
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteOpen(false)}
                  disabled={busyKey === "hotel-delete"}
                  className="border-white/15 text-slate-100 hover:text-slate-100"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleHotelDelete}
                  disabled={busyKey === "hotel-delete"}
                >
                  {busyKey === "hotel-delete" ? "Eliminando..." : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createRoomTypeOpen} onOpenChange={setCreateRoomTypeOpen}>
            <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Crear tipo de habitacion</DialogTitle>
              </DialogHeader>
              <form id="create-room-type-form" className="grid gap-3 sm:grid-cols-2" onSubmit={handleCreateRoomType}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Nombre</label>
                  <Input placeholder="Nombre" value={newRoomTypeForm.name} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Maxima ocupacion</label>
                  <Input placeholder="Max ocupacion" type="number" min={1} value={newRoomTypeForm.maxOccupancy} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, maxOccupancy: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Precio base</label>
                  <Input placeholder="Precio base" type="number" min={0} step="0.01" value={newRoomTypeForm.basePrice} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, basePrice: e.target.value }))} />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input checked={newRoomTypeForm.isActive} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, isActive: e.target.checked }))} type="checkbox" />
                  Activo
                </label>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Descripcion</label>
                  <textarea className="min-h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:col-span-2" placeholder="Descripcion" value={newRoomTypeForm.description} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, description: e.target.value }))} />
                </div>
              </form>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setCreateRoomTypeOpen(false)}>
                  Cancelar
                </Button>
                <Button form="create-room-type-form" type="submit" disabled={busyKey === "room-type-create"}>
                  {busyKey === "room-type-create" ? "Creando..." : "Crear tipo de habitacion"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-4">
            {(hotel.roomTypes ?? []).map((roomType) => (
              <AdminRoomTypeEditor
                key={roomType.roomTypeId}
                monthStart={currentMonth}
                roomType={roomType}
                onCreateRatePlan={async (payload) => {
                  const { createAdminRatePlan } = await import("@/src/lib/api/admin-hotels");
                  await createAdminRatePlan(roomType.roomTypeId ?? 0, {
                    ...payload,
                    discountPercentage: payload.discountPercentage,
                  });
                  await refreshHotelDetails();
                }}
                onDelete={async () => {
                  await deleteAdminRoomType(roomType.roomTypeId ?? 0);
                  await refreshHotelDetails();
                }}
                onDeleteRatePlan={async (ratePlanId) => {
                  const { deleteAdminRatePlan } = await import("@/src/lib/api/admin-hotels");
                  await deleteAdminRatePlan(ratePlanId);
                  await refreshHotelDetails();
                }}
                onSave={async (payload) => {
                  const { updateAdminRoomType } = await import("@/src/lib/api/admin-hotels");
                  await updateAdminRoomType(roomType.roomTypeId ?? 0, payload);
                  await refreshHotelDetails();
                }}
                onUpdateRatePlan={async (ratePlanId, payload) => {
                  const { updateAdminRatePlan } = await import("@/src/lib/api/admin-hotels");
                  await updateAdminRatePlan(ratePlanId, {
                    ...payload,
                    discountPercentage: payload.discountPercentage,
                  });
                  await refreshHotelDetails();
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {/* Loading state */}
          {inventoryLoading && !inventory && (
            <div className="animate-pulse space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-40 rounded bg-white/10" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-white/10" />
                    <div className="h-8 w-44 rounded bg-white/10" />
                    <div className="h-8 w-8 rounded bg-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-10 rounded-lg bg-white/8" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {inventoryError && !inventory && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-400/20 bg-red-400/5 py-12 text-center">
              <p className="text-sm font-semibold text-red-300">No se pudo cargar el inventario</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadInventory()}
                className="border-white/15 text-slate-100 hover:text-slate-100"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}

          {/* Loaded state */}
          {inventory && (
            <>
              <Card className="border-white/10 bg-white/5 text-slate-100">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Calendario mensual</CardTitle>
                    <p className="text-sm text-slate-400">
                      Haz clic en una celda para precargar la edicion diaria.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon-sm" onClick={() => void handleShiftMonth(-1)} disabled={inventoryLoading} type="button">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-44 text-center text-sm font-medium capitalize text-slate-200">
                      {toMonthLabel(currentMonth)}
                    </div>
                    <Button variant="outline" size="icon-sm" onClick={() => void handleShiftMonth(1)} disabled={inventoryLoading} type="button">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className={inventoryLoading ? "pointer-events-none opacity-50 transition-opacity" : ""}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de habitacion</TableHead>
                        {monthDays.map((date) => (
                          <TableHead key={date} className="text-center">{date.slice(-2)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(hotel.roomTypes ?? []).map((roomType) => (
                        <TableRow key={roomType.roomTypeId}>
                          <TableCell className="font-medium">{roomType.name}</TableCell>
                          {monthDays.map((date) => {
                            const day = inventoryIndex.get(roomType.roomTypeId ?? 0)?.get(date);
                            const avail = day?.availableRooms ?? null;
                            const total = day?.totalRooms ?? 0;
                            const cellColor =
                              avail === null
                                ? ""
                                : avail === 0
                                  ? "bg-red-500/15"
                                  : avail < total / 2
                                    ? "bg-amber-500/10"
                                    : "";
                            const textColor = avail === 0 ? "text-red-400" : "text-slate-100";
                            return (
                              <TableCell key={`${roomType.roomTypeId}-${date}`} className="p-1">
                                <button
                                  className={`w-full rounded-lg border border-white/10 px-2 py-2 text-center text-xs transition hover:border-white/20 hover:bg-white/5 ${cellColor}`}
                                  onClick={() => void handleSelectInventoryDay(roomType.roomTypeId ?? 0, date)}
                                  type="button"
                                >
                                  <div className={`font-semibold ${textColor}`}>
                                    {day ? `${day.availableRooms}/${day.totalRooms}` : "--"}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {day ? `${day.reservedRooms} res.` : "sin dato"}
                                  </div>
                                </button>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-white/10 bg-white/5 text-slate-100">
                  <CardHeader>
                    <CardTitle>Edicion diaria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleSingleDayInventorySubmit}>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300">
                          Tipo de habitacion
                        </label>
                      <Select
                        value={singleDayForm.roomTypeId}
                        onValueChange={(value) => setSingleDayForm((current) => ({ ...current, roomTypeId: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tipo de habitación" />
                        </SelectTrigger>
                        <SelectContent>
                          {(hotel.roomTypes ?? []).map((roomType) => (
                            <SelectItem key={roomType.roomTypeId} value={String(roomType.roomTypeId ?? 0)}>
                              {roomType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                      <AdminDateField
                        label="Fecha"
                        value={singleDayForm.date}
                        onChange={(value) =>
                          setSingleDayForm((current) => ({ ...current, date: value }))
                        }
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-300">
                            Total de habitaciones
                          </label>
                        <Input type="number" min={0} value={singleDayForm.totalRooms} onChange={(event) => setSingleDayForm((current) => ({ ...current, totalRooms: event.target.value }))} placeholder="Total rooms" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-300">
                            Habitaciones disponibles
                          </label>
                        <Input type="number" min={0} value={singleDayForm.availableRooms} onChange={(event) => setSingleDayForm((current) => ({ ...current, availableRooms: event.target.value }))} placeholder="Available rooms" />
                        </div>
                      </div>
                      {singleDayForm.rowVersion ? (
                        <p className="text-xs text-slate-500">
                          La celda seleccionada incluye control de concurrencia.
                        </p>
                      ) : null}
                      <Button disabled={busyKey === "inventory-day"} type="submit">
                        {busyKey === "inventory-day" ? "Guardando..." : "Guardar dia"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 text-slate-100">
                  <CardHeader>
                    <CardTitle>Actualizacion masiva</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleBulkInventorySubmit}>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300">
                          Tipo de habitacion
                        </label>
                      <Select
                        value={bulkForm.roomTypeId}
                        onValueChange={(value) => setBulkForm((current) => ({ ...current, roomTypeId: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tipo de habitación" />
                        </SelectTrigger>
                        <SelectContent>
                          {(hotel.roomTypes ?? []).map((roomType) => (
                            <SelectItem key={roomType.roomTypeId} value={String(roomType.roomTypeId ?? 0)}>
                              {roomType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <AdminDateField
                          label="Desde"
                          value={bulkForm.from}
                          onChange={(value) =>
                            setBulkForm((current) => ({ ...current, from: value }))
                          }
                        />
                        <AdminDateField
                          label="Hasta"
                          value={bulkForm.to}
                          onChange={(value) =>
                            setBulkForm((current) => ({ ...current, to: value }))
                          }
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-300">
                            Total de habitaciones
                          </label>
                        <Input type="number" min={0} value={bulkForm.totalRooms} onChange={(event) => setBulkForm((current) => ({ ...current, totalRooms: event.target.value }))} placeholder="Total rooms" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-300">
                            Habitaciones disponibles
                          </label>
                        <Input type="number" min={0} value={bulkForm.availableRooms} onChange={(event) => setBulkForm((current) => ({ ...current, availableRooms: event.target.value }))} placeholder="Available rooms" />
                        </div>
                      </div>
                      <Button disabled={busyKey === "inventory-bulk"} type="submit">
                        {busyKey === "inventory-bulk" ? "Aplicando..." : "Aplicar rango"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
