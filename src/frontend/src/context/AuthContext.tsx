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
  refreshToken as refreshAccessToken,
  register,
} from "@/src/lib/api/auth";
import type { AuthResponse, AuthenticatedUser } from "@/src/types/auth";

type AuthTab = "login" | "register";

type StoredSession = AuthResponse;

interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
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
  getValidAccessToken: () => Promise<string | null>;
  runWithAuth: <T>(operation: (accessToken: string) => Promise<T>) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "hb_auth";
const REFRESH_SKEW_MS = 60_000;

function persist(session: StoredSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function readStorage(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (
      !parsed.accessToken ||
      !parsed.refreshToken ||
      !parsed.accessTokenExpiresAt ||
      !parsed.user
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      accessTokenExpiresAt: parsed.accessTokenExpiresAt,
      user: parsed.user as AuthenticatedUser,
    };
  } catch {
    return null;
  }
}

function isSessionFresh(session: StoredSession | null, skewMs = REFRESH_SKEW_MS) {
  if (!session?.accessToken || !session.accessTokenExpiresAt) {
    return false;
  }

  const expiresAt = Date.parse(session.accessTokenExpiresAt);
  if (Number.isNaN(expiresAt)) {
    return false;
  }

  return expiresAt - Date.now() > skewMs;
}

function isUnauthorizedError(error: unknown) {
  return error instanceof SwaggerException && error.status === 401;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readStorage());
  const [authReady, setAuthReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<AuthTab>("login");
  const refreshPromiseRef = useRef<Promise<StoredSession | null> | null>(null);

  const applySession = useCallback((nextSession: StoredSession | null) => {
    setSession(nextSession);
    persist(nextSession);
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

  const refreshSession = useCallback(async () => {
    if (!session?.refreshToken) {
      clearSession();
      return null;
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = refreshAccessToken(session.refreshToken)
      .then(async (nextSession) => {
        const resolvedUser =
          nextSession.user.id > 0
            ? nextSession.user
            : nextSession.accessToken
              ? await getMe(nextSession.accessToken)
              : null;

        if (!resolvedUser) {
          clearSession();
          return null;
        }

        const normalizedSession: StoredSession = {
          ...nextSession,
          user: resolvedUser,
        };

        applySession(normalizedSession);
        return normalizedSession;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [applySession, clearSession, session]);

  const getValidAccessToken = useCallback(async () => {
    if (!session) {
      return null;
    }

    if (isSessionFresh(session)) {
      return session.accessToken;
    }

    const refreshedSession = await refreshSession();
    return refreshedSession?.accessToken ?? null;
  }, [refreshSession, session]);

  const runWithAuth = useCallback(
    async <T,>(operation: (accessToken: string) => Promise<T>) => {
      const token = await getValidAccessToken();
      if (!token) {
        throw new Error("Debes iniciar sesion para continuar.");
      }

      try {
        return await operation(token);
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          throw error;
        }

        const refreshedSession = await refreshSession();
        if (!refreshedSession?.accessToken) {
          throw new Error("Tu sesion expiro. Inicia sesion nuevamente.");
        }

        return operation(refreshedSession.accessToken);
      }
    },
    [getValidAccessToken, refreshSession],
  );

  const loginUser = useCallback(
    async (credentials: { email: string; password: string }) => {
      const nextSession = await login(credentials);
      applySession(nextSession);
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
      applySession(nextSession);
    },
    [applySession],
  );

  const logoutUser = useCallback(async () => {
    const currentRefreshToken = session?.refreshToken;

    clearSession();

    if (!currentRefreshToken) {
      return;
    }

    try {
      await logout(currentRefreshToken);
    } catch {
      // Ignore logout transport failures; local session is already cleared.
    }
  }, [clearSession, session]);

  useEffect(() => {
    let cancelled = false;

    async function initializeSession() {
      if (!session) {
        if (!cancelled) {
          setAuthReady(true);
        }
        return;
      }

      if (isSessionFresh(session, 0)) {
        if (!cancelled) {
          setAuthReady(true);
        }
        return;
      }

      await refreshSession();

      if (!cancelled) {
        setAuthReady(true);
      }
    }

    void initializeSession();

    return () => {
      cancelled = true;
    };
  }, [refreshSession, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken && session.user),
      authReady,
      isModalOpen,
      modalTab,
      openModal,
      closeModal,
      loginUser,
      registerUser,
      logoutUser,
      getValidAccessToken,
      runWithAuth,
    }),
    [
      authReady,
      closeModal,
      getValidAccessToken,
      isModalOpen,
      loginUser,
      logoutUser,
      modalTab,
      openModal,
      registerUser,
      runWithAuth,
      session,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
