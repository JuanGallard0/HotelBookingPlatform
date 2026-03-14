"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/components/ui/tabs";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";
import { handleApiError } from "@/src/lib/api/handle-error";
import { toast } from "sonner";

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser({ email, password });
      toast.success("¡Bienvenido!");
      onSuccess();
    } catch (err) {
      handleApiError(err, "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        id="login-email"
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
      />
      <InputField
        id="login-password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { registerUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      handleApiError(new Error("Las contraseñas no coinciden"));
      return;
    }
    setLoading(true);
    try {
      await registerUser({ email, firstName, lastName, password });
      toast.success("¡Cuenta creada! Bienvenido.");
      onSuccess();
    } catch (err) {
      handleApiError(err, "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <InputField
          id="reg-firstName"
          label="Nombre"
          value={firstName}
          onChange={setFirstName}
          autoComplete="given-name"
        />
        <InputField
          id="reg-lastName"
          label="Apellido"
          value={lastName}
          onChange={setLastName}
          autoComplete="family-name"
        />
      </div>
      <InputField
        id="reg-email"
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
      />
      <InputField
        id="reg-password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <InputField
        id="reg-confirm"
        label="Confirmar contraseña"
        type="password"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Registrando…" : "Crear cuenta"}
      </Button>
    </form>
  );
}

export function AuthModal() {
  const { isModalOpen, modalTab, closeModal, openModal } = useAuth();

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {modalTab === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={modalTab}
          onValueChange={(v) => openModal(v as "login" | "register")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4 space-y-4">
            <LoginForm onSuccess={closeModal} />
            <p className="text-center text-sm text-muted-foreground">
              ¿Aún no tienes cuenta?{" "}
              <button
                onClick={() => openModal("register")}
                className="font-medium text-primary hover:underline"
              >
                Regístrate
              </button>
            </p>
          </TabsContent>

          <TabsContent value="register" className="mt-4 space-y-4">
            <RegisterForm onSuccess={closeModal} />
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => openModal("login")}
                className="font-medium text-primary hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
