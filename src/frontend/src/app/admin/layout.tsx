import type { ReactNode } from "react";
import { AdminChrome } from "@/src/components/admin/AdminChrome";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminChrome>{children}</AdminChrome>;
}
