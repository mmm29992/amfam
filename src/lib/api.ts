// src/lib/api.ts
import axios from "axios";

// Use '/api' if no NEXT_PUBLIC_API_URL is defined (to proxy through Next)
const baseURL = (process.env.NEXT_PUBLIC_API_URL || "/api") // Adjusted to '/api' (proxy)
  .replace(/\/+$/, "");

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

export default api;
