import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/src/lib/auth/cookies";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

function buildTargetUrl(request: NextRequest, path: string[]) {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`/api/v1/${path.join("/")}`, API_BASE_URL);

  targetUrl.search = incomingUrl.search;

  return targetUrl;
}

function buildRequestHeaders(request: NextRequest, path: string[]) {
  const headers = new Headers(request.headers);
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  if (
    accessToken &&
    !headers.has("authorization") &&
    !(path[0] === "auth" && path[1] !== "me")
  ) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(request, path);
  const headers = buildRequestHeaders(request, path);

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  const init: RequestInit = {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  };

  let response = await fetch(targetUrl, init);
  let hops = 0;
  while (response.status >= 300 && response.status < 400 && hops < 10) {
    const location = response.headers.get("location");
    if (!location) break;
    response = await fetch(location, init);
    hops++;
  }

  const responseHeaders = new Headers(response.headers);

  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export { proxyRequest as GET };
export { proxyRequest as POST };
export { proxyRequest as PUT };
export { proxyRequest as PATCH };
export { proxyRequest as DELETE };
export { proxyRequest as OPTIONS };
