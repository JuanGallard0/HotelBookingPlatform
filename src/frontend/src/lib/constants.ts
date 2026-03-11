export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export const HOTELS_PER_PAGE = 12;

export const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name", direction: "asc" },
  { label: "Name (Z-A)", value: "name", direction: "desc" },
  { label: "Star rating (high)", value: "starRating", direction: "desc" },
  { label: "Star rating (low)", value: "starRating", direction: "asc" },
] as const;

export const MARKETING_NAV_LINKS = [
  { label: "Hotels", href: "/hotels" },
  { label: "About", href: "/about" },
] as const;

export const CUSTOMER_NAV_LINKS = [
  { label: "Overview", href: "/account" },
  { label: "Bookings", href: "/account/bookings" },
  { label: "Profile", href: "/account/profile" },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Hotels", href: "/admin/hotels" },
  { label: "Reservations", href: "/admin/reservations" },
  { label: "Users", href: "/admin/users" },
] as const;
