"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthenticatedUser } from "@/src/types/auth";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isModalOpen: boolean;
  modalTab: "login" | "register";
  openModal: (tab?: "login" | "register") => void;
  closeModal: () => void;
  loginUser: (credentials: {
    email: string;
    password: string;
  }) => Promise<void>;
  registerUser: (data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const STORAGE_KEY = "hb_auth";

function persist(
  data: {
    user: AuthenticatedUser;
    accessToken: string;
    refreshToken: string;
  } | null,
) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function readStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(
    () => readStorage()?.user ?? null,
  );
  const [accessToken, setAccessToken] = useState<string | null>(
    () => readStorage()?.accessToken ?? null,
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    () => readStorage()?.refreshToken ?? null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "register">("login");

  const openModal = useCallback((tab: "login" | "register" = "login") => {
    setModalTab(tab);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const loginUser = useCallback(
    async (credentials: { email: string; password: string }) => {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (!json.success || !json.data)
        throw new Error(json.errorMessage ?? "Login failed");
      const d = json.data;
      const authUser: AuthenticatedUser = {
        id: d.user?.id ?? 0,
        email: d.user?.email ?? "",
        firstName: d.user?.firstName ?? "",
        lastName: d.user?.lastName ?? "",
        fullName: d.user?.fullName ?? "",
        role: d.user?.role ?? "",
      };
      setUser(authUser);
      setAccessToken(d.accessToken);
      setRefreshToken(d.refreshToken);
      persist({
        user: authUser,
        accessToken: d.accessToken,
        refreshToken: d.refreshToken,
      });
    },
    [],
  );

  const registerUser = useCallback(
    async (data: {
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    }) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success || !json.data)
        throw new Error(json.errorMessage ?? "Registration failed");
      const d = json.data;
      const authUser: AuthenticatedUser = {
        id: d.user?.id ?? 0,
        email: d.user?.email ?? "",
        firstName: d.user?.firstName ?? "",
        lastName: d.user?.lastName ?? "",
        fullName: d.user?.fullName ?? "",
        role: d.user?.role ?? "",
      };
      setUser(authUser);
      setAccessToken(d.accessToken);
      setRefreshToken(d.refreshToken);
      persist({
        user: authUser,
        accessToken: d.accessToken,
        refreshToken: d.refreshToken,
      });
    },
    [],
  );

  const logoutUser = useCallback(async () => {
    if (refreshToken) {
      try {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {}
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    persist(null);
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isModalOpen,
        modalTab,
        openModal,
        closeModal,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
