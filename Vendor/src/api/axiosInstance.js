import axios from "axios";

// 👇 .env me VITE_API_BASE_URL=http://localhost:5000/api daal dena
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // 👈 zaroori hai kyuki backend httpOnly cookie ("token") use karta hai
});

// 👇 Agar kabhi cookie kaam na kare (jaise cross-domain issue), token ko
// localStorage se bhi bhej denge as fallback (backend Authorization header
// support karta ho to). Login response me token milta hai, isliye store kar rahe hain.
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("vendor_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const sessionId = localStorage.getItem("vendor_session_id");
    if (sessionId) {
        config.headers["x-session-id"] = sessionId;
    }

    return config;
});

// 👇 Agar 401 aaye (session expire), localStorage clear kar do.
// Redux slice khud logout state handle karega jab getMe fail hoga.
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("vendor_token");
            localStorage.removeItem("vendor_session_id");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;