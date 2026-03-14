"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Hotel as HotelIcon,
  Layers3,
  Plus,
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
import { AdminRoomTypeEditor } from "@/src/components/admin/AdminRoomTypeEditor";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
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

function defaultSingleDayInventoryForm(
  hotel: HotelDetailsDto,
  inventory: HotelInventoryDto,
): SingleDayInventoryFormState {
  const firstRoomType = hotel.roomTypes?.[0];
  const firstDate = inventory.from
    ? formatDateOnly(parseDateOnly(String(inventory.from)))
    : formatDateOnly(new Date());

  return {
    roomTypeId: String(firstRoomType?.roomTypeId ?? ""),
    date: firstDate,
    totalRooms: "0",
    availableRooms: "0",
    rowVersion: "",
  };
}

function defaultBulkInventoryForm(
  hotel: HotelDetailsDto,
  inventory: HotelInventoryDto,
): BulkInventoryFormState {
  const firstRoomType = hotel.roomTypes?.[0];
  const from = inventory.from
    ? formatDateOnly(parseDateOnly(String(inventory.from)))
    : formatDateOnly(new Date());
  const to = inventory.to
    ? formatDateOnly(parseDateOnly(String(inventory.to)))
    : from;

  return {
    roomTypeId: String(firstRoomType?.roomTypeId ?? ""),
    from,
    to,
    totalRooms: "0",
    availableRooms: "0",
  };
}

