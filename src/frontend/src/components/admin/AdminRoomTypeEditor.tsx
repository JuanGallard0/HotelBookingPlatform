"use client";

import { useEffect, useState } from "react";
import { BedDouble, ChevronDown, Plus, Trash2 } from "lucide-react";
import type {
  RatePlanDetailsDto,
  RoomTypeDetailsDto,
} from "@/src/lib/api/generated/api-client";
import { toAdminErrorMessage } from "@/src/lib/api/admin-hotels";
import { AdminRatePlanEditor } from "@/src/components/admin/AdminRatePlanEditor";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

type RoomTypeFormState = {
  name: string;
  description: string;
  maxOccupancy: string;
  basePrice: string;
  isActive: boolean;
};

type RatePlanFormState = {
  name: string;
  description: string;
  validFrom: string;
  validTo: string;
  pricePerNight: string;
  discountPercentage: string;
  isActive: boolean;
};

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toRoomTypeFormState(roomType: RoomTypeDetailsDto): RoomTypeFormState {
  return {
    name: roomType.name ?? "",
    description: roomType.description ?? "",
    maxOccupancy: String(roomType.maxOccupancy ?? 1),
    basePrice: String(roomType.basePrice ?? 0),
    isActive: Boolean(roomType.isActive),
  };
}

function emptyRatePlanForm(initialDate: string): RatePlanFormState {
  return {
    name: "",
    description: "",
    validFrom: initialDate,
    validTo: initialDate,
    pricePerNight: "100",
    discountPercentage: "",
    isActive: true,
  };
}

