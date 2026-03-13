"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SwaggerException } from "@/src/lib/api/generated/api-client";
import {
  getMe,
  login,
  logout,
  refreshSession,
  register,
  type AuthSession,
} from "@/src/lib/api/auth";
import type { AuthenticatedUser } from "@/src/types/auth";

type AuthTab = "login" | "register";

type SessionState = {
  user: AuthenticatedUser;
  accessTokenExpiresAt: string | null;
};

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  authReady: boolean;
  isModalOpen: boolean;
  modalTab: AuthTab;
  openModal: (tab?: AuthTab) => void;
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
  refreshUserSession: () => Promise<boolean>;
  runWithAuth: <T>(operation: () => Promise<T>) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isUnauthorizedError(error: unknown) {
  return error instanceof SwaggerException && error.status === 401;
}

function toSessionState(session: AuthSession): SessionState {
  return {
    user: session.user,
    accessTokenExpiresAt: session.accessTokenExpiresAt,
  };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<AuthTab>("login");
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const applySession = useCallback((nextSession: SessionState | null) => {
    setSession(nextSession);
  }, []);

  const clearSession = useCallback(() => {
    applySession(null);
  }, [applySession]);

  const openModal = useCallback((tab: AuthTab = "login") => {
    setModalTab(tab);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const refreshUserSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = refreshSession()
      .then((nextSession) => {
        applySession(toSessionState(nextSession));
        return true;
      })
      .catch(() => {
        clearSession();
        return false;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [applySession, clearSession]);

  const runWithAuth = useCallback(
    async <T,>(operation: () => Promise<T>) => {
      if (!session?.user) {
        const refreshed = await refreshUserSession();
        if (!refreshed) {
          throw new Error("Debes iniciar sesion para continuar.");
        }
      }

      try {
        return await operation();
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          throw error;
        }

        const refreshed = await refreshUserSession();
        if (!refreshed) {
          throw new Error("Tu sesion expiro. Inicia sesion nuevamente.");
        }

        return operation();
      }
    },
    [refreshUserSession, session?.user],
  );

  const loginUser = useCallback(
    async (credentials: { email: string; password: string }) => {
      const nextSession = await login(credentials);
      applySession(toSessionState(nextSession));
    },
    [applySession],
  );

  const registerUser = useCallback(
    async (data: {
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    }) => {
      const nextSession = await register(data);
      applySession(toSessionState(nextSession));
    },
    [applySession],
  );

  const logoutUser = useCallback(async () => {
    clearSession();
    await logout();
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function initializeSession() {
      try {
        const refreshed = await refreshUserSession();

        if (cancelled) {
          return;
        }

        if (refreshed) {
          return;
        }

        const currentUser = await getMe();

        if (cancelled) {
          return;
        }

        if (currentUser) {
          applySession({
            user: currentUser,
            accessTokenExpiresAt: null,
          });
          return;
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    }

    void initializeSession();

    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession, refreshUserSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      authReady,
      isModalOpen,
      modalTab,
      openModal,
      closeModal,
      loginUser,
      registerUser,
      logoutUser,
      refreshUserSession,
      runWithAuth,
    }),
    [
      authReady,
      closeModal,
      isModalOpen,
      loginUser,
      logoutUser,
      modalTab,
      openModal,
      refreshUserSession,
      registerUser,
      runWithAuth,
      session,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
