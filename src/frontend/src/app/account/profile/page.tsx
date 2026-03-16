"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Shield, Hash, BookOpen, LogOut } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AccountProfilePage() {
  const { authReady, isAuthenticated, user, logoutUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, router]);

  if (!user) {
    return null;
  }

  async function handleLogout() {
    await logoutUser();
    router.replace("/");
  }

  const roleLabel =
    user.role === "Admin" ? "Administrador" : "Usuario";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Cuenta
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Mi perfil</h1>
      </div>

      <Card>
        <CardContent className="px-6 py-2 divide-y divide-border">
          <DetailRow icon={User} label="Nombre" value={user.fullName} />
          <DetailRow icon={Mail} label="Correo electrónico" value={user.email} />
          <DetailRow icon={Shield} label="Rol" value={roleLabel} />
          <DetailRow icon={Hash} label="ID de usuario" value={String(user.id)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 px-6 py-5">
          <p className="text-sm font-medium text-foreground">Acciones</p>
          <Separator />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/account/bookings">
                <BookOpen className="h-4 w-4" />
                Mis reservas
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
