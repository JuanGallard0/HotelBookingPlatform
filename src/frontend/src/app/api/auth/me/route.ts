import { NextResponse, type NextRequest } from "next/server";
import {
  buildAuthHeaders,
  callBackend,
} from "@/src/lib/auth/server";
import type { AuthenticatedUser } from "@/src/types/auth";

export const runtime = "nodejs";

type MeResponse = {
  success: boolean;
  data?: AuthenticatedUser;
  errorMessage?: string;
  errorCode?: string;
};

export async function GET(request: NextRequest) {
  const response = await callBackend("/api/v1/auth/me", {
    method: "GET",
    headers: buildAuthHeaders(request),
  });

  const payload = (await response.json()) as MeResponse;
  return NextResponse.json(payload, { status: response.status });
}
