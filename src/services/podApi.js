import axios from "axios";

// Base URL configuration
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE_URL = isLocalDev
  ? '' // Use relative URLs through Vite proxy
  : (import.meta.env.VITE_API_BASE_URL || "https://xpxr4xbvim.ap-southeast-1.awsapprunner.com");

// Create axios instance for POD API
const podApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
podApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
podApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("accessToken");
      // Use correct login route with UUID
      window.location.href = '/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/login';
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

// ==================== ATTRIBUTION API ====================
export const attributionApi = {
  // Get all attributions with pagination and filters
  getAll: (params = {}) =>
    podApi.get("/api/v1/admin/pod-attributions", { params }),

  // Get attribution by ID
  getById: (attributionId) =>
    podApi.get(`/api/v1/admin/pod-attributions/${attributionId}`),

  // Create attribution manually
  create: (data) =>
    podApi.post("/api/v1/admin/pod-attributions", data),

  // Update attribution status
  updateStatus: (attributionId, status) =>
    podApi.patch(`/api/v1/admin/pod-attributions/${attributionId}/status`, { status }),
};

// ==================== COMMISSION API ====================
export const commissionApi = {
  // Get all commissions with pagination and filters
  getAll: (params = {}) =>
    podApi.get("/api/v1/admin/pod-commissions", { params }),

  // Get commission by ID
  getById: (commissionId) =>
    podApi.get(`/api/v1/admin/pod-commissions/${commissionId}`),

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

  // Get partner's attributions
  getMyAttributions: (params = {}) =>
    podApi.get("/api/v1/partner/attributions", { params }),

  // Get partner's commissions
  getMyCommissions: (params = {}) =>
    podApi.get("/api/v1/partner/commissions", { params }),

  // Get scan statistics
  getScanStats: (startDate, endDate) =>
    podApi.get("/api/v1/partner/stats/scans", { params: { startDate, endDate } }),

  // Get attribution statistics
  getAttributionStats: (startDate, endDate) =>
    podApi.get("/api/v1/partner/stats/attributions", { params: { startDate, endDate } }),
};

// ==================== ENUMS ====================
export const POD_ENUMS = {
  partnerStatus: ['PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'TERMINATED'],
  partnerTier: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
  businessType: ['SPA', 'HOTEL', 'SALON', 'RETAIL', 'RESTAURANT', 'OTHER'],
  podStatus: ['DRAFT', 'ACTIVE', 'MAINTENANCE', 'INACTIVE'],
  qrCodeStatus: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
  attributionStatus: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  attributionType: ['FIRST_TOUCH', 'LAST_TOUCH', 'MULTI_TOUCH'],
  commissionStatus: ['PENDING', 'APPROVED', 'PAID', 'CANCELLED'],
};

export default podApi;
