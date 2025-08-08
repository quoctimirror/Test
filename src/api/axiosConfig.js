// src/api/axiosConfig.js
import axios from "axios";

// Hàm xác định URL của backend - có thể dễ dàng chuyển đổi giữa local và ngrok
const getBackendURL = () => {
  // Debug logging
  console.log("🔍 Backend URL Detection Debug:", {
    hostname: window.location.hostname,
    VITE_MODE: import.meta.env.VITE_MODE,
    VITE_BACKEND_NGROK_URL: import.meta.env.VITE_BACKEND_NGROK_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_USE_LOCAL_BACKEND: import.meta.env.VITE_USE_LOCAL_BACKEND,
  });

  // Nếu frontend chạy trên Vercel hoặc production, ưu tiên ngrok URL
  if (
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("ngrok")
  ) {
    const url =
      import.meta.env.VITE_BACKEND_NGROK_URL ||
      import.meta.env.VITE_API_BASE_URL;
    console.log("✅ Using Production/Vercel URL:", url);
    return url;
  }

  // Trong development, kiểm tra biến môi trường để quyết định dùng local hay ngrok
  if (import.meta.env.VITE_MODE === "development") {
    // Nếu VITE_USE_LOCAL_BACKEND = 'true', dùng local backend
    if (import.meta.env.VITE_USE_LOCAL_BACKEND === "true") {
      const url = "http://localhost:8081";
      console.log("✅ Using Local Backend URL (forced):", url);
      return url;
    }

    // Nếu có VITE_BACKEND_NGROK_URL, dùng ngrok (mặc định cho development)
    if (import.meta.env.VITE_BACKEND_NGROK_URL) {
      const url = import.meta.env.VITE_BACKEND_NGROK_URL;
      console.log("✅ Using Development Ngrok URL:", url);
      return url;
    }
  }

  // Fallback: dùng local backend
  const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
  console.log("✅ Using Fallback Backend URL:", url);
  return url;
};

// Khởi tạo instance của axios, không có gì thay đổi ở đây
const api = axios.create({
  baseURL: getBackendURL(),
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Header hữu ích để bỏ qua trang cảnh báo của ngrok
  },
});

// Request Interceptor: Đính kèm token vào mỗi request. Giữ nguyên, không thay đổi.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý làm mới token. Đây là nơi chúng ta sửa lỗi.
api.interceptors.response.use(
  (response) => response, // Nếu request thành công, trả về response luôn
  async (error) => {
    const originalRequest = error.config;

    // --- BẮT ĐẦU SỬA LỖI ---
    // Thêm điều kiện kiểm tra URL của request gốc.
    // Nếu lỗi 401 xảy ra ở chính endpoint đăng nhập hoặc làm mới token,
    // thì không được cố gắng làm mới token nữa. Đây là lỗi sai thông tin đăng nhập
    // hoặc refresh token đã hết hạn, không phải là access token hết hạn thông thường.
    const isAuthEndpoint =
      originalRequest.url.includes("/auth/authenticate") ||
      originalRequest.url.includes("/auth/refresh-token");

    if (isAuthEndpoint && error.response?.status === 401) {
      // Chỉ đơn giản là trả về lỗi để hàm catch trong component (ví dụ Login.js) có thể xử lý.
      return Promise.reject(error);
    }
    // --- KẾT THÚC SỬA LỖI ---

    // Logic làm mới token cho các API khác (ví dụ: /users/me, /products...)
    // Nếu lỗi là 401 và request này chưa được thử lại (_retry = false)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại để tránh vòng lặp vô hạn
      console.log("Access Token expired. Refreshing...");

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.error("No refresh token found. Logging out.");
          localStorage.clear();
          window.location.href = "/auth/login"; // Chuyển hướng về trang đăng nhập
          return Promise.reject(error);
        }

        // Gọi API để làm mới token
        const refreshResponse = await axios.post(
          `${getBackendURL()}/api/v1/auth/refresh-token`,
          { refreshToken }
        );
        const { accessToken: newAccessToken } = refreshResponse.data;

        // Lưu token mới và cập nhật header cho request gốc
        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Thử lại request ban đầu với token mới
        console.log("Token refreshed. Retrying original request...");
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu làm mới token cũng thất bại, logout người dùng
        console.error("Could not refresh token. Logging out.", refreshError);
        localStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    // Trả về lỗi cho các trường hợp khác (ví dụ lỗi 500, 404...)
    return Promise.reject(error);
  }
);

export default api;
