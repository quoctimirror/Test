import axios from "axios";

// Base URL cho Inventory API
// Trong dev: sẽ được proxy bởi Vite đến localhost:8080
// Trong production: set VITE_INVENTORY_API_URL
const API_BASE_URL = import.meta.env.VITE_INVENTORY_API_URL || "";

// Create axios instance
const inventoryApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để thêm auth token
inventoryApi.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
inventoryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Inventory API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== 1. INVENTORY PRODUCTS API (/api/products) =====
export const inventoryProductsAPI = {
  // Dashboard thống kê tồn kho
  getDashboard: () => inventoryApi.get("/api/products/dashboard"),

  // Sản phẩm còn hàng
  getAvailable: () => inventoryApi.get("/api/products/available"),

  // Sản phẩm sắp hết hàng
  getLowStock: () => inventoryApi.get("/api/products/low-stock"),

  // Sản phẩm hết hàng
  getOutOfStock: () => inventoryApi.get("/api/products/out-of-stock"),

  // Cập nhật số lượng tồn kho
  updateStock: (productId, quantity) =>
    inventoryApi.put(`/api/products/${productId}/stock`, { quantity }),

  // Thống kê tổng quan
  getStatistics: () => inventoryApi.get("/api/products/statistics"),

  // Lấy tất cả sản phẩm (không phân trang)
  getAll: () => inventoryApi.get("/api/products/all"),

  // Lấy sản phẩm với phân trang & filter
  getWithPagination: (params = {}) =>
    inventoryApi.get("/api/products", { params }),

  // Lấy sản phẩm theo ID
  getById: (id) => inventoryApi.get(`/api/products/${id}`),

  // Lấy sản phẩm theo SKU (cho Scanner)
  getBySku: (sku) => inventoryApi.get(`/api/products/sku/${encodeURIComponent(sku)}`),

  // Tìm kiếm sản phẩm
  search: (keyword, params = {}) =>
    inventoryApi.get("/api/products/search", { params: { q: keyword, ...params } }),

  // Cập nhật sản phẩm theo SKU
  updateBySku: (sku, data) =>
    inventoryApi.put(`/api/products/sku/${encodeURIComponent(sku)}`, data),

  // Xóa sản phẩm (soft delete)
  delete: (id) => inventoryApi.delete(`/api/products/${id}`),

  // Xuất dữ liệu in label (JSON)
  printLabelJson: (data) => inventoryApi.post("/api/products/print-label", data),

  // Xuất dữ liệu in label (CSV)
  printLabelCsv: (data) =>
    inventoryApi.post("/api/products/print-label/csv", data, {
      responseType: "text",
    }),
};

// ===== 2. MISA STOCK API (/api/misa/stock) =====
export const misaStockAPI = {
  // Trạng thái kết nối MISA
  getStatus: async () => {
    const response = await inventoryApi.get("/api/misa/stock/status");
    return response.data?.data || response.data;
  },

  // Kiểm tra tồn kho theo SKU/barcode
  getByCode: async (code) => {
    const response = await inventoryApi.get(
      `/api/misa/stock/${encodeURIComponent(code)}`
    );
    return response.data?.data || response.data;
  },

  // Kiểm tra tồn kho nhiều SKU cùng lúc
  getBatch: async (codes) => {
    const response = await inventoryApi.post("/api/misa/stock/batch", { codes });
    return response.data?.data || response.data;
  },
};

// ===== 3. MATERIALS API (/api/materials) - Nguyên vật liệu =====
export const materialsAPI = {
  // Lấy tất cả nguyên vật liệu
  getAll: () => inventoryApi.get("/api/materials"),

  // Chi tiết theo ID
  getById: (id) => inventoryApi.get(`/api/materials/${id}`),

  // Lọc theo loại (GOLD, SILVER, DIAMOND, etc.)
  getByType: (type) => inventoryApi.get(`/api/materials/type/${type}`),

  // Lọc theo nhà cung cấp
  getByVendor: (vendorId) => inventoryApi.get(`/api/materials/vendor/${vendorId}`),

  // Tạo mới
  create: (data) => inventoryApi.post("/api/materials", data),

  // Cập nhật
  update: (id, data) => inventoryApi.put(`/api/materials/${id}`, data),

  // Xóa
  delete: (id) => inventoryApi.delete(`/api/materials/${id}`),

  // Đếm tổng số
  count: () => inventoryApi.get("/api/materials/count"),
};

// ===== LEGACY ALIAS (backward compatibility) =====
export const misaProductStockAPI = {
  getByCode: async (code) => {
    try {
      // Thử API misa/stock trước
      const response = await inventoryApi.get(
        `/api/misa/stock/${encodeURIComponent(code)}`
      );
      const data = response.data?.data || response.data;

      if (data && data.success !== false) {
        return {
          found: true,
          productId: data.productId,
          code: data.code || data.sku,
          name: data.name || data.productName,
          barcode: data.barcode,
          sellingPrice: data.price || data.sellingPrice,
          picture: data.picture || data.imageUrl,
          totalOnHand: data.stockQuantity || data.totalOnHand || 0,
          availableQuantity: data.stockQuantity || data.availableQuantity || 0,
          stockStatus: data.stockStatus || "UNKNOWN",
          branchStocks: data.branchStocks || [],
        };
      }
    } catch (err) {
      console.log("MISA API failed, trying products API...", err.message);
    }

    // Fallback: thử API products/sku
    try {
      const response = await inventoryApi.get(
        `/api/products/sku/${encodeURIComponent(code)}`
      );
      const product = response.data?.data || response.data;

      if (!product || !product.id) {
        return { found: false, errorMessage: "Không tìm thấy sản phẩm" };
      }

      return {
        found: true,
        productId: product.id,
        code: product.skuId || product.sku,
        name: product.name,
        barcode: product.sku,
        description: product.description,
        sellingPrice: product.price,
        picture: product.imageUrl,
        pictureUrls: product.imageUrls,
        totalOnHand: product.misaOnHand || product.stockQuantity || 0,
        availableQuantity: product.misaOnHand || product.stockQuantity || 0,
        stockStatus: (product.misaOnHand || product.stockQuantity) > 0
          ? "IN_STOCK"
          : "OUT_OF_STOCK",
        metalType: product.metalType,
        metalPurity: product.metalPurity,
        stoneType: product.stoneType,
        weightGrams: product.weightGrams,
        status: product.status,
      };
    } catch (err) {
      return { found: false, errorMessage: err.message };
    }
  },
};

// ===== HELPER FUNCTIONS =====
/**
 * Lấy màu hiển thị theo stock status
 */
export const getStockStatusColor = (status) => {
  const colors = {
    IN_STOCK: "#22c55e",    // Xanh lá
    LOW_STOCK: "#f59e0b",   // Vàng cam
    OUT_OF_STOCK: "#ef4444", // Đỏ
  };
  return colors[status] || "#6b7280";
};

/**
 * Lấy text hiển thị theo stock status
 */
export const getStockStatusText = (status) => {
  const texts = {
    IN_STOCK: "Còn hàng",
    LOW_STOCK: "Sắp hết",
    OUT_OF_STOCK: "Hết hàng",
  };
  return texts[status] || "Không xác định";
};

/**
 * Material types
 */
export const MATERIAL_TYPES = {
  GOLD: "GOLD",
  SILVER: "SILVER",
  PLATINUM: "PLATINUM",
  DIAMOND: "DIAMOND",
  GEMSTONE: "GEMSTONE",
  OTHER: "OTHER",
};

export default inventoryApi;
