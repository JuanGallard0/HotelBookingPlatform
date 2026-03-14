"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Tag, Trash2 } from "lucide-react";
import type { RatePlanDetailsDto } from "@/src/lib/api/generated/api-client";
import { handleApiError } from "@/src/lib/api/handle-error";
import { toast } from "sonner";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
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
      handleApiError(saveError, "No se pudo actualizar el rate plan.");
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
      handleApiError(deleteError, "No se pudo eliminar el rate plan.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-white/8 border-l-2 border-l-emerald-500/40 bg-emerald-500/5">
      {/* Clickable header row */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          />
          <Tag className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{ratePlan.name}</p>
            <p className="text-xs text-slate-400">
              ${ratePlan.pricePerNight}/noche
              {ratePlan.discountPercentage ? ` · ${ratePlan.discountPercentage}% dto.` : ""}
            </p>
          </div>
        </div>
        <Badge variant={ratePlan.isActive ? "secondary" : "outline"} className="text-xs shrink-0">
          {ratePlan.isActive ? "Activo" : "Inactivo"}
        </Badge>
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
            <label className="text-sm font-medium text-slate-300">Precio por noche</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.pricePerNight}
              onChange={(event) =>
                setForm((current) => ({ ...current, pricePerNight: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Válido desde</label>
            <Input
              type="date"
              value={form.validFrom}
              onChange={(event) =>
                setForm((current) => ({ ...current, validFrom: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Válido hasta</label>
            <Input
              type="date"
              value={form.validTo}
              onChange={(event) =>
                setForm((current) => ({ ...current, validTo: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Descuento %</label>
            <Input
              value={form.discountPercentage}
              onChange={(event) =>
                setForm((current) => ({ ...current, discountPercentage: event.target.value }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 self-end pb-1">
            <input
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
              type="checkbox"
            />
            Activo
          </label>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Descripción</label>
            <textarea
              className="w-full min-h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
          <div className="flex gap-3 md:col-span-2">
            <Button disabled={busy === "save"} type="submit" size="sm">
              {busy === "save" ? "Guardando..." : "Guardar"}
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
              ¿Confirmas que deseas eliminar{" "}
              <span className="font-semibold text-slate-200">{ratePlan.name}</span>?
              Esta acción no se puede deshacer.
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
