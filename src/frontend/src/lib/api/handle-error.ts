import { toast } from "sonner";
import { SwaggerException } from "./generated/api-client";

type ApiErrorResult = {
  errorMessage?: string;
  message?: string;
  validationErrors?: Record<string, string[]>;
};

export function handleApiError(
  error: unknown,
  fallback = "Ha ocurrido un error inesperado.",
): void {
  if (error instanceof SwaggerException) {
    const result = (error.result as ApiErrorResult) ?? {};
    const validationErrors = result.validationErrors;

    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const lines = Object.values(validationErrors).flat();
      toast.error("Error de validación", {
        description: lines.join("\n"),
      });
      return;
    }

    toast.error(result.errorMessage ?? result.message ?? fallback);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message || fallback);
    return;
  }

  toast.error(fallback);
}
