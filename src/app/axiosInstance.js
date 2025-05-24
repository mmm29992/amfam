// frontend/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // Change to your deployed URL in prod
  withCredentials: true, // 🔐 Needed for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// You can remove the request interceptor entirely

// Optional: keep this response interceptor for 401 redirects
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    }
    console.error("Error:", error.response);
    return Promise.reject(error);
  }
);

export default axiosInstance;
