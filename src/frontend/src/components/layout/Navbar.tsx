"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:opacity-80 transition-opacity"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white"
          >
            HB
          </span>
          <span className="text-lg">HotelBooking</span>
        </Link>

        <nav
          aria-label="Navegacion principal"
          className="flex items-center gap-3"
        >
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              Menu
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-11 z-20 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
              >
                <Link
                  href="/account/reservations"
                  role="menuitem"
                  className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis reservas
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/auth/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Iniciar sesion
          </Link>
        </nav>
      </div>
    </header>
  );
}
