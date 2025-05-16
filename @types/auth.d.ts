import { User } from "./db";

export interface RegisterResponse {
  status: string;
  message: string;
  code: number;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  } | null;
  errors?: Record<'email' | 'password' | 'username', string[]> | null
}

export interface BadRegisterResponse {
  status: string;
  message: string;
  code: number;
  data: null,
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}

export interface OTPResponse { message: string | null, access_token: string | null, refresh_token: string | null, error: string | null}

export interface ResendOTPResponse { message: string | null, error: string | null }

export interface ResetPasswordResponse { message: string | null, error: string | null }

export interface ResetPasswordConfirmResponse { 
  message: string | null, 
  error: string | null, 
  access_token: string | null, 
  refresh_token: string | null 
}
