import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple redirects
let isRedirecting = false;

// Request Interceptor to Add Token Dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to Handle Invalid Tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 403 || error.response.status === 401) && (window.location.pathname === '/login' || window.location.hash === '#/login')) {
      console.log("Token expired. Logging out...");
      localStorage.removeItem("accessToken");
        window.location.href = "/login"; // Redirect to login
    } else {
      console.log("API instance error:", error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
