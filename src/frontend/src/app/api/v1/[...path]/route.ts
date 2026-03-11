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

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(targetUrl, init);
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
