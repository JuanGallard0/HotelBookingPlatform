import type { NextRequest } from "next/server";

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

function buildRequestHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  return headers;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(request, path);
  const headers = buildRequestHeaders(request);

  // Read body once — ArrayBuffer can be reused across redirect hops
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

  // Follow redirects manually so the Authorization header is preserved.
  // Node.js fetch strips Authorization when auto-following cross-origin
  // redirects (e.g. HTTP → HTTPS), which breaks bearer-token auth.
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
