"use client";

import { useEffect, useRef, useState } from "react";
import "./AuthModal.css";
import { useAuth } from "@/src/context/AuthContext";

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
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginUser({ email, password });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
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

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registerUser({ email, firstName, lastName, password });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
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

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Registrando…" : "Crear cuenta"}
      </button>
    </form>
  );
}

export function AuthModal() {
  const { isModalOpen, modalTab, closeModal, openModal } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) closeModal();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {modalTab === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <button
            onClick={closeModal}
            aria-label="Cerrar"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => openModal("login")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              modalTab === "login"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => openModal("register")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              modalTab === "register"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <div key={modalTab} className="auth-tab-panel px-6 py-6">
          {modalTab === "login" ? (
            <>
              <LoginForm onSuccess={closeModal} />
              <p className="mt-4 text-center text-sm text-slate-500">
                ¿Aún no tienes cuenta?{" "}
                <button
                  onClick={() => openModal("register")}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Regístrate
                </button>
              </p>
            </>
          ) : (
            <>
              <RegisterForm onSuccess={closeModal} />
              <p className="mt-4 text-center text-sm text-slate-500">
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => openModal("login")}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
