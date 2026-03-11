import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { getDemoViewer } from "@/lib/auth/viewer";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell viewer={getDemoViewer("admin")}>{children}</AdminShell>;
}
