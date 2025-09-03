import axios from "axios";

// Base API URL - now pointing to Gateway Service
// Gateway Service routes to all microservices
const API_BASE_URL = "https://xpxr4xbvim.ap-southeast-1.awsapprunner.com";

// Debug logging
console.log("🔧 API Configuration Debug:", {
  "import.meta.env.VITE_API_BASE_URL": import.meta.env.VITE_API_BASE_URL,
  "Final API_BASE_URL": API_BASE_URL,
  "All env vars": import.meta.env,
});

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

// Request interceptor
api.interceptors.request.use(
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== LOCATIONS API =====
export const locationsAPI = {
  // Get all active locations
  getAll: () => api.get("/api/locations"),

  // Get location by ID
  getById: (id) => api.get(`/api/locations/${id}`),

  // Filter locations by city
  getByCity: (city) => api.get(`/api/locations/city/${encodeURIComponent(city)}`),

  // Filter locations by type
  getByType: (type) => api.get(`/api/locations/type/${type}`),

  // Filter locations by both city and type
  getFiltered: (params) => api.get("/api/locations/filter", { params }),

  // Search locations
  search: (searchTerm) =>
    api.get(`/api/locations/search?q=${encodeURIComponent(searchTerm)}`),

  // Get filter options (cities, types)
  getFilterOptions: () => api.get("/api/locations/filters"),

  // Get location statistics
  getStatistics: () => api.get("/api/locations/statistics"),

  // Health check
  health: () => api.get("/api/locations/health"),

  // CRUD operations
  create: (locationData) => api.post("/api/locations", locationData),
  update: (id, locationData) => api.put(`/api/locations/${id}`, locationData),
  delete: (id) => api.delete(`/api/locations/${id}`),
  hardDelete: (id) => api.delete(`/api/locations/${id}/permanent`),
  activate: (id) => api.post(`/api/locations/${id}/activate`),
  deactivate: (id) => api.post(`/api/locations/${id}/deactivate`),
};

// ===== PRODUCTS API =====
export const productsAPI = {
  // Get all active products
  getAll: (params = {}) => api.get("/api/products", { params }),

  // Get all products including inactive (admin)
  getAllIncludingInactive: () => api.get("/api/products/all"),

  // Get product by ID
  getById: (id) => api.get(`/api/products/${id}`),

  // Get product by SKU
  getBySku: (sku) => api.get(`/api/products/sku/${sku}`),

  // Get featured products
  getFeatured: () => api.get("/api/products/featured"),

  // Get available products (in stock)
  getAvailable: (params = {}) => api.get("/api/products/available", { params }),

  // Get products by category
  getByCategory: (categoryId, params = {}) =>
    api.get(`/api/products/category/${categoryId}`, { params }),

  // Get products by metal type
  getByMetalType: (metalType) => api.get(`/api/products/metal/${metalType}`),

  // Search products
  search: (searchTerm, params = {}) =>
    api.get(`/api/products/search?q=${encodeURIComponent(searchTerm)}`, { params }),

  // Advanced filtering
  getFiltered: (params = {}) => api.get("/api/products/filter", { params }),

  // Get products by price range
  getByPriceRange: (min, max) =>
    api.get(`/api/products/price-range?min=${min}&max=${max}`),

  // Get low stock products
  getLowStock: () => api.get("/api/products/low-stock"),

  // Get out of stock products
  getOutOfStock: () => api.get("/api/products/out-of-stock"),

  // Get filter options
  getFilterOptions: () => api.get("/api/products/filters"),

  // Get product statistics
  getStatistics: () => api.get("/api/products/statistics"),

  // Health check
  health: () => api.get("/api/products/health"),

  // CRUD operations
  create: (productData) => api.post("/api/products", productData),
  update: (id, productData) => api.put(`/api/products/${id}`, productData),
  delete: (id) => api.delete(`/api/products/${id}`),
  hardDelete: (id) => api.delete(`/api/products/${id}/permanent`),
  toggleFeatured: (id) => api.post(`/api/products/${id}/toggle-featured`),
  updateStock: (id, quantity) => api.put(`/api/products/${id}/stock`, { quantity }),
};

// ===== COLLECTIONS API =====
export const collectionsAPI = {
  // Get all active collections
  getAll: () => api.get("/api/collections"),

  // Get collection by ID
  getById: (id) => api.get(`/api/collections/${id}`),

  // Get collection by name
  getByName: (name) => api.get(`/api/collections/name/${encodeURIComponent(name)}`),

  // Get collection with products
  getWithProducts: (id) => api.get(`/api/collections/${id}/products`),

  // Get featured collections
  getFeatured: () => api.get("/api/collections/featured"),

  // Get collections by year
  getByYear: (year) => api.get(`/api/collections/year/${year}`),

  // Get collections by season and year
  getBySeasonAndYear: (season, year) =>
    api.get(`/api/collections/season/${season}/year/${year}`),

  // Search collections
  search: (searchTerm) =>
    api.get(`/api/collections/search?q=${encodeURIComponent(searchTerm)}`),

  // Get filter options
  getFilterOptions: () => api.get("/api/collections/filters"),

  // Get collection statistics
  getStatistics: () => api.get("/api/collections/statistics"),

  // Health check
  health: () => api.get("/api/collections/health"),

  // CRUD operations
  create: (collectionData) => api.post("/api/collections", collectionData),
  update: (id, collectionData) => api.put(`/api/collections/${id}`, collectionData),
  delete: (id) => api.delete(`/api/collections/${id}`),
  toggleFeatured: (id) => api.patch(`/api/collections/${id}/featured`),
};

// ===== CATEGORIES API =====
export const categoriesAPI = {
  // Get all categories
  getAll: () => api.get("/api/categories"),

  // Get category by ID
  getById: (id) => api.get(`/api/categories/${id}`),

  // Health check
  health: () => api.get("/api/categories/health"),

  // CRUD operations
  create: (categoryData) => api.post("/api/categories", categoryData),
  update: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// ===== COMPONENTS API =====
export const componentsAPI = {
  // Get all components
  getAll: () => api.get("/api/components"),

  // Get component by ID
  getById: (id) => api.get(`/api/components/${id}`),

  // Get components by type
  getByType: (type) => api.get(`/api/components/type/${type}`),

  // Get customizable components
  getCustomizable: () => api.get("/api/components/customizable"),

  // Get required components
  getRequired: () => api.get("/api/components/required"),

  // Health check
  health: () => api.get("/api/components/health"),

  // CRUD operations
  create: (componentData) => api.post("/api/components", componentData),
  update: (id, componentData) => api.put(`/api/components/${id}`, componentData),
  delete: (id) => api.delete(`/api/components/${id}`),
};

// ===== USERS API =====
export const usersAPI = {
  // Get all users
  getAll: () => api.get("/api/users"),

  // Get user by ID
  getById: (id) => api.get(`/api/users/${id}`),

  // Get user by username
  getByUsername: (username) => api.get(`/api/users/username/${username}`),

  // Get user by email
  getByEmail: (email) => api.get(`/api/users/email/${encodeURIComponent(email)}`),

  // Get users by role
  getByRole: (role) => api.get(`/api/users/role/${role}`),

  // Get users by status
  getByStatus: (status) => api.get(`/api/users/status/${status}`),

  // Search users
  search: (searchTerm) =>
    api.get(`/api/users/search?q=${encodeURIComponent(searchTerm)}`),

  // Get user statistics
  getStatistics: () => api.get("/api/users/statistics"),

  // Health check
  health: () => api.get("/api/users/health"),

  // CRUD operations
  create: (userData) => api.post("/api/users", userData),
  createByAdmin: (userData) => api.post("/api/users/admin/create", userData),
  update: (id, userData) => api.put(`/api/users/${id}`, userData),
  delete: (id) => api.delete(`/api/users/${id}`),
  updateStatus: (id, status) => api.patch(`/api/users/${id}/status`, { status }),
  updateRole: (id, role) => api.patch(`/api/users/${id}/role`, { role }),
};

// ===== UTILITY FUNCTIONS =====

/**
 * Handle API errors consistently
 */
export const handleAPIError = (error, defaultMessage = "An error occurred") => {
  if (error.response) {
    // Server responded with error status
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Server error: ${error.response.status}`;
    return {
      message,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: "Network error - please check your connection",
      status: null,
    };
  } else {
    // Something else happened
    return { message: error.message || defaultMessage, status: null };
  }
};

/**
 * Create a loading state hook for API calls
 */
export const createApiHook = (apiCall) => {
  return async (params = {}) => {
    try {
      const response = await apiCall(params);
      return { data: response.data, error: null, loading: false };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      return { data: null, error: errorInfo, loading: false };
    }
  };
};

// Export the axios instance for custom calls
export default api;
