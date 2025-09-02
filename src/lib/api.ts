// src/lib/api.ts
import axios from "axios";

const baseURL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  withCredentials: true, // keeps cookies/tokens if you use them
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);


// Optional: add interceptors for auth tokens
// api.interceptors.request.use((config) => {
//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
