import type { Metadata } from "next";
import { Toaster } from "@/src/components/ui/sonner";
import { AuthProvider } from "@/src/context/AuthContext";
import { AuthModal } from "@/src/components/auth/AuthModal";
import { AppChrome } from "@/src/components/layout/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hotel Booking Platform",
  description: "Reserva hoteles, gestiona inventario y administra operaciones desde una sola plataforma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
          <AuthProvider>
            <AppChrome>{children}</AppChrome>
            <AuthModal />
          </AuthProvider>
          <Toaster richColors closeButton />
        </div>
      </body>
    </html>
  );
}
