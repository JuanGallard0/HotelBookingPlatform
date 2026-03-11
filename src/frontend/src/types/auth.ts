export interface AuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: AuthenticatedUser;
}
