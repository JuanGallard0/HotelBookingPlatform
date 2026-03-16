"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { BedDouble, ChevronDown, Plus, Trash2 } from "lucide-react";
import type {
  RatePlanDetailsDto,
  RoomTypeDetailsDto,
} from "@/src/lib/api/generated/api-client";
import { handleApiError } from "@/src/lib/api/handle-error";
import { toast } from "sonner";
import { AdminDateField } from "@/src/components/admin/AdminDateField";
import { AdminRatePlanEditor } from "@/src/components/admin/AdminRatePlanEditor";
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [form, setForm] = useState(() => toRoomTypeFormState(roomType));
  const [newRatePlanForm, setNewRatePlanForm] = useState(() =>
    emptyRatePlanForm(monthStart),
  );
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setForm(toRoomTypeFormState(roomType));
  }, [roomType]);

  async function saveRoomType(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("save-room-type");
    try {
      await onSave({
        name: form.name,
        description: form.description,
        maxOccupancy: Number(form.maxOccupancy),
        basePrice: Number(form.basePrice),
        isActive: form.isActive,
      });
      toast.success("Tipo de habitación actualizado.");
    } catch (saveError) {
      handleApiError(saveError, "No se pudo actualizar el tipo de habitacion.");
    } finally {
      setBusy(null);
    }
  }

  async function removeRoomType() {
    setConfirmDeleteOpen(false);
    setBusy("delete-room-type");
    try {
      await onDelete();
      toast.success("Tipo de habitación eliminado.");
    } catch (deleteError) {
      handleApiError(deleteError, "No se pudo eliminar el tipo de habitacion.");
    } finally {
      setBusy(null);
    }
  }

  async function createRatePlan(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create-rate-plan");
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
      toast.success("Tarifa creada.");
      setNewRatePlanForm(emptyRatePlanForm(monthStart));
      setAddRatePlanOpen(false);
    } catch (createError) {
      handleApiError(createError, "No se pudo crear el rate plan.");
    } finally {
      setBusy(null);
    }
  }

  const ratePlanCount = roomType.ratePlans?.length ?? 0;

  return (
    <Card className="border-l-2 border-l-sky-500/50 border-white/10 bg-white/5 text-slate-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          />
          <BedDouble className="h-3.5 w-3.5 shrink-0 text-sky-400" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">{roomType.name}</p>
            <p className="text-[11px] text-slate-400">
              {ratePlanCount} tarifa{ratePlanCount !== 1 ? "s" : ""} · máx. {roomType.maxOccupancy} huéspedes · ${roomType.basePrice}/noche base
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
          <Button onClick={() => setConfirmDeleteOpen(true)} type="button" variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
            Eliminar tipo de habitacion
          </Button>
        </div>

        <form className="space-y-4" onSubmit={saveRoomType}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Nombre</label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-300">
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
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Máx. ocupación</label>
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
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Precio base</label>
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
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Descripción</label>
            <textarea
              className="w-full min-h-24 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <Button disabled={busy === "save-room-type"} type="submit">
            {busy === "save-room-type" ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>


        <div className="space-y-3 border-l-2 border-l-emerald-500/30 pl-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/70">
            Tarifas ({ratePlanCount})
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
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Nombre</label>
                  <Input value={newRatePlanForm.name} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, name: e.target.value }))} placeholder="Nombre" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Precio por noche</label>
                  <Input type="number" min={0} step="0.01" value={newRatePlanForm.pricePerNight} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, pricePerNight: e.target.value }))} placeholder="Precio por noche" />
                </div>
                <AdminDateField
                  label="Valido desde"
                  value={newRatePlanForm.validFrom}
                  onChange={(value) =>
                    setNewRatePlanForm((c) => ({ ...c, validFrom: value }))
                  }
                />
                <AdminDateField
                  label="Valido hasta"
                  value={newRatePlanForm.validTo}
                  onChange={(value) =>
                    setNewRatePlanForm((c) => ({ ...c, validTo: value }))
                  }
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Descuento %</label>
                  <Input value={newRatePlanForm.discountPercentage} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, discountPercentage: e.target.value }))} placeholder="Descuento %" />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input checked={newRatePlanForm.isActive} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, isActive: e.target.checked }))} type="checkbox" />
                  Activo
                </label>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Descripcion</label>
                  <textarea className="min-h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:col-span-2" value={newRatePlanForm.description} onChange={(e) => setNewRatePlanForm((c) => ({ ...c, description: e.target.value }))} placeholder="Descripcion" />
                </div>
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

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Eliminar tipo de habitación</DialogTitle>
            <DialogDescription className="text-slate-400">
              ¿Confirmas que deseas eliminar{" "}
              <span className="font-semibold text-slate-200">{roomType.name}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={busy === "delete-room-type"}
              className="border-white/15 text-slate-100 hover:text-slate-100"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={removeRoomType}
              disabled={busy === "delete-room-type"}
            >
              {busy === "delete-room-type" ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
