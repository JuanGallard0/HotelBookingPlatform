"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Viewer } from "@/lib/auth/viewer";
import { CUSTOMER_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CustomerShellProps = {
  children: ReactNode;
  viewer: Viewer;
};

export function CustomerShell({ children, viewer }: CustomerShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Customer workspace
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              StayFinder account
            </h1>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{viewer.name}</p>
            <p className="text-sm text-slate-500">{viewer.email}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3">
          <nav className="flex flex-col gap-1" aria-label="Customer navigation">
            {CUSTOMER_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
