import { toast } from "sonner";
import { SwaggerException } from "./generated/api-client";

type ApiErrorResult = {
  errorMessage?: string;
  message?: string;
  validationErrors?: Record<string, string[]>;
};

function showApiErrorResult(result: ApiErrorResult, fallback: string) {
  const validationErrors = result.validationErrors;

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    const lines = Object.values(validationErrors).flat();
    toast.error("Error de validación", { description: lines.join("\n") });
    return;
  }

  toast.error(result.errorMessage ?? result.message ?? fallback);
}

function isApiErrorResult(value: unknown): value is ApiErrorResult {
  return (
    typeof value === "object" &&
    value !== null &&
    ("errorMessage" in value || "validationErrors" in value)
  );
}

export function handleApiError(
  error: unknown,
  fallback = "Ha ocurrido un error inesperado.",
): void {
  if (error instanceof SwaggerException) {
    showApiErrorResult((error.result as ApiErrorResult) ?? {}, fallback);
    return;
  }

  if (isApiErrorResult(error)) {
    showApiErrorResult(error, fallback);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message || fallback);
    return;
  }

  toast.error(fallback);
}
