"use client";

import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export function Footer() {
  const year = new Date().getFullYear();
  const { isAuthenticated, openModal } = useAuth();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-foreground"
          >
            <span aria-hidden="true">H|B</span>
            <span>Hotel Booking</span>
          </Link>
          <nav
            className="flex items-center gap-6"
            aria-label="Footer navigation"
          >
            <Link
              href="/hotels"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Hoteles
            </Link>
            {isAuthenticated ? (
              <Link
                href="/account/profile"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Mi cuenta
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openModal("login")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Iniciar sesión
              </button>
            )}
          </nav>
          <p className="text-sm text-muted-foreground">
            © {year} Hotel Booking. Juan Gallardo
          </p>
        </div>
      </div>
    </footer>
  );
}
