import axiosInstance from "./axiosInstance";

const API_BASE = "http://77.37.47.79:8080/api/auth";
//const API_BASE = "/api/auth"; // ✅ gateway-relative
//const API_BASE = "/auth";

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;   // 🔥 NEW
  userId: number; // ✅ NEW
}

export const signupUser = (data: SignupRequest) => {
  return axiosInstance.post(`${API_BASE}/signup`, data);
};

export const loginUser = (data: AuthRequest) => {
  return axiosInstance.post<AuthResponse>(`${API_BASE}/login`, data);
};

export const getProfile = (token: string) => {
  return axiosInstance.get(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

