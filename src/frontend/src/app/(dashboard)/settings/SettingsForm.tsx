"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsForm() {
  const [profileState, setProfileState] = useState<SaveState>("idle");
  const [passwordState, setPasswordState] = useState<SaveState>("idle");

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileState("saving");
    // TODO: call PATCH /api/v1/auth/profile when endpoint is available
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    setProfileState("saved");
    setTimeout(() => setProfileState("idle"), 2500);
  }

  async function handlePasswordSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("newPassword") !== data.get("confirmPassword")) {
      setPasswordState("error");
      return;
    }
    setPasswordState("saving");
    // TODO: call POST /api/v1/auth/change-password when endpoint is available
    await new Promise((r) => setTimeout(r, 600));
    setPasswordState("saved");
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setPasswordState("idle"), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Profile section */}
      <section
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
        aria-labelledby="profile-heading"
      >
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 id="profile-heading" className="font-semibold text-gray-900">
            Profile
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Your personal information.
          </p>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              name="firstName"
              type="text"
              label="First name"
              defaultValue="Jane"
              autoComplete="given-name"
              required
            />
            <Input
              id="lastName"
              name="lastName"
              type="text"
              label="Last name"
              defaultValue="Smith"
              autoComplete="family-name"
              required
            />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            defaultValue="jane.smith@example.com"
            autoComplete="email"
            required
          />
          <div className="flex items-center justify-between pt-1">
            {profileState === "saved" && (
              <p className="text-sm text-green-600" role="status">
                Saved successfully.
              </p>
            )}
            {profileState === "error" && (
              <p className="text-sm text-red-600" role="alert">
                Failed to save. Please try again.
              </p>
            )}
            {profileState === "idle" && <span />}
            <Button
              type="submit"
              disabled={profileState === "saving"}
            >
              {profileState === "saving" ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </section>

      {/* Password section */}
      <section
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
        aria-labelledby="password-heading"
      >
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 id="password-heading" className="font-semibold text-gray-900">
            Password
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Update your account password.
          </p>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-4 px-6 py-5">
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            label="Current password"
            autoComplete="current-password"
            required
          />
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="New password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            required
          />
          <div className="flex items-center justify-between pt-1">
            {passwordState === "saved" && (
              <p className="text-sm text-green-600" role="status">
                Password updated.
              </p>
            )}
            {passwordState === "error" && (
              <p className="text-sm text-red-600" role="alert">
                Passwords do not match.
              </p>
            )}
            {passwordState === "idle" && <span />}
            <Button
              type="submit"
              disabled={passwordState === "saving"}
            >
              {passwordState === "saving" ? "Saving…" : "Update password"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
