import { AuthClient } from "@/lib/api/api-client";
import type { AuthResponseDto, AuthenticatedUserDto } from "@/types/auth";
import { API_BASE_URL } from "@/lib/constants";

function makeClient() {
  return new AuthClient(API_BASE_URL, { fetch });
}

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponseDto> {
  const res = await makeClient().login({
    email: credentials.email,
    password: credentials.password,
  });
  if (!res.success || !res.data) {
    throw new Error(res.errorMessage ?? "Login failed");
  }
  return res.data as AuthResponseDto;
}

export async function register(data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<AuthResponseDto> {
  const res = await makeClient().register({
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    password: data.password,
  });
  if (!res.success || !res.data) {
    throw new Error(res.errorMessage ?? "Registration failed");
  }
  return res.data as AuthResponseDto;
}

export async function refreshToken(token: string): Promise<AuthResponseDto> {
  const res = await makeClient().refreshToken({ refreshToken: token });
  if (!res.success || !res.data) {
    throw new Error(res.errorMessage ?? "Token refresh failed");
  }
  return res.data as AuthResponseDto;
}

export async function logout(token: string): Promise<void> {
  await makeClient().logout({ refreshToken: token });
}

export async function getMe(): Promise<AuthenticatedUserDto | null> {
  try {
    const res = await makeClient().getMe();
    if (!res.success) return null;
    return res.data as AuthenticatedUserDto ?? null;
  } catch {
    return null;
  }
}
