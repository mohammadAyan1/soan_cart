import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceHeaders } from "@/utils/deviceInfo";

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || "https://sounkart.rambhaji.com",
    timeout: 40000,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

let onUnauthorizedCallback = null;
let isLoggingOut = false;

export const setOnUnauthorizedCallback = (callback) => {
    onUnauthorizedCallback = callback;
};

const triggerLogoutOnce = (message) => {
    if (isLoggingOut) return;
    isLoggingOut = true;
    if (onUnauthorizedCallback) {
        onUnauthorizedCallback(message);
    }
    setTimeout(() => {
        isLoggingOut = false;
    }, 4000);
};

// Request Interceptor
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const guestId = await AsyncStorage.getItem("guestId");
            const sessionId = await AsyncStorage.getItem("sessionId");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            if (guestId) {
                config.headers["x-guest-id"] = guestId;
            }

            if (sessionId) {
                config.headers["x-session-id"] = sessionId;
            }

            try {
                const deviceHeaders = await getDeviceHeaders();
                Object.assign(config.headers, deviceHeaders);
            } catch (deviceError) {
                // Ignore device headers error if any
            }

            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - Auto Token Refresh & Session Logout
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            !error.response ||
            error.response.status !== 401 ||
            originalRequest?.url?.includes("/api/auth/login") ||
            originalRequest?.url?.includes("/api/auth/refresh-token")
        ) {
            return Promise.reject(error);
        }

        // ⚠️ CRITICAL: Check if request actually sent an Authorization header
        const hasAuthHeader =
            !!originalRequest?.headers?.Authorization ||
            !!originalRequest?.headers?.authorization;

        if (!hasAuthHeader) {
            // Unauthenticated request (guest user). Never trigger session expired!
            return Promise.reject(error);
        }

        const storedToken = await AsyncStorage.getItem("token");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");

        // If user is not logged in at all, don't show any session expired alert!
        if (!storedToken && !storedRefreshToken) {
            return Promise.reject(error);
        }

        // 1) Device remote logout detection:
        // Agar doosre device se Manage Devices me jaake logout kiya hai:
        const isSessionRevoked = error.response?.data?.sessionExpired === true;
        if (isSessionRevoked) {
            await AsyncStorage.multiRemove(["token", "refreshToken", "sessionId", "user"]);
            triggerLogoutOnce(
                error.response?.data?.message || "Aapka session kisi doosre device se logout kar diya gaya hai."
            );
            return Promise.reject(error);
        }

        // 2) Prevent infinite retry loops
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // 3) Queue concurrent requests while token is refreshing
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            if (!storedRefreshToken) {
                // User had a legacy token that expired without refresh token
                await AsyncStorage.multiRemove(["token", "refreshToken", "sessionId", "user"]);
                triggerLogoutOnce("Session expire ho gaya hai, dobara login karein.");
                processQueue(error, null);
                return Promise.reject(error);
            }

            const sessionId = await AsyncStorage.getItem("sessionId");
            const baseURL = api.defaults.baseURL || "https://sounkart.rambhaji.com";
            const refreshRes = await axios.post(
                `${baseURL}/api/auth/refresh-token`,
                { refreshToken: storedRefreshToken },
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(sessionId ? { "x-session-id": sessionId } : {}),
                    },
                }
            );

            const newAccessToken = refreshRes.data?.accessToken || refreshRes.data?.token;
            if (!newAccessToken) {
                throw new Error("No token returned from refresh API");
            }

            await AsyncStorage.setItem("token", newAccessToken);
            if (refreshRes.data?.sessionId) {
                await AsyncStorage.setItem("sessionId", refreshRes.data.sessionId);
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return api(originalRequest);
        } catch (refreshErr) {
            processQueue(refreshErr, null);
            await AsyncStorage.multiRemove(["token", "refreshToken", "sessionId", "user"]);
            triggerLogoutOnce("Session expire ho gaya hai, dobara login karein.");
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
