import {
  AuditLogsClient,
  SwaggerException,
  type AuditLogDto,
} from "@/src/lib/api/generated/api-client";
import { API_BASE_URL } from "@/src/lib/constants";

function getBaseUrl() {
  return typeof window === "undefined" ? API_BASE_URL : "";
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof SwaggerException) {
    const result = (error as SwaggerException & { result?: unknown }).result as
      | { errorMessage?: string; message?: string }
      | undefined;

    return result?.errorMessage ?? result?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function toAdminAuditErrorMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}

export type AdminAuditLogsQuery = {
  entityName?: string;
  entityId?: number;
  action?: string;
  userId?: string;
  userName?: string;
  from?: Date;
  to?: Date;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
};

export async function getAdminAuditLogs(query: AdminAuditLogsQuery = {}) {
  const response = await new AuditLogsClient(getBaseUrl()).getAuditLogs(
    query.entityName,
    query.entityId,
    query.action,
    query.userId,
    query.userName,
    query.from,
    query.to,
    query.pageNumber ?? 1,
    query.pageSize ?? 20,
    query.sortBy ?? "Timestamp",
    query.sortDirection ?? "desc",
  );

  if (!response.success || !response.data) {
    throw response;
  }

  return {
    logs: (response.data.data ?? []) as AuditLogDto[],
    totalRecords: response.data.totalRecords ?? 0,
    totalPages: response.data.totalPages ?? 1,
    pageNumber: response.data.pageNumber ?? 1,
    pageSize: response.data.pageSize ?? query.pageSize ?? 20,
    hasPreviousPage: Boolean(response.data.hasPreviousPage),
    hasNextPage: Boolean(response.data.hasNextPage),
  };
}
