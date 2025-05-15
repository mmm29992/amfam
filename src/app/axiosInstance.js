// frontend/axiosInstance.js
import axios from "axios";

// Create and export an Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // Your backend URL (adjust if necessary)
  headers: {
    "Content-Type": "application/json", // Set the content type to JSON
  },
  timeout: 5000, // Example timeout value (5 seconds)
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Attach token to request headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      window.location.href = "/login";
    }
    console.error("Error:", error.response); // Optionally log the error to console
    return Promise.reject(error);
  }
);

export default axiosInstance;
