import axios from "axios";
import { logout } from "../redux/Slices/authSlice";

const API_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Add token dynamically
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

// Response Interceptor: Handle Token Expiry
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log("Token expired. Logging out...");
                // 🔥 Dynamically import store inside the interceptor
                const { default: store } = await import("../redux/store");
                // Dispatch Redux logout action to sync state
                store.dispatch(logout());

                // Redirect using `window.location.href` (or better: use React Router)
                setTimeout(() => {
                    window.location.href = "/login";
                }, 100);
        } else {
            console.log("API instance error:", error);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;