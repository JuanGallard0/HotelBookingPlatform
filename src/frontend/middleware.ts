import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/src/lib/auth/cookies";

const protectedPaths = ["/account/bookings", "/bookings/new", "/admin"];
const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

type RefreshPayload = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
};

function upsertCookieHeader(
  cookieHeader: string,
  name: string,
  value: string,
) {
  const cookies = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !part.startsWith(`${name}=`));

  cookies.push(`${name}=${value}`);
  return cookies.join("; ");
}

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname.startsWith(path));
}

function isSecureCookie() {
  return process.env.NODE_ENV === "production";
}

function redirectHome(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(new URL("/api/v1/auth/refresh", API_BASE_URL), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<RefreshPayload>;
  return payload.success && payload.data ? payload.data : null;
}

function applyRefreshedCookies(
  response: NextResponse,
  refreshPayload: RefreshPayload,
) {
  if (refreshPayload.accessToken) {
    response.cookies.set(AUTH_COOKIE_NAMES.accessToken, refreshPayload.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      path: "/",
      expires: refreshPayload.accessTokenExpiresAt
        ? new Date(refreshPayload.accessTokenExpiresAt)
        : undefined,
    });
  }

  if (refreshPayload.refreshToken) {
    response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, refreshPayload.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      path: "/",
    });
  }
}

export async function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  const originalCookieHeader = request.headers.get("cookie") ?? "";
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (!accessToken && !refreshToken) {
    return redirectHome(request);
  }

  let resolvedAccessToken = accessToken;
  let resolvedRefreshToken = refreshToken;
  let refreshedSession: RefreshPayload | null = null;

  async function tryRefreshSession() {
    if (!resolvedRefreshToken) {
      return false;
    }

    refreshedSession = await refreshAccessToken(resolvedRefreshToken);

    if (!refreshedSession?.accessToken) {
      return false;
    }

    resolvedAccessToken = refreshedSession.accessToken;
    resolvedRefreshToken = refreshedSession.refreshToken ?? resolvedRefreshToken;
    requestHeaders.set(
      "cookie",
      upsertCookieHeader(
        upsertCookieHeader(
          originalCookieHeader,
          AUTH_COOKIE_NAMES.accessToken,
          resolvedAccessToken,
        ),
        AUTH_COOKIE_NAMES.refreshToken,
        resolvedRefreshToken,
      ),
    );

    return true;
  }

  if (!resolvedAccessToken) {
    const refreshed = await tryRefreshSession();
    if (!refreshed) {
      return redirectHome(request);
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (refreshedSession) {
    applyRefreshedCookies(response, refreshedSession);
  }

  return response;
}

export const config = {
  matcher: ["/account/bookings/:path*", "/bookings/new/:path*", "/admin/:path*"],
};
