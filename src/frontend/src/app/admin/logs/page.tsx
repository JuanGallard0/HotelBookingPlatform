import { Suspense } from "react";
import { AdminLogsPageClient } from "@/src/components/admin/AdminLogsPageClient";

export default function AdminLogsPage() {
  return (
    <Suspense>
      <AdminLogsPageClient />
    </Suspense>
  );
}
