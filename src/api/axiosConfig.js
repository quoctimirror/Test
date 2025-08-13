// src/api/axiosConfig.js
import axios from "axios";

// ============= REMOTE BACKEND INSTANCE =============
// Instance cho remote backend (deployed) - dùng cho login, auth, etc.
const remoteApi = axios.create({
  baseURL: import.meta.env.VITE_REMOTE_API_BASE_URL || 'https://your-deployed-backend.com',
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Request Interceptor cho remote API
remoteApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor cho remote API
remoteApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const isAuthEndpoint =
      originalRequest.url.includes("/auth/authenticate") ||
      originalRequest.url.includes("/auth/refresh-token");

    if (isAuthEndpoint && error.response?.status === 401) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Access Token expired. Refreshing...");

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.error("No refresh token found. Logging out.");
          localStorage.clear();
          window.location.href = "/auth/login";
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_REMOTE_API_BASE_URL}/api/v1/auth/refresh-token`,
          { refreshToken }
        );
        const { accessToken: newAccessToken } = refreshResponse.data;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        console.log("Token refreshed. Retrying original request...");
        return remoteApi(originalRequest);
      } catch (refreshError) {
        console.error("Could not refresh token. Logging out.", refreshError);
        localStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============= LOCAL BACKEND INSTANCE =============

// Hàm kiểm tra port có sẵn
const checkPortAvailable = async (port) => {
  try {
    const response = await fetch(`http://localhost:${port}/api/v1/health`, {
      method: 'GET',
      timeout: 2000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Hàm auto-detect backend port
const detectBackendPort = async () => {
  const portsToCheck = [8080, 8081, 3000, 5000];
  
  for (const port of portsToCheck) {
    console.log(`🔍 Checking port ${port}...`);
    const isAvailable = await checkPortAvailable(port);
    if (isAvailable) {
      console.log(`✅ Found backend on port ${port}`);
      return port;
    }
  }
  
  console.log("❌ No backend detected on common ports");
  return 8081; // fallback
};

// Hàm xác định URL của backend - có thể dễ dàng chuyển đổi giữa local và ngrok
const getBackendURL = async () => {
  // Debug logging
  console.log("🔍 Backend URL Detection Debug:", {
    hostname: window.location.hostname,
    VITE_MODE: import.meta.env.VITE_MODE,
    VITE_BACKEND_NGROK_URL: import.meta.env.VITE_BACKEND_NGROK_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_USE_LOCAL_BACKEND: import.meta.env.VITE_USE_LOCAL_BACKEND,
    VITE_LOCAL_BACKEND_PORT: import.meta.env.VITE_LOCAL_BACKEND_PORT,
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
    // Nếu có VITE_BACKEND_NGROK_URL, dùng ngrok
    if (import.meta.env.VITE_BACKEND_NGROK_URL) {
      const url = import.meta.env.VITE_BACKEND_NGROK_URL;
      console.log("✅ Using Development Ngrok URL:", url);
      return url;
    }

    // Nếu VITE_USE_LOCAL_BACKEND = 'true', dùng port được chỉ định
    if (import.meta.env.VITE_USE_LOCAL_BACKEND === "true") {
      const port = import.meta.env.VITE_LOCAL_BACKEND_PORT || "8081";
      const url = `http://localhost:${port}`;
      console.log("✅ Using Local Backend URL (forced):", url);
      return url;
    }

    // Auto-detect port trong development
    console.log("🚀 Auto-detecting backend port...");
    const detectedPort = await detectBackendPort();
    const url = `http://localhost:${detectedPort}`;
    console.log("✅ Using Auto-detected Backend URL:", url);
    return url;
  }

  // Fallback: dùng local backend với port được chỉ định
  const fallbackPort = import.meta.env.VITE_LOCAL_BACKEND_PORT || "8081";
  const url = import.meta.env.VITE_API_BASE_URL || `http://localhost:${fallbackPort}`;
  console.log("✅ Using Fallback Backend URL:", url);
  return url;
};

// Khởi tạo instance của axios với async baseURL
let baseURL = "http://localhost:8081"; // default fallback

// Async function để set baseURL
const initializeAPI = async () => {
  try {
    baseURL = await getBackendURL();
    api.defaults.baseURL = baseURL;
    console.log("🔧 API baseURL set to:", baseURL);
  } catch (error) {
    console.error("❌ Error initializing API:", error);
    // Keep default fallback
  }
};

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Header hữu ích để bỏ qua trang cảnh báo của ngrok
  },
});

// Initialize API when module loads
initializeAPI();

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

// ============= EXPORTS =============
export default api; // Local backend instance (default export)
export { remoteApi }; // Remote backend instance (named export)
