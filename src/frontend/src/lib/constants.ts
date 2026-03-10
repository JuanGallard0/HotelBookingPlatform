export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export const HOTELS_PER_PAGE = 12;

export const SORT_OPTIONS = [
  { label: "Name (A–Z)", value: "name", direction: "asc" },
  { label: "Name (Z–A)", value: "name", direction: "desc" },
  { label: "Star rating (high)", value: "starRating", direction: "desc" },
  { label: "Star rating (low)", value: "starRating", direction: "asc" },
] as const;

export const NAV_LINKS = [
  { label: "Hotels", href: "/hotels" },
  { label: "Bookings", href: "/bookings" },
] as const;

export const DASHBOARD_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Hotels", href: "/hotels", icon: "building" },
  { label: "Bookings", href: "/bookings", icon: "calendar" },
  { label: "Settings", href: "/settings", icon: "settings" },
] as const;
