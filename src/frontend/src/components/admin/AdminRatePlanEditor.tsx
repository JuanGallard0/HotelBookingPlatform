"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Tag, Trash2 } from "lucide-react";
import type { RatePlanDetailsDto } from "@/src/lib/api/generated/api-client";
import { handleApiError } from "@/src/lib/api/handle-error";
import { toast } from "sonner";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { AdminDateField } from "@/src/components/admin/AdminDateField";
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

function toDate(value?: Date | string | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateInputValue(value?: Date | string | null) {
  const date = toDate(value);
  return date ? formatDateOnly(date) : "";
}

function formatMonthYear(value?: Date | string | null) {
  const date = toDate(value);
  if (!date) return "";
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toRatePlanFormState(ratePlan: RatePlanDetailsDto): RatePlanFormState {
  return {
    name: ratePlan.name ?? "",
    description: ratePlan.description ?? "",
    validFrom: toDateInputValue(ratePlan.validFrom),
    validTo: toDateInputValue(ratePlan.validTo),
    pricePerNight: String(ratePlan.pricePerNight ?? 0),
    discountPercentage:
      ratePlan.discountPercentage === undefined ||
      ratePlan.discountPercentage === null
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
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [form, setForm] = useState(() => toRatePlanFormState(ratePlan));
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setForm(toRatePlanFormState(ratePlan));
  }, [ratePlan]);

  async function saveRatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("save");
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
      toast.success("Tarifa actualizada.");
    } catch (saveError) {
      handleApiError(saveError, "No se pudo actualizar el plan tarifario.");
    } finally {
      setBusy(null);
    }
  }

  async function removeRatePlan() {
    setConfirmDeleteOpen(false);
    setBusy("delete");
    try {
      await onDelete(ratePlan.ratePlanId ?? 0);
      toast.success("Tarifa eliminada.");
    } catch (deleteError) {
      handleApiError(deleteError, "No se pudo eliminar el plan tarifario.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-white/8 border-l-2 border-l-emerald-500/40 bg-emerald-500/5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          />
          <Tag className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">
              {ratePlan.name}
            </p>
            <p className="text-xs text-slate-400">
              ${ratePlan.pricePerNight}/noche
              {ratePlan.discountPercentage
                ? ` · ${ratePlan.discountPercentage}% dto.`
                : ""}
              {ratePlan.validFrom && ratePlan.validTo
                ? ` · ${formatMonthYear(ratePlan.validFrom)} – ${formatMonthYear(ratePlan.validTo)}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {ratePlan.discountPercentage ? (
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-400">
              -{ratePlan.discountPercentage}%
            </span>
          ) : null}
          <Badge
            variant={ratePlan.isActive ? "secondary" : "outline"}
            className="text-xs"
          >
            {ratePlan.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </button>

      {open && (
        <form
          className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-2"
          onSubmit={saveRatePlan}
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Nombre</label>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Precio por noche
            </label>
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
            />
          </div>
          <AdminDateField
            label="Valido desde"
            value={form.validFrom}
            onChange={(value) =>
              setForm((current) => ({ ...current, validFrom: value }))
            }
          />
          <div className="space-y-1.5">
            <AdminDateField
              label="Valido hasta"
              value={form.validTo}
              onChange={(value) =>
                setForm((current) => ({ ...current, validTo: value }))
              }
            />
            {form.validFrom && form.validTo && form.validFrom > form.validTo && (
              <p className="text-xs text-red-400">
                La fecha de fin debe ser posterior al inicio
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Descuento %
            </label>
            <Input
              value={form.discountPercentage}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discountPercentage: event.target.value,
                }))
              }
            />
          </div>
          <label className="self-end pb-1 text-sm text-slate-300 flex items-center gap-2">
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
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-slate-300">
              Descripcion
            </label>
            <textarea
              className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex gap-3 md:col-span-2">
            <Button disabled={busy === "save"} type="submit" size="sm">
              {busy === "save" ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button
              disabled={busy === "delete"}
              onClick={() => setConfirmDeleteOpen(true)}
              type="button"
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </Button>
          </div>
        </form>
      )}

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="dark border-white/10 bg-slate-900 text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Eliminar tarifa</DialogTitle>
            <DialogDescription className="text-slate-400">
              Confirmas que deseas eliminar{" "}
              <span className="font-semibold text-slate-200">{ratePlan.name}</span>
              ? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={busy === "delete"}
              className="border-white/15 text-slate-100 hover:text-slate-100"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={removeRatePlan}
              disabled={busy === "delete"}
            >
              {busy === "delete" ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
