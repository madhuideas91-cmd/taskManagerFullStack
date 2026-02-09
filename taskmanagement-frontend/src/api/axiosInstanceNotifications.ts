// src/api/axiosInstanceNotifications.ts
import axios from "axios";

// Axios instance for notifications microservice
const axiosNotifInstance = axios.create({
  baseURL: "http://77.37.47.79:8080", // ✅ notifications backend
  withCredentials: true,
  timeout: 10000
  // if backend uses cookies
  // baseURL: "/api/notifications",
  //baseURL: process.env.REACT_APP_API_URL || "/api",

});

// Attach JWT automatically to all requests
axiosNotifInstance.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
axiosNotifInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(
        new CustomEvent("apiUnauthorized", {
          detail: { message: "Session expired. Please login again." },
        })
      );
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default axiosNotifInstance;
