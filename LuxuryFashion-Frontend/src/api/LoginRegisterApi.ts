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
   
    const response = await axios.post(`${baseApiUrl}/auth/login`, data);

    // Store token in memory
    if (response.data.token) {
      sessionStorage.setItem("authToken", response.data.token);
    }

    return response.data; // { message: "Login successful", token: "..." }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Login failed");
    }
    throw error;
  }
};

export const validateToken = async () => {
  const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");

  try {
    const response = await axios.post(
      `${baseApiUrl}/auth/validate`,
      {}, // empty body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // { message: "Token valid for user: ..." }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Token validation failed");
    }
    throw error;
  }
};