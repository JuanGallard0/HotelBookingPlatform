"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  FileSearch,
  Funnel,
  RefreshCw,
  Search,
  TerminalSquare,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import {
  getAdminAuditLogs,
  toAdminAuditErrorMessage,
  type AdminAuditLogsQuery,
} from "@/src/lib/api/admin-audit-logs";
import { isAdminAccessError } from "@/src/lib/api/admin-hotels";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { AdminDateField } from "@/src/components/admin/AdminDateField";
import type { AuditLogDto } from "@/src/lib/api/generated/api-client";

type SortField = "Timestamp" | "EntityName" | "Action" | "UserName";
type SortDirection = "asc" | "desc";

type AdminLogsParams = {
  entityName: string;
  entityId: string;
  action: string;
  userId: string;
  userName: string;
  from: string;
  to: string;
  page: number;
  pageSize: number;
  sortBy: SortField;
  sortDirection: SortDirection;
};

const PAGE_SIZE_OPTIONS = ["10", "20", "50", "100"] as const;

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatTimestamp(value?: Date) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(value);
}

function readParams(searchParams: URLSearchParams): AdminLogsParams {
  const sortBy = (searchParams.get("sortBy") ?? "Timestamp") as SortField;
  const sortDirection = (searchParams.get("sortDirection") ??
    "desc") as SortDirection;
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const page = Number(searchParams.get("page") ?? "1");

  return {
    entityName: searchParams.get("entityName") ?? "",
    entityId: searchParams.get("entityId") ?? "",
    action: searchParams.get("action") ?? "",
    userId: searchParams.get("userId") ?? "",
    userName: searchParams.get("userName") ?? "",
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    sortBy,
    sortDirection,
  };
}

function buildQuery(params: AdminLogsParams): AdminAuditLogsQuery {
  return {
    entityName: params.entityName.trim() || undefined,
    entityId: params.entityId.trim() ? Number(params.entityId) : undefined,
    action: params.action.trim() || undefined,
    userId: params.userId.trim() || undefined,
    userName: params.userName.trim() || undefined,
    from: params.from ? parseDateOnly(params.from) : undefined,
    to: params.to ? parseDateOnly(params.to) : undefined,
    pageNumber: params.page,
    pageSize: params.pageSize,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
  };
}

