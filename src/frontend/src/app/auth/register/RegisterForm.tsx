"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const password = data.get("password") as string;

    if (password !== data.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: data.get("email") as string,
        firstName: data.get("firstName") as string,
        lastName: data.get("lastName") as string,
        password,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      noValidate
    >
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input id="firstName" name="firstName" type="text" label="First name" placeholder="Jane" autoComplete="given-name" required />
        <Input id="lastName" name="lastName" type="text" label="Last name" placeholder="Smith" autoComplete="family-name" required />
      </div>
      <Input id="reg-email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" required />
      <Input id="reg-password" name="password" type="password" label="Password" placeholder="Min. 8 characters" autoComplete="new-password" required minLength={8} />
      <Input id="reg-confirm" name="confirmPassword" type="password" label="Confirm password" placeholder="••••••••" autoComplete="new-password" required />
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
