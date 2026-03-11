import {
  AuthClient,
  AuthResponseDto,
  LoginUserCommand,
  LogoutUserCommand,
  RefreshAccessTokenCommand,
  RegisterUserCommand,
} from "@/src/lib/api/generated/api-client";
import type { AuthResponse, AuthenticatedUser } from "@/src/types/auth";
import { API_BASE_URL } from "@/src/lib/constants";

function makeClient(accessToken?: string) {
  if (!accessToken) return new AuthClient(API_BASE_URL, { fetch });

  const authenticatedFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(input, { ...init, headers });
  };

  return new AuthClient(API_BASE_URL, { fetch: authenticatedFetch });
}

function mapAuthResponse(data: AuthResponseDto): AuthResponse {
  return {
    accessToken: data.accessToken ?? "",
    refreshToken: data.refreshToken ?? "",
    accessTokenExpiresAt: data.accessTokenExpiresAt
      ? data.accessTokenExpiresAt.toISOString()
      : "",
    user: {
      id: data.user?.id ?? 0,
      email: data.user?.email ?? "",
      firstName: data.user?.firstName ?? "",
      lastName: data.user?.lastName ?? "",
      fullName: data.user?.fullName ?? "",
      role: data.user?.role ?? "",
    },
  };
}

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await makeClient().login(
    new LoginUserCommand({
      email: credentials.email,
      password: credentials.password,
    }),
  );
  if (!res.success || !res.data) {
    throw new Error(res.errorMessage ?? "Login failed");
  }
  return mapAuthResponse(res.data);
}

export async function register(data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await makeClient().register(
    new RegisterUserCommand({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
    }),
  );
  if (!res.success || !res.data) {
    throw new Error(res.errorMessage ?? "Registration failed");
  }
  return mapAuthResponse(res.data);
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  const res = await makeClient().refresh(
    new RefreshAccessTokenCommand({ refreshToken: token }),
  );
  if (!res.success || !res.data) {
    throw new Error(res.errorMessage ?? "Token refresh failed");
  }
  return mapAuthResponse(res.data);
}

export async function logout(token: string): Promise<void> {
  await makeClient().logout(new LogoutUserCommand({ refreshToken: token }));
}

export async function getMe(
  accessToken: string,
): Promise<AuthenticatedUser | null> {
  try {
    const res = await makeClient(accessToken).me();
    if (!res.success || !res.data) return null;
    const d = res.data;
    return {
      id: d.id ?? 0,
      email: d.email ?? "",
      firstName: d.firstName ?? "",
      lastName: d.lastName ?? "",
      fullName: d.fullName ?? "",
      role: d.role ?? "",
    };
  } catch {
    return null;
  }
}
