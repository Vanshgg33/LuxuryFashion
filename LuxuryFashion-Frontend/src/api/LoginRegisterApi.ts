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

// --- SIGNUP API ---
export const signupUser = async (data: SignupRequest) => {
  try {
    const response = await axios.post(
      `${baseApiUrl}/users/register`,
      data,
      { withCredentials: true }
    );
    return response.data; // expected: { message: "User registered successfully" }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Signup failed");
    }
    throw error;
  }
};

// --- GOOGLE SOCIAL LOGIN ---
export const socialLogin = async () => {
  try {
    // Redirect user to backend OAuth2 login endpoint
    window.location.href = `${baseApiUrl}/oauth2/authorization/google`;
  } catch (error) {
    console.error("OAuth login failed:", error);
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
