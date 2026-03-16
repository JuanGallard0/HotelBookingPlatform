"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="relative mb-8 select-none">
        <span className="text-[9rem] font-black leading-none tracking-tighter text-slate-100/5 sm:text-[12rem]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <MapPin className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
        Página no encontrada
      </h1>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground">
        La página que buscas no existe o fue movida. Verifica la dirección o
        regresa al inicio.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
