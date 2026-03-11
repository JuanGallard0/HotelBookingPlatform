"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Viewer } from "@/lib/auth/viewer";
import { ADMIN_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
  viewer: Viewer;
};

export function AdminShell({ children, viewer }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-800 bg-slate-900 px-4 py-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              Admin workspace
            </p>
            <h1 className="mt-2 text-xl font-semibold">StayFinder operations</h1>
            <p className="mt-3 text-sm text-slate-400">{viewer.email}</p>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Admin navigation">
            {ADMIN_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="bg-slate-950">
          <header className="border-b border-slate-800 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Operational controls</p>
                <p className="text-lg font-semibold text-white">{viewer.name}</p>
              </div>
              <Link
                href="/"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-900"
              >
                Back to site
              </Link>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
