// src/api.ts
import axios, { type AxiosError } from "axios";
import { baseApiUrl } from "./base";
import { logger } from '../utils/logger';

// --- Interfaces ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  token?: string;
  user?: unknown;
}

export const registerUser = async (data: SignupRequest): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>(`${baseApiUrl}/auth/register`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    logger.error('Registration failed', axiosError);
    if (axiosError.response) {
      throw new Error(axiosError.response.data?.error || "Registration failed");
    }
    throw error;
  }
};



// --- LOGIN API ---
export interface LoginResponse {
  message: string;
  token: string;
  user?: unknown;
}

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${baseApiUrl}/auth/login`, data);

    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
    }

    return response.data; // { message: "Login successful", token: "..." }
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    logger.error('Login failed', axiosError);
    if (axiosError.response) {
      throw new Error(axiosError.response.data?.error || "Login failed");
    }
    throw error;
  }
};

export interface ValidateTokenResponse {
  message: string;
  user?: {
    id: number | string;
    email: string;
    name: string;
    role?: string;
    user?: unknown;
  };
}

export const validateToken = async (): Promise<ValidateTokenResponse> => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No token found in localStorage");

  try {
    const response = await axios.post<ValidateTokenResponse>(
      `${baseApiUrl}/auth/validate`,
      {}, // empty body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // { message: "Token valid for user: ..." }
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    logger.error('Token validation failed', axiosError);
    if (axiosError.response) {
      throw new Error(axiosError.response.data?.error || "Token validation failed");
    }
    throw error;
  }
};

// --- OAUTH API ---
export interface OAuthUserResponse {
  message: string;
  token: string;
  user: {
    id: number | string;
    email: string;
    name: string;
    role?: string;
    gender?: string;
    phoneNumber?: string | null;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    } | null;
  };
  cart?: {
    id: number;
    cartItems: Array<{
      id: number;
      product: unknown;
      quantity: number;
      price: number;
      size?: string;
    }>;
    totalPrice: number;
    totalItems?: number;
  } | null;
}

export const getOAuthUser = async (token?: string): Promise<OAuthUserResponse> => {
  const authToken = token || localStorage.getItem("authToken");
  if (!authToken) throw new Error("No token provided");

  try {
    const response = await axios.get<OAuthUserResponse>(
      `${baseApiUrl}/auth/oauth/user`,
      {
        params: { token: authToken },
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    logger.error('OAuth user fetch failed', axiosError);
    if (axiosError.response) {
      throw new Error(axiosError.response.data?.error || axiosError.response.data?.message || "Failed to get OAuth user data");
    }
    throw error;
  }
};