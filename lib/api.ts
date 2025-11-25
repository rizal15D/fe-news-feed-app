// /lib/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: false,
});

// 🟦 Auto-attach Token (Bearer)
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🟥 Global Error Handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Token invalid/expired → force logout
    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
