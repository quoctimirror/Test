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
  getAll: () => api.get("/locations"),

  // Get location by ID
  getById: (id) => api.get(`/locations/${id}`),

  // Filter locations by city
  getByCity: (city) => api.get(`/locations/city/${encodeURIComponent(city)}`),

  // Filter locations by type
  getByType: (type) => api.get(`/locations/type/${type}`),

  // Filter locations by both city and type
  getFiltered: (params) => api.get("/locations/filter", { params }),

  // Search locations
  search: (searchTerm) =>
    api.get(`/locations/search?q=${encodeURIComponent(searchTerm)}`),

  // Get filter options (cities, types)
  getFilterOptions: () => api.get("/locations/filters"),

  // Get location statistics
  getStatistics: () => api.get("/locations/statistics"),

  // Health check
  health: () => api.get("/locations/health"),

  // CRUD operations
  create: (locationData) => api.post("/locations", locationData),
  update: (id, locationData) => api.put(`/locations/${id}`, locationData),
  delete: (id) => api.delete(`/locations/${id}`),
};

// ===== PRODUCTS API =====
export const productsAPI = {
  // Get all active products
  getAll: (params = {}) => api.get("/products", { params }),

  // Get product by ID
  getById: (id) => api.get(`/products/${id}`),

  // Get product by SKU
  getBySku: (sku) => api.get(`/products/sku/${sku}`),

  // Get featured products
  getFeatured: () => api.get("/products/featured"),

  // Get available products (in stock)
  getAvailable: (params = {}) => api.get("/products/available", { params }),

  // Get products by category
  getByCategory: (categoryId, params = {}) =>
    api.get(`/products/category/${categoryId}`, { params }),

  // Get products by metal type
  getByMetalType: (metalType) => api.get(`/products/metal/${metalType}`),

  // Search products
  search: (searchTerm, params = {}) =>
    api.get(`/products/search?q=${encodeURIComponent(searchTerm)}`, { params }),

  // Advanced filtering
  getFiltered: (params = {}) => api.get("/products/filter", { params }),

  // Get products by price range
  getByPriceRange: (min, max) =>
    api.get(`/products/price-range?min=${min}&max=${max}`),

  // Get filter options
  getFilterOptions: () => api.get("/products/filters"),

  // Get product statistics
  getStatistics: () => api.get("/products/statistics"),

  // Health check
  health: () => api.get("/products/health"),

  // CRUD operations
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  toggleFeatured: (id) => api.patch(`/products/${id}/featured`),
};

// ===== COLLECTIONS API =====
export const collectionsAPI = {
  // Get all active collections
  getAll: () => api.get("/collections"),

  // Get collection by ID
  getById: (id) => api.get(`/collections/${id}`),

  // Get collection by name
  getByName: (name) => api.get(`/collections/name/${encodeURIComponent(name)}`),

  // Get collection with products
  getWithProducts: (id) => api.get(`/collections/${id}/products`),

  // Get featured collections
  getFeatured: () => api.get("/collections/featured"),

  // Get collections by year
  getByYear: (year) => api.get(`/collections/year/${year}`),

  // Get collections by season and year
  getBySeasonAndYear: (season, year) =>
    api.get(`/collections/season/${season}/year/${year}`),

  // Search collections
  search: (searchTerm) =>
    api.get(`/collections/search?q=${encodeURIComponent(searchTerm)}`),

  // Get filter options
  getFilterOptions: () => api.get("/collections/filters"),

  // Get collection statistics
  getStatistics: () => api.get("/collections/statistics"),

  // Health check
  health: () => api.get("/collections/health"),

  // CRUD operations
  create: (collectionData) => api.post("/collections", collectionData),
  update: (id, collectionData) => api.put(`/collections/${id}`, collectionData),
  delete: (id) => api.delete(`/collections/${id}`),
  toggleFeatured: (id) => api.patch(`/collections/${id}/featured`),
};

// ===== CATEGORIES API =====
export const categoriesAPI = {
  // Get all categories
  getAll: () => api.get("/categories"),

  // Get category by ID
  getById: (id) => api.get(`/categories/${id}`),

  // Health check
  health: () => api.get("/categories/health"),

  // CRUD operations
  create: (categoryData) => api.post("/categories", categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ===== COMPONENTS API =====
export const componentsAPI = {
  // Get all components
  getAll: () => api.get("/components"),

  // Get component by ID
  getById: (id) => api.get(`/components/${id}`),

  // Get components by type
  getByType: (type) => api.get(`/components/type/${type}`),

  // Get customizable components
  getCustomizable: () => api.get("/components/customizable"),

  // Get required components
  getRequired: () => api.get("/components/required"),

  // Health check
  health: () => api.get("/components/health"),

  // CRUD operations
  create: (componentData) => api.post("/components", componentData),
  update: (id, componentData) => api.put(`/components/${id}`, componentData),
  delete: (id) => api.delete(`/components/${id}`),
};

// ===== USERS API =====
export const usersAPI = {
  // Get all users
  getAll: () => api.get("/users"),

  // Get user by ID
  getById: (id) => api.get(`/users/${id}`),

  // Get user by username
  getByUsername: (username) => api.get(`/users/username/${username}`),

  // Get user by email
  getByEmail: (email) => api.get(`/users/email/${encodeURIComponent(email)}`),

  // Get users by role
  getByRole: (role) => api.get(`/users/role/${role}`),

  // Get users by status
  getByStatus: (status) => api.get(`/users/status/${status}`),

  // Search users
  search: (searchTerm) =>
    api.get(`/users/search?q=${encodeURIComponent(searchTerm)}`),

  // Get user statistics
  getStatistics: () => api.get("/users/statistics"),

  // Health check
  health: () => api.get("/users/health"),

  // CRUD operations
  create: (userData) => api.post("/users", userData),
  createByAdmin: (userData) => api.post("/users/admin/create", userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
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
