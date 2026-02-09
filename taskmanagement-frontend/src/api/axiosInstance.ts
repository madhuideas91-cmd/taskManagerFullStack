// // src/api/axiosInstance.ts
// import axios from "axios";
//
// // Axios instance
// const axiosInstance = axios.create({
//   baseURL: "", // Keep blank so you can call full URLs across services
//   timeout: 10000,
//     withCredentials: true,
// });
//
// // ✅ Attach JWT automatically to all requests
// axiosInstance.interceptors.request.use((config: any) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
//
// // ✅ Handle 401 globally
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     try {
//       if (error?.response?.status === 401) {
//         window.dispatchEvent(
//           new CustomEvent("apiUnauthorized", {
//             detail: { message: "Session expired. Please login again." },
//           })
//         );
//         localStorage.removeItem("token");
//       }
//     } catch (e) {
//       // ignore
//     }
//     return Promise.reject(error);
//   }
//
//
// );
//
// export default axiosInstance;

// src/api/axiosInstance.ts
import axios from "axios";

// Axios instance
const axiosInstance = axios.create({
  baseURL: "http://77.37.47.79:8080", // ✅ set backend base URL
  //baseURL: process.env.REACT_APP_API_URL ||  "/api",
  timeout: 10000,
  withCredentials: true,

});

// ✅ Attach JWT automatically to all requests
axiosInstance.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle 401 globally
axiosInstance.interceptors.response.use(
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


export default axiosInstance;
