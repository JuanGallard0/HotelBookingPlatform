const browserApiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const serverApiBaseUrl =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

export const API_BASE_URL =
  typeof window === "undefined" ? serverApiBaseUrl : browserApiBaseUrl;
