// src/lib/api.ts
import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

const baseURL = (
  isProd
    ? "/api" // always same-origin in prod
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

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
