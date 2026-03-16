import { AdminHotelDetailPageClient } from "@/src/components/admin/AdminHotelDetailPageClient";

export default async function AdminHotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminHotelDetailPageClient hotelId={Number(id)} />;
}
