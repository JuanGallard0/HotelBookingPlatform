"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

// Returns false on the server (and during hydration), true after mount on the client.
// This prevents hydration mismatches when auth state is read from localStorage.
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function Navbar() {
  const { isAuthenticated, user, openModal, logoutUser } = useAuth();
  const mounted = useIsMounted();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground"
          >
            HB
          </span>
          <span className="text-lg">HotelBooking</span>
        </Link>

        <nav
          aria-label="Navegacion principal"
          className="flex items-center gap-3"
        >
          {mounted && isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-muted pl-2 pr-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.firstName?.[0]?.toUpperCase() ?? "U"}
                  </span>
                  {user.firstName}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-medium text-foreground truncate">
                    {user.fullName || `${user.firstName} ${user.lastName}`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "Admin" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/hotels">Modulo admin</Link>
                  </DropdownMenuItem>
                ) : null}
                {user.role === "Admin" ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem asChild>
                  <Link href="/account/bookings">Mis reservas</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logoutUser}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => openModal("login")}>Iniciar sesión</Button>
          )}
        </nav>
      </div>
    </header>
  );
}
