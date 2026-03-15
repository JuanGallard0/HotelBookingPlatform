import { Suspense } from "react";
import { AdminHotelsPageClient } from "@/src/components/admin/AdminHotelsPageClient";

export default async function AdminHotelsPage() {
  return (
    <Suspense>
      <AdminHotelsPageClient />
    </Suspense>
  );
}
