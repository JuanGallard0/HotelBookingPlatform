import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/src/lib/auth/cookies";

const protectedPaths = ["/account/bookings", "/bookings/new"];

export function middleware(request: NextRequest) {
  if (!protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const hasSession =
    request.cookies.has(AUTH_COOKIE_NAMES.accessToken) ||
    request.cookies.has(AUTH_COOKIE_NAMES.refreshToken);

  if (hasSession) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/account/bookings/:path*", "/bookings/new/:path*"],
};