function FiltersPanel({
  params,
  onSearch,
  onClear,
  disabled,
}: {
  params: AdminLogsParams;
  onSearch: (nextParams: AdminLogsParams) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const [form, setForm] = useState(params);

  useEffect(() => {
    setForm(params);
  }, [params]);

  return (
    <Card className="border-emerald-500/20 bg-[#071019] text-slate-100 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-base">
          <Funnel className="h-4 w-4 text-emerald-300" />
          Filtros de consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Entidad
            </label>
            <Input
              value={form.entityName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  entityName: event.target.value,
                }))
              }
              placeholder="Hotel, Booking, RoomType..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Id de entidad
            </label>
            <Input
              value={form.entityId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  entityId: event.target.value,
                }))
              }
              inputMode="numeric"
              placeholder="1024"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Accion</label>
            <Input
              value={form.action}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  action: event.target.value,
                }))
              }
              placeholder="Created, Updated, Deleted..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              User Id
            </label>
            <Input
              value={form.userId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  userId: event.target.value,
                }))
              }
              placeholder="GUID o id del usuario"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Usuario
            </label>
            <Input
              value={form.userName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  userName: event.target.value,
                }))
              }
              placeholder="Nombre o email"
            />
          </div>
          <AdminDateField
            label="Desde"
            value={form.from}
            onChange={(value) =>
              setForm((current) => ({ ...current, from: value }))
            }
          />
          <AdminDateField
            label="Hasta"
            value={form.to}
            onChange={(value) =>
              setForm((current) => ({ ...current, to: value }))
            }
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Ordenar por
            </label>
            <Select
              value={form.sortBy}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  sortBy: value as SortField,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Timestamp">Timestamp</SelectItem>
                <SelectItem value="EntityName">Entidad</SelectItem>
                <SelectItem value="Action">Accion</SelectItem>
                <SelectItem value="UserName">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Direccion
            </label>
            <Select
              value={form.sortDirection}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  sortDirection: value as SortDirection,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descendente</SelectItem>
                <SelectItem value="asc">Ascendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Tamano de pagina
            </label>
            <Select
              value={String(form.pageSize)}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  pageSize: Number(value),
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => onSearch({ ...form, page: 1 })}
            disabled={disabled}
            className="bg-emerald-400 text-slate-950 hover:bg-emerald-300"
          >
            <Search className="h-4 w-4" />
            Buscar logs
          </Button>
          <Button
            variant="outline"
            onClick={onClear}
            disabled={disabled}
            className="border-white/10 bg-transparent text-slate-100 hover:bg-white/10"
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LogRecord({ log }: { log: AuditLogDto }) {
  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-[#08131e] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
              {log.action}
            </Badge>
            <span className="text-sm font-semibold text-slate-100">
              {log.entityName} #{log.entityId}
            </span>
          </div>
          <div className="grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
            <p>Id log: {log.id}</p>
            <p>Usuario: {log.userName || log.userId || "Sistema"}</p>
            <p>Timestamp: {formatTimestamp(log.timestamp)}</p>
            <p>User Id: {log.userId || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-white/8 bg-slate-950/70 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Additional Info
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono text-xs text-slate-300">
            {log.additionalInfo || "Sin datos"}
          </pre>
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-950/70 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Old Values
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono text-xs text-slate-300">
            {log.oldValues || "Sin datos"}
          </pre>
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-950/70 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            New Values
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono text-xs text-slate-300">
            {log.newValues || "Sin datos"}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function AdminLogsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authReady, runWithAuth } = useAuth();

  const [logs, setLogs] = useState<AuditLogDto[] | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const paramsKey = searchParams.toString();
  const params = readParams(new URLSearchParams(paramsKey));

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;
    const currentParams = readParams(new URLSearchParams(paramsKey));

    async function loadLogs() {
      setLoading(true);
      setError(null);

      try {
        const result = await runWithAuth(() =>
          getAdminAuditLogs(buildQuery(currentParams)),
        );
        if (cancelled) return;

        setAccessDenied(false);
        setLogs(result.logs);
        setTotalRecords(result.totalRecords);
        setTotalPages(result.totalPages);
        setHasPreviousPage(result.hasPreviousPage);
        setHasNextPage(result.hasNextPage);
      } catch (loadError) {
        if (cancelled) return;

        if (isAdminAccessError(loadError)) {
          setAccessDenied(true);
          setLogs([]);
          return;
        }

        setError(
          toAdminAuditErrorMessage(
            loadError,
            "No se pudieron cargar los logs de auditoria.",
          ),
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      cancelled = true;
    };
  }, [authReady, fetchKey, paramsKey, runWithAuth]);

  function updateParams(nextParams: AdminLogsParams) {
    const next = new URLSearchParams();

    if (nextParams.entityName.trim())
      next.set("entityName", nextParams.entityName.trim());
    if (nextParams.entityId.trim())
      next.set("entityId", nextParams.entityId.trim());
    if (nextParams.action.trim()) next.set("action", nextParams.action.trim());
    if (nextParams.userId.trim()) next.set("userId", nextParams.userId.trim());
    if (nextParams.userName.trim())
      next.set("userName", nextParams.userName.trim());
    if (nextParams.from) next.set("from", nextParams.from);
    if (nextParams.to) next.set("to", nextParams.to);
    if (nextParams.page > 1) next.set("page", String(nextParams.page));
    if (nextParams.pageSize !== 20)
      next.set("pageSize", String(nextParams.pageSize));
    if (nextParams.sortBy !== "Timestamp")
      next.set("sortBy", nextParams.sortBy);
    if (nextParams.sortDirection !== "desc") {
      next.set("sortDirection", nextParams.sortDirection);
    }

    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearParams() {
    router.push(pathname, { scroll: false });
  }

  if (!authReady || logs === null) {
    return (
      <main className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-3xl border border-white/10 bg-[#071019] p-6">
            <div className="mb-4 h-5 w-48 rounded bg-white/10" />
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-12 rounded bg-white/8" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-emerald-500/20 bg-[linear-gradient(180deg,#071019,#050b12)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Badge className="rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
                Security console
              </Badge>
              <div>
                <h1 className="flex items-center gap-3 text-3xl font-semibold text-slate-100">
                  <TerminalSquare className="h-8 w-8 text-emerald-300" />
                  Audit logs
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Consulta eventos del sistema con filtros por entidad, accion,
                  usuario y rango de fechas.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  registros
                </p>
                <p className="text-lg font-semibold text-emerald-300">
                  {totalRecords}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setFetchKey((current) => current + 1)}
                className="border-white/10 bg-transparent text-slate-100 hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar
              </Button>
            </div>
          </div>
        </section>

        <FiltersPanel
          params={params}
          onSearch={updateParams}
          onClear={clearParams}
          disabled={loading}
        />

        {accessDenied ? (
          <Card className="border-amber-500/20 bg-amber-500/10 text-amber-100">
            <CardContent className="py-8">
              No tienes permisos para consultar los logs de auditoria.
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-500/20 bg-red-500/10 text-red-100">
            <CardContent className="py-8">{error}</CardContent>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="border-white/10 bg-[#071019] text-slate-100">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <FileSearch className="h-10 w-10 text-slate-500" />
              <div>
                <p className="text-lg font-semibold">No se encontraron logs</p>
                <p className="text-sm text-slate-400">
                  Ajusta los filtros y vuelve a ejecutar la consulta.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <LogRecord key={log.id} log={log} />
            ))}
          </div>
        )}

        {!accessDenied && logs.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-white/10 bg-transparent text-slate-100 hover:bg-white/10"
              disabled={!hasPreviousPage || loading}
              onClick={() => updateParams({ ...params, page: params.page - 1 })}
              aria-label="Pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="rounded-full border border-white/10 bg-[#071019] px-4 py-2 text-sm text-slate-300">
              Pagina{" "}
              <span className="font-semibold text-slate-100">
                {params.page}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-100">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-white/10 bg-transparent text-slate-100 hover:bg-white/10"
              disabled={!hasNextPage || loading}
              onClick={() => updateParams({ ...params, page: params.page + 1 })}
              aria-label="Pagina siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
