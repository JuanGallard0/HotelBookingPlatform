import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/src/lib/auth/cookies";
import { callBackend, clearAuthCookies } from "@/src/lib/auth/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (refreshToken) {
    try {
      await callBackend("/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Local cookie invalidation is the primary concern here.
    }
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  clearAuthCookies(response);
  return response;
}
