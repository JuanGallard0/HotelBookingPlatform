import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAMES } from "@/src/lib/auth/cookies";
import { callBackend } from "@/src/lib/auth/server";
import type { AuthenticatedUser } from "@/src/types/auth";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
};

function readCookieFromHeader(cookieHeader: string, name: string) {
  const cookiePrefix = `${name}=`;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(cookiePrefix)) {
      return trimmed.slice(cookiePrefix.length);
    }
  }

  return undefined;
}

export async function getServerAccessToken() {
  const requestHeaders = await headers();
  const headerToken = readCookieFromHeader(
    requestHeaders.get("cookie") ?? "",
    AUTH_COOKIE_NAMES.accessToken,
  );

  if (headerToken) {
    return headerToken;
  }

  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
}

async function fetchCurrentUser(accessToken: string): Promise<AuthenticatedUser | null> {
  const response = await callBackend("/api/v1/auth/me", {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<AuthenticatedUser>;
  return payload.success && payload.data ? payload.data : null;
}

export async function getServerUser(): Promise<AuthenticatedUser | null> {
  const accessToken = await getServerAccessToken();
  return accessToken ? fetchCurrentUser(accessToken) : null;
}

export async function requireAdminUser() {
  const user = await getServerUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "Admin") {
    redirect("/");
  }

  return user;
}
