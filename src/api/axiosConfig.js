// src/api/axiosConfig.js
import axios from 'axios';

// Determine which backend URL to use
const getBackendURL = () => {
    // Production mode (Vercel deployment)
    if (import.meta.env.VITE_MODE === 'production' && import.meta.env.VITE_BACKEND_NGROK_URL) {
        return import.meta.env.VITE_BACKEND_NGROK_URL;
    }
    // If accessing via ngrok, use backend ngrok URL
    if (window.location.hostname.includes('ngrok')) {
        return import.meta.env.VITE_BACKEND_NGROK_URL || 'http://localhost:8081';
    }
    // Otherwise use local backend
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
};

const api = axios.create({
    baseURL: getBackendURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động đính kèm token vào mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor để tự động làm mới token khi gặp lỗi 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log("Access Token expired. Refreshing...");

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Nếu không có refresh token, logout
                    localStorage.clear();
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }

                // Gọi API làm mới token bằng axios gốc
                const refreshResponse = await axios.post(`${getBackendURL()}/api/v1/auth/refresh-token`, { refreshToken });
                const { accessToken: newAccessToken } = refreshResponse.data;

                localStorage.setItem('accessToken', newAccessToken);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Thử lại request ban đầu
                return api(originalRequest);
            } catch (refreshError) {
                // Nếu làm mới token cũng thất bại, logout
                console.error("Could not refresh token. Logging out.", refreshError);
                localStorage.clear();
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;