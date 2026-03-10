import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/** Main app layout — hotel browsing pages. Adds sticky header and footer. */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
