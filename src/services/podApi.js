import axios from "axios";

// Base URL configuration
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE_URL = isLocalDev
  ? '' // Use relative URLs through Vite proxy
  : (import.meta.env.VITE_API_BASE_URL || "https://nsa4fef6um.ap-southeast-1.awsapprunner.com");

const AUTH_BASE_URL = isLocalDev
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || "https://nsa4fef6um.ap-southeast-1.awsapprunner.com");

const REFRESH_TOKEN_ENDPOINT = `${AUTH_BASE_URL}/api/v1/auth/refresh-token`;

// Create axios instance for POD API (aligned with main api.js)
const podApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

// Request interceptor - add auth token + X-User-Id
podApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // Add X-User-Id header from JWT token
      try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        if (payload.userId) {
          config.headers["X-User-Id"] = payload.userId.toString();
        }
      } catch (decodeError) {
        // Silently ignore decode errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors with token refresh
podApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config || {};
    const requestUrl = originalRequest.url || "";

    const isAuthEndpoint =
      requestUrl.includes("/auth/authenticate") ||
      requestUrl.includes("/auth/refresh-token");

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(REFRESH_TOKEN_ENDPOINT, {
          refreshToken,
        });
        const { accessToken: newAccessToken } = refreshResponse.data || {};

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return podApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== PARTNER API ====================
export const partnerApi = {
  // Get all partners with pagination and filters
  getAll: (params = {}) =>
    podApi.get("/api/v1/admin/pod-partners", { params }),

  // Get partner by ID
  getById: (partnerId) =>
    podApi.get(`/api/v1/admin/pod-partners/${partnerId}`),

  // Get partner detail with statistics
  getDetail: (partnerId) =>
    podApi.get(`/api/v1/admin/pod-partners/${partnerId}/detail`),

  // Create new partner
  create: (data) =>
    podApi.post("/api/v1/admin/pod-partners", data),

  // Update partner
  update: (partnerId, data) =>
    podApi.put(`/api/v1/admin/pod-partners/${partnerId}`, data),

  // Update partner status
  updateStatus: (partnerId, status) =>
    podApi.patch(`/api/v1/admin/pod-partners/${partnerId}/status`, { status }),

  // Delete partner (soft delete)
  delete: (partnerId) =>
    podApi.delete(`/api/v1/admin/pod-partners/${partnerId}`),
};

// ==================== POD API ====================
export const podApi_pods = {
  // Get all PODs with pagination and filters
  getAll: (params = {}) =>
    podApi.get("/api/v1/admin/pods", { params }),

  // Get POD by ID
  getById: (podId) =>
    podApi.get(`/api/v1/admin/pods/${podId}`),

  // Get POD detail with statistics
  getDetail: (podId) =>
    podApi.get(`/api/v1/admin/pods/${podId}/detail`),

  // Create new POD
  create: (data) =>
    podApi.post("/api/v1/admin/pods", data),

  // Update POD
  update: (podId, data) =>
    podApi.put(`/api/v1/admin/pods/${podId}`, data),

  // Update POD status
  updateStatus: (podId, status) =>
    podApi.patch(`/api/v1/admin/pods/${podId}/status`, { status }),

  // Assign products to POD
  assignProducts: (podId, productIds) =>
    podApi.put(`/api/v1/admin/pods/${podId}/products`, { productIds }),

  // Remove product from POD
  removeProduct: (podId, productId) =>
    podApi.delete(`/api/v1/admin/pods/${podId}/products/${productId}`),

  // Delete POD (soft delete)
  delete: (podId) =>
    podApi.delete(`/api/v1/admin/pods/${podId}`),
};

// ==================== QR CODE API ====================
export const qrCodeApi = {
  // Get all QR codes with pagination and filters
  getAll: (params = {}) =>
    podApi.get("/api/v1/admin/pod-qrcodes", { params }),

  // Get QR code by ID
  getById: (qrCodeId) =>
    podApi.get(`/api/v1/admin/pod-qrcodes/${qrCodeId}`),

  // Get QR code by short code
  getByShortCode: (shortCode) =>
    podApi.get(`/api/v1/admin/pod-qrcodes/code/${shortCode}`),

  // Get QR code detail with statistics
  getDetail: (qrCodeId) =>
    podApi.get(`/api/v1/admin/pod-qrcodes/${qrCodeId}/detail`),

  // Get all QR codes for a POD
  getByPodId: (podId) =>
    podApi.get(`/api/v1/admin/pod-qrcodes/pod/${podId}`),

  // Create single QR code
  create: (data) =>
    podApi.post("/api/v1/admin/pod-qrcodes", data),

  // Batch create QR codes
  createBatch: (data) =>
    podApi.post("/api/v1/admin/pod-qrcodes/batch", data),

  // Deactivate QR code
  deactivate: (qrCodeId) =>
    podApi.patch(`/api/v1/admin/pod-qrcodes/${qrCodeId}/deactivate`),

  // Reactivate QR code
  reactivate: (qrCodeId) =>
    podApi.patch(`/api/v1/admin/pod-qrcodes/${qrCodeId}/reactivate`),

  // Regenerate QR code image
  regenerateImage: (qrCodeId) =>
    podApi.post(`/api/v1/admin/pod-qrcodes/${qrCodeId}/regenerate-image`),
};

// ==================== SCAN API (Admin) ====================
export const scanApi = {
  // Get all scans with pagination and filters
  getAll: (params = {}) =>
    podApi.get("/api/v1/admin/pod-qrcodes/scans", { params }),

  // Get scan by ID
  getById: (scanId) =>
    podApi.get(`/api/v1/admin/pod-qrcodes/scans/${scanId}`),

  // Get scans for a specific QR code
  getByQrCodeId: (qrCodeId, params = {}) =>
    podApi.get(`/api/v1/admin/pod-qrcodes/${qrCodeId}/scans`, { params }),
};

// ==================== USER ATTRIBUTION API ====================
export const userAttributionApi = {
  // Get all user attributions with pagination and filters
  getAll: (params = {}) =>
    podApi.get("/api/v1/admin/pod-user-attributions", { params }),

  // Get user attribution by ID
  getById: (id) =>
    podApi.get(`/api/v1/admin/pod-user-attributions/${id}`),

  // Get user attributions by partner
  getByPartner: (partnerId, params = {}) =>
    podApi.get(`/api/v1/admin/pod-user-attributions/partner/${partnerId}`, { params }),
};

// ==================== COMMISSION API ====================
export const commissionApi = {
  // Get all commissions with pagination and filters
  getAll: (params = {}) =>
    podApi.get("/api/v1/admin/pod-commissions", { params }),

  // Get commission by ID
  getById: (commissionId) =>
    podApi.get(`/api/v1/admin/pod-commissions/${commissionId}`),

  // Get commission detail with attributions and customer info
  getDetail: (commissionId) =>
    podApi.get(`/api/v1/admin/pod-commissions/${commissionId}/detail`),

  // Generate commission for a partner and period
  generate: (data) =>
    podApi.post("/api/v1/admin/pod-commissions/generate", data),

  // Batch generate commissions
  generateBatch: (data) =>
    podApi.post("/api/v1/admin/pod-commissions/generate/batch", data),

  // Approve commission
  approve: (commissionId) =>
    podApi.post(`/api/v1/admin/pod-commissions/${commissionId}/approve`),

  // Adjust commission
  adjust: (commissionId, data) =>
    podApi.post(`/api/v1/admin/pod-commissions/${commissionId}/adjust`, data),

  // Mark commission as paid
  pay: (commissionId, data) =>
    podApi.post(`/api/v1/admin/pod-commissions/${commissionId}/pay`, data),
};

// ==================== ADMIN DASHBOARD API ====================
export const adminDashboardApi = {
  // Get full dashboard data
  getDashboard: () =>
    podApi.get("/api/v1/admin/pod-dashboard"),

  // Get dashboard summary (lightweight)
  getSummary: () =>
    podApi.get("/api/v1/admin/pod-dashboard/summary"),
};

// ==================== PARTNER PORTAL API ====================
export const partnerPortalApi = {
  // Get partner profile (for logged in partner)
  getProfile: () =>
    podApi.get("/api/v1/partner/profile"),

  // Get partner dashboard
  getDashboard: () =>
    podApi.get("/api/v1/partner/dashboard"),

  // Get partner's PODs
  getMyPods: (params = {}) =>
    podApi.get("/api/v1/partner/pods", { params }),

  // Get partner's QR codes
  getMyQrCodes: (params = {}) =>
    podApi.get("/api/v1/partner/qr-codes", { params }),

  // Get partner's scans
  getMyScans: (params = {}) =>
    podApi.get("/api/v1/partner/scans", { params }),

  // Get partner's user attributions (which users are linked to partner's PODs)
  getMyUserAttributions: (params = {}) =>
    podApi.get("/api/v1/partner/user-attributions", { params }),

  // Get partner's commissions
  getMyCommissions: (params = {}) =>
    podApi.get("/api/v1/partner/commissions", { params }),

  // Get scan statistics
  getScanStats: (startDate, endDate) =>
    podApi.get("/api/v1/partner/stats/scans", { params: { startDate, endDate } }),

};

// ==================== PHYGITAL PARTNER API ====================
export const phygitalPartnerApi = {
  getDashboard: () =>
    podApi.get("/api/v1/partner/phygital/dashboard"),

  getSalesReport: (startDate, endDate) =>
    podApi.get("/api/v1/partner/phygital/reports/sales", { params: { startDate, endDate } }),
};

// ==================== PHYGITAL INVENTORY API ====================
export const phygitalInventoryApi = {
  getAll: (params = {}) =>
    podApi.get("/api/v1/partner/phygital/inventory", { params }),

  getById: (id) =>
    podApi.get(`/api/v1/partner/phygital/inventory/${id}`),

  updatePrice: (id, data) =>
    podApi.put(`/api/v1/partner/phygital/inventory/${id}/price`, data),

  adjustStock: (id, data) =>
    podApi.post(`/api/v1/partner/phygital/inventory/${id}/adjust`, data),

  getLowStock: () =>
    podApi.get("/api/v1/partner/phygital/inventory/low-stock"),

  getMovements: (id, params = {}) =>
    podApi.get(`/api/v1/partner/phygital/inventory/${id}/movements`, { params }),
};

// ==================== PHYGITAL WHOLESALE API ====================
export const phygitalWholesaleApi = {
  getAll: (params = {}) =>
    podApi.get("/api/v1/partner/phygital/wholesale-orders", { params }),

  getById: (id) =>
    podApi.get(`/api/v1/partner/phygital/wholesale-orders/${id}`),

  create: (data) =>
    podApi.post("/api/v1/partner/phygital/wholesale-orders", data),

  submit: (id) =>
    podApi.post(`/api/v1/partner/phygital/wholesale-orders/${id}/submit`),

  cancel: (id, reason) =>
    podApi.post(`/api/v1/partner/phygital/wholesale-orders/${id}/cancel`, null, { params: { reason } }),

  confirmDelivery: (id) =>
    podApi.post(`/api/v1/partner/phygital/wholesale-orders/${id}/confirm-delivery`),
};

// ==================== PHYGITAL SALES API ====================
export const phygitalSalesApi = {
  getAll: (params = {}) =>
    podApi.get("/api/v1/partner/phygital/sales", { params }),

  getById: (id) =>
    podApi.get(`/api/v1/partner/phygital/sales/${id}`),

  create: (data) =>
    podApi.post("/api/v1/partner/phygital/sales", data),

  confirm: (id) =>
    podApi.post(`/api/v1/partner/phygital/sales/${id}/confirm`),

  complete: (id) =>
    podApi.post(`/api/v1/partner/phygital/sales/${id}/complete`),

  cancel: (id, reason) =>
    podApi.post(`/api/v1/partner/phygital/sales/${id}/cancel`, null, { params: { reason } }),

  returnSale: (id) =>
    podApi.post(`/api/v1/partner/phygital/sales/${id}/return`),
};

// ==================== ADMIN WHOLESALE API ====================
export const adminWholesaleApi = {
  getOrders: (params = {}) =>
    podApi.get("/api/v1/admin/wholesale/orders", { params }),

  getOrder: (id) =>
    podApi.get(`/api/v1/admin/wholesale/orders/${id}`),

  approve: (id) =>
    podApi.post(`/api/v1/admin/wholesale/orders/${id}/approve`),

  process: (id) =>
    podApi.post(`/api/v1/admin/wholesale/orders/${id}/process`),

  ship: (id, trackingNumber) =>
    podApi.post(`/api/v1/admin/wholesale/orders/${id}/ship`, null, { params: { trackingNumber } }),

  complete: (id) =>
    podApi.post(`/api/v1/admin/wholesale/orders/${id}/complete`),

  cancel: (id, reason) =>
    podApi.post(`/api/v1/admin/wholesale/orders/${id}/cancel`, null, { params: { reason } }),

  getPartners: (params = {}) =>
    podApi.get("/api/v1/admin/wholesale/partners", { params }),

  getPartnerInventory: (partnerId, params = {}) =>
    podApi.get(`/api/v1/admin/wholesale/partners/${partnerId}/inventory`, { params }),

  getPartnerSales: (partnerId, params = {}) =>
    podApi.get(`/api/v1/admin/wholesale/partners/${partnerId}/sales`, { params }),

  getPartnerOrders: (partnerId, params = {}) =>
    podApi.get(`/api/v1/admin/wholesale/partners/${partnerId}/orders`, { params }),

  getPartnerDashboard: (partnerId) =>
    podApi.get(`/api/v1/admin/wholesale/partners/${partnerId}/dashboard`),
};

// ==================== PRODUCT CATALOG (public) ====================
export const productCatalogApi = {
  getAvailable: (params) => podApi.get("/api/products/available", { params }),
  search: (keyword, params) => podApi.get("/api/products/search", { params: { q: keyword, ...params } }),
};

// ==================== ENUMS ====================
export const POD_ENUMS = {
  partnerStatus: ['PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'TERMINATED'],
  partnerTier: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
  partnerType: ['LOCATION', 'PHYGITAL'],
  businessType: ['SPA', 'HOTEL', 'SALON', 'RETAIL', 'RESTAURANT', 'OTHER'],
  podStatus: ['DRAFT', 'ACTIVE', 'MAINTENANCE', 'INACTIVE'],
  qrCodeStatus: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
  commissionStatus: ['PENDING', 'APPROVED', 'PAID', 'CANCELLED'],
  wholesaleOrderStatus: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
  partnerSaleStatus: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RETURNED'],
  inventoryMovementType: ['WHOLESALE_IN', 'SALE_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN_IN', 'TRANSFER_OUT', 'DAMAGED_OUT'],
};

export default podApi;
