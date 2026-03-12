"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
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

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { user, openModal, logoutUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Menu className="h-5 w-5" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {user && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-medium text-foreground truncate">
                      {user.fullName || `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/account/reservations">Mis reservas</Link>
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logoutUser}
                    className="text-destructive focus:text-destructive"
                  >
                    Cerrar sesión
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {mounted && user ? (
            <button className="flex items-center gap-2 rounded-full bg-muted pl-2 pr-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user.firstName?.[0]?.toUpperCase() ?? "U"}
              </span>
              {user.firstName}
            </button>
          ) : (
            <Button onClick={() => openModal("login")}>Iniciar sesión</Button>
          )}
        </nav>
      </div>
    </header>
  );
}
