import axios from "axios";

// Using Vite proxy (see vite.config.js)
// In dev: /api/* will be proxied to localhost:8085
// In production: need to set VITE_INVENTORY_API_URL
const API_BASE_URL = import.meta.env.VITE_INVENTORY_API_URL || "";

const INVENTORY_API_BASE_URL = API_BASE_URL;
const MISA_API_BASE_URL = API_BASE_URL;

// Create axios instance cho Inventory API
const inventoryApi = axios.create({
  baseURL: INVENTORY_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance cho MISA API
const misaApi = axios.create({
  baseURL: MISA_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
inventoryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Inventory API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Response interceptor cho MISA API
misaApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("MISA API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== INVENTORY PRODUCTS API =====
export const inventoryProductsAPI = {
  // 1. GET /api/products/dashboard - Get dashboard statistics
  getDashboard: () => inventoryApi.get("/api/products/dashboard"),

  // 2. GET /api/products/all - Get all products (no pagination)
  getAll: () => inventoryApi.get("/api/products/all"),

  // 3. GET /api/products - Get products with pagination & filter
  getWithPagination: (params = {}) =>
    inventoryApi.get("/api/products", { params }),

  // 4. GET /api/products/{id} - Get product by ID
  getById: (id) => inventoryApi.get(`/api/products/${id}`),

  // 5. GET /api/products/sku/{sku} - Get product by SKU (for Scanner)
  getBySku: (sku) => inventoryApi.get(`/api/products/sku/${encodeURIComponent(sku)}`),

  // 6. GET /api/products/search?q={keyword} - Search products
  search: (keyword, params = {}) =>
    inventoryApi.get("/api/products/search", { params: { q: keyword, ...params } }),

  // 7. PUT /api/products/sku/{sku} - Update product by SKU
  updateBySku: (sku, data) =>
    inventoryApi.put(`/api/products/sku/${encodeURIComponent(sku)}`, data),

  // 8. DELETE /api/products/{id} - Delete product (soft delete)
  delete: (id) => inventoryApi.delete(`/api/products/${id}`),

  // 9. POST /api/products/print-label - Export label data (JSON)
  printLabelJson: (data) => inventoryApi.post("/api/products/print-label", data),

  // 10. POST /api/products/print-label/csv - Export label data (CSV)
  printLabelCsv: (data) =>
    inventoryApi.post("/api/products/print-label/csv", data, {
      responseType: "text",
    }),
};

// ===== MISA STOCK API =====
// Real-time stock lookup API from MISA system
export const misaStockAPI = {
  /**
   * Check MISA Integration Status
   * @returns {Promise<{ configured: boolean, message: string }>}
   */
  getStatus: async () => {
    const response = await misaApi.get("/api/misa/stock/status");
    return response.data?.data || response.data;
  },

  /**
   * Get real-time stock from MISA by code
   * @param {string} code - SKU (mirrorCode) or barcode of the product
   * @returns {Promise<MisaStockResponse>}
   *
   * Response format:
   * {
   *   productCode: "RNG-18KWG-LG-PEAR-10.11CT",
   *   productName: "18KWG Lab Grown Pear 10.11CT",
   *   totalOnHand: 69.0,
   *   totalOrdered: 0.0,
   *   branchStocks: [{ branchId, branchName, onHand, ordered, preOrdered }]
   * }
   */
  getByCode: async (code) => {
    const response = await misaApi.get(
      `/api/misa/stock/${encodeURIComponent(code)}`
    );
    return response.data?.data || response.data;
  },
};

// Legacy alias for backward compatibility
export const misaProductStockAPI = {
  getByCode: async (code) => {
    // Use products/sku API to get product info including misaOnHand
    const response = await inventoryApi.get(
      `/api/products/sku/${encodeURIComponent(code)}`
    );
    const product = response.data?.data || response.data;

    if (!product || !product.id) {
      return { found: false, errorMessage: "Product not found" };
    }

    // Map to old format for backward compatibility
    return {
      found: true,
      productId: product.id,
      code: product.skuId,
      name: product.name,
      barcode: product.sku,
      description: product.description,
      sellingPrice: product.price,
      picture: product.imageUrl,
      pictureUrls: product.imageUrls,
      totalOnHand: product.misaOnHand || 0,
      availableQuantity: product.misaOnHand || 0,
      stockStatus: product.misaOnHand > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      // Product details
      metalType: product.metalType,
      metalPurity: product.metalPurity,
      stoneType: product.stoneType,
      weightGrams: product.weightGrams,
      status: product.status,
    };
  },
};

// ===== HELPER FUNCTIONS =====
/**
 * Get display color by stock status
 * @param {string} status - IN_STOCK, LOW_STOCK, OUT_OF_STOCK
 * @returns {string} hex color
 */
export const getStockStatusColor = (status) => {
  const colors = {
    IN_STOCK: "#22c55e",    // Green
    LOW_STOCK: "#f59e0b",   // Orange
    OUT_OF_STOCK: "#ef4444", // Red
  };
  return colors[status] || "#6b7280";
};

/**
 * Get display text by stock status
 * @param {string} status - IN_STOCK, LOW_STOCK, OUT_OF_STOCK
 * @returns {string} Vietnamese text
 */
export const getStockStatusText = (status) => {
  const texts = {
    IN_STOCK: "Còn hàng",
    LOW_STOCK: "Sắp hết",
    OUT_OF_STOCK: "Hết hàng",
  };
  return texts[status] || "Không xác định";
};

export default inventoryApi;
