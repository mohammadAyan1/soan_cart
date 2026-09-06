import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Vite
    withCredentials: true, // Cookie automatically send hogi
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api