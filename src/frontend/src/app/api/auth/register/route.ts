import { buildAuthMutationResponse, callBackend } from "@/src/lib/auth/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const response = await callBackend("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  return buildAuthMutationResponse(response);
}
