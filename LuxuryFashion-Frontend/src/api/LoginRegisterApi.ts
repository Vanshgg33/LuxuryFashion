// src/api.ts
import axios from "axios";
import { baseApiUrl } from "./base";

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
}

// --- LOGIN API ---
export const loginUser = async (data: LoginRequest) => {
  try {
    const response = await axios.post(
      `${baseApiUrl}/auth/login`,
      data,
      { withCredentials: true } // ensures JWT cookie is stored
    );
    return response.data; // { message: "Login successful" }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Login failed");
    }
    throw error;
  }
};


// --- TOKEN VALIDATION ---
export const validateToken = async () => {
  try {
    const response = await axios.post(
      `${baseApiUrl}/auth/validate`,
      {},
      { withCredentials: true } // sends stored JWT cookie automatically
    );
    return response.data; // { message: "Token valid for user: ..." }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Token validation failed");
    }
    throw error;
  }
};
