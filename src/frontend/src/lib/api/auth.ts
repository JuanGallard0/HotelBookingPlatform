import { SwaggerException } from "@/src/lib/api/generated/api-client";
import type { AuthenticatedUser } from "@/src/types/auth";

export type AuthSession = {
  user: AuthenticatedUser;
  accessTokenExpiresAt: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  errorMessage?: string;
  errorCode?: string;
  validationErrors?: Record<string, string[]>;
};

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}

async function expectSuccess<T>(response: Response): Promise<T> {
  const payload = await readJson<T>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new SwaggerException(
      payload.errorMessage ?? "Authentication request failed.",
      response.status,
      JSON.stringify(payload),
      {},
      payload,
    );
  }

  return payload.data;
}

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  return expectSuccess<AuthSession>(response);
}

export async function register(data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<AuthSession> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return expectSuccess<AuthSession>(response);
}

export async function refreshSession(): Promise<AuthSession> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
  });

  return expectSuccess<AuthSession>(response);
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
  });
}

export async function getMe(): Promise<AuthenticatedUser | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const payload = await readJson<AuthenticatedUser>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new SwaggerException(
      payload.errorMessage ?? "Failed to load current user.",
      response.status,
      JSON.stringify(payload),
      {},
      payload,
    );
  }

  return payload.data;
}
