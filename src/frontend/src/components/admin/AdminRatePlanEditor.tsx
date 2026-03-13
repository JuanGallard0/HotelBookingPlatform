"use client";

import { useEffect, useState } from "react";
import type { RatePlanDetailsDto } from "@/src/lib/api/generated/api-client";
import { toAdminErrorMessage } from "@/src/lib/api/admin-hotels";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

type RatePlanFormState = {
  name: string;
  description: string;
  validFrom: string;
  validTo: string;
  pricePerNight: string;
  discountPercentage: string;
  isActive: boolean;
};

function formatDateOnly(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toRatePlanFormState(ratePlan: RatePlanDetailsDto): RatePlanFormState {
  return {
    name: ratePlan.name ?? "",
    description: ratePlan.description ?? "",
    validFrom: ratePlan.validFrom
      ? formatDateOnly(parseDateOnly(String(ratePlan.validFrom)))
      : "",
    validTo: ratePlan.validTo
      ? formatDateOnly(parseDateOnly(String(ratePlan.validTo)))
      : "",
    pricePerNight: String(ratePlan.pricePerNight ?? 0),
    discountPercentage:
      ratePlan.discountPercentage === undefined || ratePlan.discountPercentage === null
        ? ""
        : String(ratePlan.discountPercentage),
    isActive: Boolean(ratePlan.isActive),
  };
}

export function AdminRatePlanEditor({
  ratePlan,
  onSave,
  onDelete,
}: {
  ratePlan: RatePlanDetailsDto;
  onSave: (
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
  onDelete: (ratePlanId: number) => Promise<void>;
}) {
  const [form, setForm] = useState(() => toRatePlanFormState(ratePlan));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setForm(toRatePlanFormState(ratePlan));
  }, [ratePlan]);

  async function saveRatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("save");
    setError(null);

    try {
      await onSave(ratePlan.ratePlanId ?? 0, {
        name: form.name,
        description: form.description,
        validFrom: parseDateOnly(form.validFrom),
        validTo: parseDateOnly(form.validTo),
        pricePerNight: Number(form.pricePerNight),
        discountPercentage: form.discountPercentage
          ? Number(form.discountPercentage)
          : undefined,
        isActive: form.isActive,
      });
    } catch (saveError) {
      setError(toAdminErrorMessage(saveError, "No se pudo actualizar el rate plan."));
    } finally {
      setBusy(null);
    }
  }

  async function removeRatePlan() {
    if (!window.confirm(`Eliminar ${ratePlan.name}?`)) {
      return;
    }

    setBusy("delete");
    setError(null);

    try {
      await onDelete(ratePlan.ratePlanId ?? 0);
    } catch (deleteError) {
      setError(toAdminErrorMessage(deleteError, "No se pudo eliminar el rate plan."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <form
      className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2"
      onSubmit={saveRatePlan}
    >
      <Input
        value={form.name}
        onChange={(event) =>
          setForm((current) => ({ ...current, name: event.target.value }))
        }
        placeholder="Nombre"
      />
      <Input
        type="number"
        min={0}
        step="0.01"
        value={form.pricePerNight}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            pricePerNight: event.target.value,
          }))
        }
        placeholder="Precio"
      />
      <Input
        type="date"
        value={form.validFrom}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            validFrom: event.target.value,
          }))
        }
      />
      <Input
        type="date"
        value={form.validTo}
        onChange={(event) =>
          setForm((current) => ({ ...current, validTo: event.target.value }))
        }
      />
      <Input
        value={form.discountPercentage}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            discountPercentage: event.target.value,
          }))
        }
        placeholder="Descuento %"
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
        className="min-h-20 rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:col-span-2"
        value={form.description}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            description: event.target.value,
          }))
        }
        placeholder="Descripcion"
      />
      {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
      <div className="flex gap-3 md:col-span-2">
        <Button disabled={busy === "save"} type="submit">
          {busy === "save" ? "Guardando..." : "Guardar"}
        </Button>
        <Button
          disabled={busy === "delete"}
          onClick={removeRatePlan}
          type="button"
          variant="destructive"
        >
          Eliminar
        </Button>
      </div>
    </form>
  );
}
