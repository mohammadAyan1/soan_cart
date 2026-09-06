import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Vite
    withCredentials: true, // Cookie automatically send hogi
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.log("Unauthorized");
                    // logout ya login page redirect
                    break;

                case 403:
                    console.log("Forbidden");
                    break;

                case 500:
                    console.log("Internal Server Error");
                    break;

                default:
                    console.log(error.response.data);
            }
        } else {
            console.log("Network Error:", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;