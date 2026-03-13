"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, MapPin, Plus } from "lucide-react";
import type { HotelDto } from "@/src/lib/api/generated/api-client";
import {
  createAdminHotel,
  toAdminErrorMessage,
} from "@/src/lib/api/admin-hotels";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

type CreateHotelFormState = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phoneNumber: string;
  starRating: string;
};

const emptyForm: CreateHotelFormState = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "",
  email: "",
  phoneNumber: "",
  starRating: "4",
};

export function AdminHotelsDashboard({
  initialHotels,
}: {
  initialHotels: HotelDto[];
}) {
  const router = useRouter();
  const [hotels, setHotels] = useState(initialHotels);
  const [form, setForm] = useState<CreateHotelFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateHotel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const hotelId = await createAdminHotel({
        name: form.name,
        description: form.description,
        address: form.address,
        city: form.city,
        country: form.country,
        email: form.email,
        phoneNumber: form.phoneNumber,
        starRating: Number(form.starRating),
      });

      if (typeof hotelId === "number") {
        setHotels((current) => [
          ...current,
          {
            hotelId,
            name: form.name,
            description: form.description,
            address: form.address,
            city: form.city,
            country: form.country,
            email: form.email,
            phoneNumber: form.phoneNumber,
            starRating: Number(form.starRating),
            isActive: true,
          } as HotelDto,
        ]);

        setForm(emptyForm);
        router.push(`/admin/hotels/${hotelId}`);
      }
    } catch (createError) {
      setError(
        toAdminErrorMessage(createError, "No se pudo crear el hotel."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr]">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Hoteles registrados
            </h2>
            <p className="text-sm text-slate-500">
              Selecciona un hotel para editar su configuracion, tarifas e inventario.
            </p>
          </div>
          <Badge variant="outline">{hotels.length} hoteles</Badge>
        </div>

        <div className="grid gap-4">
          {hotels.map((hotel) => (
            <Card key={hotel.hotelId}>
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-950">
                      {hotel.name}
                    </h3>
                    <Badge variant={hotel.isActive ? "secondary" : "outline"}>
                      {hotel.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {hotel.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {hotel.city}, {hotel.country}
                    </span>
                    <span>{hotel.starRating} estrellas</span>
                  </div>
                </div>

                <Button asChild>
                  <Link href={`/admin/hotels/${hotel.hotelId}`}>Gestionar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear hotel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreateHotel}>
            <Input
              placeholder="Nombre"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <textarea
              className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Descripcion"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Direccion"
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Ciudad"
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
              />
              <Input
                placeholder="Pais"
                value={form.country}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    country: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Correo"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <Input
                placeholder="Telefono"
                value={form.phoneNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
              />
            </div>
            <Input
              placeholder="Categoria"
              type="number"
              min={1}
              max={5}
              value={form.starRating}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  starRating: event.target.value,
                }))
              }
            />

            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creando..." : "Crear y gestionar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
