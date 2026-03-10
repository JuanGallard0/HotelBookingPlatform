import type { NextConfig } from "next";

// Allow self-signed certificates in development (ASP.NET Core dev cert).
// Never set this in production.
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {};

export default nextConfig;
