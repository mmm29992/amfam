// src/lib/api.ts
import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

// Prefer NEXT_PUBLIC_API_URL everywhere; append /api here
const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")}/api`
  : isProd
  ? "/api" // only works if you have a Next.js rewrite; otherwise the env var will be used
  : "http://localhost:5001/api";

const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
