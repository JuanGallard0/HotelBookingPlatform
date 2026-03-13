import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/src/lib/auth/cookies";
import {
  buildAuthMutationResponse,
  callBackend,
  clearAuthCookies,
} from "@/src/lib/auth/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) {
    const response = NextResponse.json(
      { success: false, errorMessage: "Refresh token is missing." },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const backendResponse = await callBackend("/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  return buildAuthMutationResponse(backendResponse);
}
