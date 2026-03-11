import type { ReactNode } from "react";

import { CustomerShell } from "@/components/layout/CustomerShell";
import { getDemoViewer } from "@/lib/auth/viewer";

type AccountLayoutProps = {
  children: ReactNode;
};

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <CustomerShell viewer={getDemoViewer("customer")}>{children}</CustomerShell>
  );
}