export function AdminRoomTypeEditor({
  roomType,
  monthStart,
  onSave,
  onDelete,
  onCreateRatePlan,
  onUpdateRatePlan,
  onDeleteRatePlan,
}: {
  roomType: RoomTypeDetailsDto;
  monthStart: string;
  onSave: (
    payload: {
      name: string;
      description: string;
      maxOccupancy: number;
      basePrice: number;
      isActive: boolean;
    },
  ) => Promise<void>;
  onDelete: () => Promise<void>;
  onCreateRatePlan: (
    payload: {
      name: string;
      description: string;
      validFrom: Date;
      validTo: Date;
      pricePerNight: number;
      discountPercentage?: number;
      isActive: boolean;
    },
  ) => Promise<void>;
  onUpdateRatePlan: (
    ratePlanId: number,
    payload: {
      name: string;
      description: string;
      validFrom: Date;
      validTo: Date;
      pricePerNight: number;
      discountPercentage?: number;
      isActive: boolean;
    },
  ) => Promise<void>;
  onDeleteRatePlan: (ratePlanId: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [addRatePlanOpen, setAddRatePlanOpen] = useState(false);
  const [form, setForm] = useState(() => toRoomTypeFormState(roomType));
  const [newRatePlanForm, setNewRatePlanForm] = useState(() =>
    emptyRatePlanForm(monthStart),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setForm(toRoomTypeFormState(roomType));
  }, [roomType]);

  async function saveRoomType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("save-room-type");
    setError(null);

    try {
      await onSave({
        name: form.name,
        description: form.description,
        maxOccupancy: Number(form.maxOccupancy),
        basePrice: Number(form.basePrice),
        isActive: form.isActive,
      });
    } catch (saveError) {
      setError(toAdminErrorMessage(saveError, "No se pudo actualizar el room type."));
    } finally {
      setBusy(null);
    }
  }

  async function removeRoomType() {
    if (!window.confirm(`Eliminar ${roomType.name}?`)) {
      return;
    }

    setBusy("delete-room-type");
    setError(null);

    try {
      await onDelete();
    } catch (deleteError) {
      setError(toAdminErrorMessage(deleteError, "No se pudo eliminar el room type."));
    } finally {
      setBusy(null);
    }
  }

  async function createRatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create-rate-plan");
    setError(null);

    try {
      await onCreateRatePlan({
        name: newRatePlanForm.name,
        description: newRatePlanForm.description,
        validFrom: parseDateOnly(newRatePlanForm.validFrom),
        validTo: parseDateOnly(newRatePlanForm.validTo),
        pricePerNight: Number(newRatePlanForm.pricePerNight),
        discountPercentage: newRatePlanForm.discountPercentage
          ? Number(newRatePlanForm.discountPercentage)
          : undefined,
        isActive: newRatePlanForm.isActive,
      });
      setNewRatePlanForm(emptyRatePlanForm(monthStart));
      setAddRatePlanOpen(false);
    } catch (createError) {
      setError(toAdminErrorMessage(createError, "No se pudo crear el rate plan."));
    } finally {
      setBusy(null);
    }
  }

  const ratePlanCount = roomType.ratePlans?.length ?? 0;

  return (
    <Card className="border-l-2 border-l-sky-500/50 border-white/10 bg-white/5 text-slate-100">
      {/* Clickable header row */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          />
          <BedDouble className="h-4 w-4 shrink-0 text-sky-400" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">{roomType.name}</p>
            <p className="text-xs text-slate-400">
              {ratePlanCount} tarifa{ratePlanCount !== 1 ? "s" : ""} · máx. {roomType.maxOccupancy} huéspedes
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={roomType.isActive ? "secondary" : "outline"} className="text-xs">
            {roomType.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </button>

      {open && (
      <CardContent className="space-y-6 border-t border-white/10 pt-6">
        <div className="flex justify-end mb-2">
          <Button onClick={removeRoomType} type="button" variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
            Eliminar room type
          </Button>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveRoomType}>
          <Input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Nombre"
          />
          <Input
            type="number"
            min={1}
            value={form.maxOccupancy}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                maxOccupancy: event.target.value,
              }))
            }
            placeholder="Max ocupacion"
          />
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.basePrice}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                basePrice: event.target.value,
              }))
            }
            placeholder="Base price"
          />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
              type="checkbox"
            />
            Activo
          </label>
          <textarea
            className="min-h-24 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:col-span-2"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Descripcion"
          />
          <div className="md:col-span-2">
            <Button disabled={busy === "save-room-type"} type="submit">
              {busy === "save-room-type" ? "Guardando..." : "Guardar tipo de habitación"}
            </Button>
          </div>
        </form>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="space-y-3 border-l-2 border-l-emerald-500/30 pl-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/70">
            Tarifas
          </p>

          {(roomType.ratePlans ?? []).map((ratePlan: RatePlanDetailsDto) => (
            <AdminRatePlanEditor
              key={ratePlan.ratePlanId}
              ratePlan={ratePlan}
              onDelete={onDeleteRatePlan}
              onSave={onUpdateRatePlan}
            />
          ))}

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setAddRatePlanOpen(true)}
            className="border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar tarifa
          </Button>

          <Dialog open={addRatePlanOpen} onOpenChange={setAddRatePlanOpen}>
            <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Agregar tarifa</DialogTitle>
              </DialogHeader>
              <form id="add-rate-plan-form" className="grid gap-3 sm:grid-cols-2" onSubmit={createRatePlan}>
                <Input value={newRatePlanForm.name} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, name: e.target.value }))} placeholder="Nombre" />
                <Input type="number" min={0} step="0.01" value={newRatePlanForm.pricePerNight} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, pricePerNight: e.target.value }))} placeholder="Precio por noche" />
                <Input type="date" value={newRatePlanForm.validFrom} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, validFrom: e.target.value }))} />
                <Input type="date" value={newRatePlanForm.validTo} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, validTo: e.target.value }))} />
                <Input value={newRatePlanForm.discountPercentage} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, discountPercentage: e.target.value }))} placeholder="Descuento %" />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input checked={newRatePlanForm.isActive} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, isActive: e.target.checked }))} type="checkbox" />
                  Activo
                </label>
                <textarea className="min-h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:col-span-2" value={newRatePlanForm.description} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, description: e.target.value }))} placeholder="Descripcion" />
              </form>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setAddRatePlanOpen(false)}>
                  Cancelar
                </Button>
                <Button form="add-rate-plan-form" type="submit" disabled={busy === "create-rate-plan"}>
                  {busy === "create-rate-plan" ? "Creando..." : "Agregar tarifa"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      )}
    </Card>
  );
}
