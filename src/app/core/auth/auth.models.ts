export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresMfa: boolean;
  tempToken: string;
}

export interface VerifyMfaRequest {
  code: string;
  tempToken: string;
}

export interface AuthResponse {
  accessToken: string;
  tenantId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
