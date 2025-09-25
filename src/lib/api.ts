// src/lib/api.ts
import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

// Prefer NEXT_PUBLIC_API_URL everywhere (prod & dev). Fall back to /api in prod only if not set.
const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")}/api`
  : isProd
  ? "/api" // requires Next.js rewrite if used
  : "http://localhost:5001/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
