import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/src/lib/auth/cookies";
import type { AuthenticatedUser } from "@/src/types/auth";

type BackendApiResponse<T> = {
  success: boolean;
  data?: T;
  errorMessage?: string;
  errorCode?: string;
  validationErrors?: Record<string, string[]>;
};

type BackendAuthPayload = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  user?: AuthenticatedUser;
};

export type FrontendSessionPayload = {
  user: AuthenticatedUser;
  accessTokenExpiresAt: string | null;
};

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

function isSecureCookie() {
  return process.env.NODE_ENV === "production";
}

function toFrontendSession(data: BackendAuthPayload): FrontendSessionPayload {
  return {
    user: {
      id: data.user?.id ?? 0,
      email: data.user?.email ?? "",
      firstName: data.user?.firstName ?? "",
      lastName: data.user?.lastName ?? "",
      fullName: data.user?.fullName ?? "",
      role: data.user?.role ?? "",
    },
    accessTokenExpiresAt: data.accessTokenExpiresAt ?? null,
  };
}

export async function callBackend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const requestInit: RequestInit = {
    ...init,
    redirect: "manual",
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  };

  let response = await fetch(new URL(path, API_BASE_URL), requestInit);
  let hops = 0;

  while (response.status >= 300 && response.status < 400 && hops < 10) {
    const location = response.headers.get("location");
    if (!location) {
      break;
    }

    response = await fetch(location, requestInit);
    hops++;
  }

  return response;
}

export function buildAuthHeaders(request: NextRequest) {
  const headers = new Headers({ Accept: "application/json" });
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

export function applyAuthCookies(
  response: NextResponse,
  payload: BackendAuthPayload,
) {
  if (payload.accessToken) {
    response.cookies.set(AUTH_COOKIE_NAMES.accessToken, payload.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      path: "/",
      expires: payload.accessTokenExpiresAt
        ? new Date(payload.accessTokenExpiresAt)
        : undefined,
    });
  }

  if (payload.refreshToken) {
    response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, payload.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      path: "/",
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    expires: new Date(0),
  });
  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    expires: new Date(0),
  });
}

export async function buildAuthMutationResponse(response: Response) {
  const payload =
    (await response.json()) as BackendApiResponse<BackendAuthPayload>;

  if (!payload.success || !payload.data) {
    const failedResponse = NextResponse.json(payload, {
      status: response.status,
    });

    if (response.status === 401) {
      clearAuthCookies(failedResponse);
    }

    return failedResponse;
  }

  const nextResponse = NextResponse.json(
    {
      success: true,
      data: toFrontendSession(payload.data),
    },
    { status: response.status },
  );

  applyAuthCookies(nextResponse, payload.data);
  return nextResponse;
}