export function AdminHotelManager({
  initialHotel,
  initialInventory,
}: {
  initialHotel: HotelDetailsDto;
  initialInventory: HotelInventoryDto;
}) {
  const router = useRouter();
  const [hotel, setHotel] = useState(initialHotel);
  const [inventory, setInventory] = useState(initialInventory);
  const [hotelForm, setHotelForm] = useState(() => toHotelFormState(initialHotel));
  const [newRoomTypeForm, setNewRoomTypeForm] = useState<RoomTypeFormState>(
    emptyRoomTypeForm(),
  );
  const [singleDayForm, setSingleDayForm] = useState(() =>
    defaultSingleDayInventoryForm(initialHotel, initialInventory),
  );
  const [bulkForm, setBulkForm] = useState(() =>
    defaultBulkInventoryForm(initialHotel, initialInventory),
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [createRoomTypeOpen, setCreateRoomTypeOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const monthDays = useMemo(
    () => buildMonthDays(String(inventory.from), String(inventory.to)),
    [inventory.from, inventory.to],
  );

  const inventoryIndex = useMemo(() => {
    const next = new Map<number, Map<string, InventoryDayDto>>();

    for (const roomType of inventory.roomTypes ?? []) {
      const daysMap = new Map<string, InventoryDayDto>();
      for (const day of roomType.days ?? []) {
        daysMap.set(formatDateOnly(parseDateOnly(String(day.date))), day);
      }
      next.set(roomType.roomTypeId ?? 0, daysMap);
    }

    return next;
  }, [inventory.roomTypes]);

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
    return nextInventory;
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
    }, "Room type creado.");
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

  async function handleSingleDayInventorySubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
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

  async function handleBulkInventorySubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
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
    const nextMonth = shiftMonth(firstDayOfMonth(String(inventory.from)), offset);

    await runMutation("inventory-month", async () => {
      await refreshInventoryForMonth(formatDateOnly(nextMonth));
    }, "Calendario actualizado.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              <HotelIcon className="h-3.5 w-3.5" />
              Hotel Manager
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-100">
              {hotel.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Gestiona la configuracion general, room types, rate plans e inventario
              desde un solo modulo.
            </p>
          </div>
          <Badge variant={hotel.isActive ? "secondary" : "outline"}>
            {hotel.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="configuration" className="gap-5">
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
                  {busyKey === "hotel-save" ? "Guardando..." : "Guardar hotel"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-300">Room types</p>
            <Button size="sm" onClick={() => setCreateRoomTypeOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear room type
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
                <DialogTitle className="text-slate-100">Crear room type</DialogTitle>
              </DialogHeader>
              <form id="create-room-type-form" className="grid gap-3 sm:grid-cols-2" onSubmit={handleCreateRoomType}>
                <Input placeholder="Nombre" value={newRoomTypeForm.name} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, name: e.target.value }))} />
                <Input placeholder="Max ocupacion" type="number" min={1} value={newRoomTypeForm.maxOccupancy} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, maxOccupancy: e.target.value }))} />
                <Input placeholder="Precio base" type="number" min={0} step="0.01" value={newRoomTypeForm.basePrice} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, basePrice: e.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input checked={newRoomTypeForm.isActive} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, isActive: e.target.checked }))} type="checkbox" />
                  Activo
                </label>
                <textarea className="min-h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:col-span-2" placeholder="Descripcion" value={newRoomTypeForm.description} onChange={(e) => setNewRoomTypeForm((c) => ({ ...c, description: e.target.value }))} />
              </form>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setCreateRoomTypeOpen(false)}>
                  Cancelar
                </Button>
                <Button form="create-room-type-form" type="submit" disabled={busyKey === "room-type-create"}>
                  {busyKey === "room-type-create" ? "Creando..." : "Crear room type"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-4">
            {(hotel.roomTypes ?? []).map((roomType) => (
              <AdminRoomTypeEditor
                key={roomType.roomTypeId}
                monthStart={String(inventory.from)}
                roomType={roomType}
                onCreateRatePlan={async (payload) => {
                  const { createAdminRatePlan } = await import("@/src/lib/api/admin-hotels");
                  await createAdminRatePlan(roomType.roomTypeId ?? 0, payload);
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
                  await updateAdminRatePlan(ratePlanId, payload);
                  await refreshHotelDetails();
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-slate-100">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Calendario mensual</CardTitle>
                <p className="text-sm text-slate-400">
                  Haz clic en una celda para precargar la edicion diaria.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm" onClick={() => void handleShiftMonth(-1)} type="button">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-44 text-center text-sm font-medium capitalize text-slate-200">
                  {toMonthLabel(String(inventory.from))}
                </div>
                <Button variant="outline" size="icon-sm" onClick={() => void handleShiftMonth(1)} type="button">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room type</TableHead>
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
                        return (
                          <TableCell key={`${roomType.roomTypeId}-${date}`} className="p-1">
                            <button className="w-full rounded-lg border border-white/10 px-2 py-2 text-center text-xs transition hover:border-white/20 hover:bg-white/5" onClick={() => void handleSelectInventoryDay(roomType.roomTypeId ?? 0, date)} type="button">
                              <div className="font-semibold text-slate-100">
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
                  <select className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-slate-100 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" value={singleDayForm.roomTypeId} onChange={(event) => setSingleDayForm((current) => ({ ...current, roomTypeId: event.target.value }))}>
                    {(hotel.roomTypes ?? []).map((roomType) => (
                      <option key={roomType.roomTypeId} value={roomType.roomTypeId ?? 0}>
                        {roomType.name}
                      </option>
                    ))}
                  </select>
                  <Input type="date" value={singleDayForm.date} onChange={(event) => setSingleDayForm((current) => ({ ...current, date: event.target.value }))} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input type="number" min={0} value={singleDayForm.totalRooms} onChange={(event) => setSingleDayForm((current) => ({ ...current, totalRooms: event.target.value }))} placeholder="Total rooms" />
                    <Input type="number" min={0} value={singleDayForm.availableRooms} onChange={(event) => setSingleDayForm((current) => ({ ...current, availableRooms: event.target.value }))} placeholder="Available rooms" />
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
                  <select className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-slate-100 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" value={bulkForm.roomTypeId} onChange={(event) => setBulkForm((current) => ({ ...current, roomTypeId: event.target.value }))}>
                    {(hotel.roomTypes ?? []).map((roomType) => (
                      <option key={roomType.roomTypeId} value={roomType.roomTypeId ?? 0}>
                        {roomType.name}
                      </option>
                    ))}
                  </select>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input type="date" value={bulkForm.from} onChange={(event) => setBulkForm((current) => ({ ...current, from: event.target.value }))} />
                    <Input type="date" value={bulkForm.to} onChange={(event) => setBulkForm((current) => ({ ...current, to: event.target.value }))} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input type="number" min={0} value={bulkForm.totalRooms} onChange={(event) => setBulkForm((current) => ({ ...current, totalRooms: event.target.value }))} placeholder="Total rooms" />
                    <Input type="number" min={0} value={bulkForm.availableRooms} onChange={(event) => setBulkForm((current) => ({ ...current, availableRooms: event.target.value }))} placeholder="Available rooms" />
                  </div>
                  <Button disabled={busyKey === "inventory-bulk"} type="submit">
                    {busyKey === "inventory-bulk" ? "Aplicando..." : "Aplicar rango"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
