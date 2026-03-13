"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type {
  RatePlanDetailsDto,
  RoomTypeDetailsDto,
} from "@/src/lib/api/generated/api-client";
import { toAdminErrorMessage } from "@/src/lib/api/admin-hotels";
import { AdminRatePlanEditor } from "@/src/components/admin/AdminRatePlanEditor";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

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
    } catch (createError) {
      setError(toAdminErrorMessage(createError, "No se pudo crear el rate plan."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{roomType.name}</CardTitle>
          <p className="text-sm text-slate-500">
            Room type #{roomType.roomTypeId}
          </p>
        </div>
        <Button onClick={removeRoomType} type="button" variant="destructive">
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <label className="flex items-center gap-2 text-sm text-slate-600">
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
              {busy === "save-room-type" ? "Guardando..." : "Guardar room type"}
            </Button>
          </div>
        </form>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Rate plans
            </h3>
            <p className="text-sm text-slate-500">
              Administra tarifas por temporada o condicion.
            </p>
          </div>

          {(roomType.ratePlans ?? []).map((ratePlan: RatePlanDetailsDto) => (
            <AdminRatePlanEditor
              key={ratePlan.ratePlanId}
              ratePlan={ratePlan}
              onDelete={onDeleteRatePlan}
              onSave={onUpdateRatePlan}
            />
          ))}

          <form
            className="grid gap-4 rounded-2xl border border-dashed border-slate-300 p-4 md:grid-cols-2"
            onSubmit={createRatePlan}
          >
            <Input
              value={newRatePlanForm.name}
              onChange={(event) =>
                setNewRatePlanForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Nuevo rate plan"
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              value={newRatePlanForm.pricePerNight}
              onChange={(event) =>
                setNewRatePlanForm((current) => ({
                  ...current,
                  pricePerNight: event.target.value,
                }))
              }
              placeholder="Precio por noche"
            />
            <Input
              type="date"
              value={newRatePlanForm.validFrom}
              onChange={(event) =>
                setNewRatePlanForm((current) => ({
                  ...current,
                  validFrom: event.target.value,
                }))
              }
            />
            <Input
              type="date"
              value={newRatePlanForm.validTo}
              onChange={(event) =>
                setNewRatePlanForm((current) => ({
                  ...current,
                  validTo: event.target.value,
                }))
              }
            />
            <Input
              value={newRatePlanForm.discountPercentage}
              onChange={(event) =>
                setNewRatePlanForm((current) => ({
                  ...current,
                  discountPercentage: event.target.value,
                }))
              }
              placeholder="Descuento %"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                checked={newRatePlanForm.isActive}
                onChange={(event) =>
                  setNewRatePlanForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Activo
            </label>
            <textarea
              className="min-h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:col-span-2"
              value={newRatePlanForm.description}
              onChange={(event) =>
                setNewRatePlanForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Descripcion"
            />
            <div className="md:col-span-2">
              <Button disabled={busy === "create-rate-plan"} type="submit">
                {busy === "create-rate-plan" ? "Creando..." : "Agregar rate plan"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
