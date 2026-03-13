"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Home,
  Hotel,
  LayoutDashboard,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const adminLinks: NavLink[] = [
  {
    href: "/admin/hotels",
    label: "Hoteles",
    icon: Hotel,
  },
  {
    href: "/",
    label: "Portal publico",
    icon: Home,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {adminLinks.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;

        return onNavigate ? (
          <SheetClose asChild key={link.href}>
            <Link
              href={link.href}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-amber-400 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8 hover:text-slate-100"
              }`}
              onClick={onNavigate}
            >
              <span className="inline-flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {link.label}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </SheetClose>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-amber-400 text-slate-950"
                : "text-slate-300 hover:bg-white/8 hover:text-slate-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();

  return (
    <div className="dark flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#1e293b,transparent_22%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 md:hidden"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Abrir navegacion de admin</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[22rem] border-white/10 bg-slate-950 p-0 text-slate-100"
              >
                <SheetHeader className="border-b border-white/10 bg-slate-950 px-5 py-5">
                  <SheetTitle className="flex items-center gap-3 text-slate-100">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
                      <Building2 className="h-5 w-5" />
                    </span>
                    Centro administrativo
                  </SheetTitle>
                  <SheetDescription className="text-slate-400">
                    Gestiona hoteles, configuracion e inventario desde un panel
                    dedicado.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex h-full flex-col gap-6 px-5 py-6">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Sesion
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-100">
                      {user?.fullName || user?.email || "Usuario autenticado"}
                    </p>
                    <p className="text-sm text-slate-400">{user?.email}</p>
                    <Badge className="mt-3 rounded-full border border-amber-400/30 bg-amber-400/15 text-amber-200 hover:bg-amber-400/15">
                      {user?.role || "Acceso autenticado"}
                    </Badge>
                  </div>

                  <nav className="grid gap-3" aria-label="Admin drawer">
                    <AdminNavLinks pathname={pathname} />
                  </nav>

                  <div className="mt-auto space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                      onClick={logoutUser}
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesion
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link
              href="/admin/hotels"
              className="inline-flex items-center gap-3"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-300">
                  Admin Module
                </p>
                <p className="text-sm font-semibold text-slate-100">
                  Hotel Operations Console
                </p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            <AdminNavLinks pathname={pathname} />
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-100">
                {user?.fullName || user?.email || "Sesion activa"}
              </p>
              <p className="text-xs text-slate-400">
                {user?.role || "Authenticated user"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={logoutUser}
              className="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Operations dashboard
              </p>
              <h1 className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-slate-100">
                <LayoutDashboard className="h-5 w-5 text-amber-300" />
                Administracion de hoteles
              </h1>
            </div>
            <Badge className="rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
              Entorno operativo
            </Badge>
          </div>
          {children}
        </div>
      </div>

      <footer className="mt-8 border-t border-white/10 bg-slate-950/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-medium text-slate-100">
              Hotel Operations Console
            </p>
            <p>
              Configuracion, catalogo e inventario con control centralizado.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/hotels" className="hover:text-slate-100">
              Hoteles
            </Link>
            <Link href="/" className="hover:text-slate-100">
              Volver al portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
