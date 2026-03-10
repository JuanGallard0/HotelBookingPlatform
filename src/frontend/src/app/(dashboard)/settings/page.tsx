import type { Metadata } from "next";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your profile and preferences.</p>
      </div>
      <SettingsForm />
    </div>
  );
}
