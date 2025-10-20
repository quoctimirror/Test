import axios from "axios";

// Base URLs are driven by Vite environment variables to support local/dev/prod
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://xpxr4xbvim.ap-southeast-1.awsapprunner.com";

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL ||
  API_BASE_URL ||
  "https://nwkg3ymv2p.ap-southeast-1.awsapprunner.com";

const REFRESH_TOKEN_ENDPOINT = `${AUTH_BASE_URL}/api/v1/auth/refresh-token`;

// Debug logging
// console.log("🔧 API Configuration Debug:", {
//   "import.meta.env.VITE_API_BASE_URL": import.meta.env.VITE_API_BASE_URL,
//   "Final API_BASE_URL": API_BASE_URL,
//   "All env vars": import.meta.env,
// });

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
      
      // Add X-User-Id header from JWT token
      try {
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        if (payload.userId) {
          config.headers['X-User-Id'] = payload.userId.toString();
        }
      } catch (decodeError) {
        console.error("❌ Error decoding JWT for X-User-Id:", decodeError);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config || {};
    const requestUrl = originalRequest.url || "";

    const isAuthEndpoint =
      requestUrl.includes("/auth/authenticate") ||
      requestUrl.includes("/auth/refresh-token");

    const requiresAuth = ["/users/", "/orders/", "/me/"]
      .some((path) => requestUrl.includes(path));

    if (
      status === 401 &&
      requiresAuth &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
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
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION API =====
export const authAPI = {
  // Login / Authenticate
  authenticate: (username, password) =>
    api.post("/api/auth/authenticate", { username, password }),

  // Register new user
  register: (userData) => api.post("/api/auth/register", userData),

  // Verify email with token (GET with query param)
  verifyEmail: (token) => api.get(`/api/auth/verify-email?token=${token}`),

  // Resend verification email
  resendVerificationEmail: (email) =>
    api.post("/api/auth/resend-verification-email", { email }),

  // Refresh token
  refreshToken: (refreshToken) =>
    api.post("/api/auth/refresh-token", { refreshToken }),

  // Forgot password
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),

  // Reset password
  resetPassword: (token, newPassword) =>
    api.post("/api/auth/reset-password", { token, newPassword }),
};

// ===== LOCATIONS API =====
export const locationsAPI = {
  // Get all active locations
  getAll: () => api.get("/api/locations"),

  // Get location by ID
  getById: (id) => api.get(`/api/locations/${id}`),

  // Filter locations by city
  getByCity: (city) =>
    api.get(`/api/locations/city/${encodeURIComponent(city)}`),

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
    api.get(`/api/products/search?q=${encodeURIComponent(searchTerm)}`, {
      params,
    }),

  // Advanced filtering
  getFiltered: (params = {}) => api.get("/api/products/filter", { params }),

  // Get products by price range
  getByPriceRange: (min, max) =>
    api.get(`/api/products/price-range?min=${min}&max=${max}`),
    
  // Get products by vendor ID
  getByVendorId: (vendorId) => api.get(`/api/products?vendorId=${vendorId}`),
  
  // Get current user's vendor products (authenticated endpoint)
  getCurrentUserProducts: () => api.get("/api/products"),

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
  updateStock: (id, quantity) =>
    api.put(`/api/products/${id}/stock`, { quantity }),
};

// ===== ORDERS API =====
export const ordersAPI = {
  create: (orderData) => api.post("/api/orders", orderData),
  getAll: (params = {}) => api.get("/api/orders", { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  getPaymentSchedule: (id) => api.get(`/api/orders/${id}/payment-schedule`),
  getPaymentSchedules: (params = {}) =>
    api.get(`/api/orders/payment-schedule`, { params }),
  updateStatus: (id, payload) => api.post(`/api/orders/${id}/status`, payload),
  updatePaymentTerms: (id, payload) =>
    api.put(`/api/orders/${id}/payment-terms`, payload),
  recordPayment: (orderId, scheduleId, payload) =>
    api.post(
      `/api/orders/${orderId}/payment-schedule/${scheduleId}/payments`,
      payload
    ),
  markSchedulePaid: (orderId, scheduleId, payload) =>
    api.post(
      `/api/orders/${orderId}/payment-schedule/${scheduleId}/payments`,
      payload
    ),
};

// ===== COLLECTIONS API =====
export const collectionsAPI = {
  // Get all active collections
  getAll: () => api.get("/api/collections"),
  // Get all collections including inactive (admin)
  getAllIncludingInactive: () => api.get("/api/collections/all"),

  // Get collection by ID
  getById: (id) => api.get(`/api/collections/${id}`),

  // Get collection by name
  getByName: (name) =>
    api.get(`/api/collections/name/${encodeURIComponent(name)}`),

  // Get all collections with their products
  getAllWithProducts: () => api.get("/api/collections/with-products"),

  // Get collection with products
  getWithProducts: (id) => api.get(`/api/collections/${id}/products`),

  // Get products in collection (products list only)
  getProductsInCollection: (id) =>
    api.get(`/api/collections/${id}/products-list`),

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
  update: (id, collectionData) =>
    api.put(`/api/collections/${id}`, collectionData),
  delete: (id) => api.delete(`/api/collections/${id}`),
  hardDelete: (id) => api.delete(`/api/collections/${id}/permanent`),

  // Collection-Product management
  addProductToCollection: (collectionId, productData) =>
    api.post(`/api/collections/${collectionId}/products`, productData),
  removeProductFromCollection: (collectionId, productId) =>
    api.delete(`/api/collections/${collectionId}/products/${productId}`),
  updateProductSortOrder: (collectionId, productId, sortOrder) =>
    api.put(
      `/api/collections/${collectionId}/products/${productId}/sort-order`,
      { sortOrder }
    ),
  toggleHeroProduct: (collectionId, productId) =>
    api.post(
      `/api/collections/${collectionId}/products/${productId}/toggle-hero`
    ),
  toggleFeatured: (id) => api.patch(`/api/collections/${id}/featured`),
};

// ===== CATEGORIES API =====
export const categoriesAPI = {
  // Get all active categories
  getAll: () => api.get("/api/categories"),

  // Get category by ID
  getById: (id) => api.get(`/api/categories/${id}`),

  // Get category by name
  getByName: (name) =>
    api.get(`/api/categories/name/${encodeURIComponent(name)}`),

  // Check if category exists by name
  checkExists: (name) =>
    api.get(`/api/categories/exists/${encodeURIComponent(name)}`),

  // Get active count
  getActiveCount: () => api.get("/api/categories/count"),

  // CRUD operations
  create: (categoryData) => api.post("/api/categories", categoryData),
  update: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/api/categories/${id}`),
  deactivate: (id) => api.patch(`/api/categories/${id}/deactivate`),
};

// ===== COMPONENTS API =====
export const componentsAPI = {
  // Get all active components
  getAll: () => api.get("/api/components"),

  // Get component by ID
  getById: (id) => api.get(`/api/components/${id}`),

  // Get components by category ID
  getByCategoryId: (categoryId) =>
    api.get(`/api/components/category/${categoryId}`),

  // Get component by name
  getByName: (name) =>
    api.get(`/api/components/name/${encodeURIComponent(name)}`),

  // Check if component exists
  checkExists: (name, categoryId) =>
    api.get(
      `/api/components/exists/${encodeURIComponent(
        name
      )}/category/${categoryId}`
    ),

  // Get active count
  getActiveCount: () => api.get("/api/components/count"),

  // CRUD operations
  create: (componentData) => api.post("/api/components", componentData),
  update: (id, componentData) =>
    api.put(`/api/components/${id}`, componentData),
  delete: (id) => api.delete(`/api/components/${id}`),
  deactivate: (id) => api.patch(`/api/components/${id}/deactivate`),
};

// ===== COMPONENT OPTIONALS API =====
export const componentOptionalsAPI = {
  // Get all active component optionals
  getAll: () => api.get("/api/component-optionals"),

  // Get component optional by ID
  getById: (id) => api.get(`/api/component-optionals/${id}`),

  // Get component optionals by component ID
  getByComponentId: (componentId) =>
    api.get(`/api/component-optionals/component/${componentId}`),

  // Get component optional by name
  getByName: (name) =>
    api.get(`/api/component-optionals/name/${encodeURIComponent(name)}`),

  // Check if component optional exists
  checkExists: (name, componentId) =>
    api.get(
      `/api/component-optionals/exists/${encodeURIComponent(
        name
      )}/component/${componentId}`
    ),

  // Get active count
  getActiveCount: () => api.get("/api/component-optionals/count"),

  // CRUD operations
  create: (data) => api.post("/api/component-optionals", data),
  update: (id, data) => api.put(`/api/component-optionals/${id}`, data),
  delete: (id) => api.delete(`/api/component-optionals/${id}`),
  deactivate: (id) => api.patch(`/api/component-optionals/${id}/deactivate`),
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
  getByEmail: (email) =>
    api.get(`/api/users/email/${encodeURIComponent(email)}`),

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
  updateStatus: (id, status) =>
    api.patch(`/api/users/${id}/status`, { status }),
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

// ===== DESIGNERS API =====
export const designersAPI = {
  // Get all active designers (filtered by current user if authenticated)
  getAll: () => api.get("/api/designers"),

  // Get current user's designers (authenticated endpoint)
  getCurrentUserDesigners: () => api.get("/api/designers?filter=current-user"),

  // Get current user's designer info for dashboard
  getCurrentDesignerInfo: () => api.get("/api/designers?filter=current-user")
    .then(response => {
      const designers = response.data;

      return {
        data: designers && designers.length > 0 ? designers[0] : null,
        hasDesigner: designers && designers.length > 0
      };
    }),

  // Get designer by ID
  getById: (id) => api.get(`/api/designers/${id}`),

  // Get designer by code
  getByCode: (code) => api.get(`/api/designers/code/${code}`),

  // Get designers by specialty
  getBySpecialty: (specialty) => api.get(`/api/designers/specialty/${specialty}`),

  // Get verified designers
  getVerified: () => api.get("/api/designers/verified"),

  // Get featured designers
  getFeatured: () => api.get("/api/designers/featured"),

  // Search designers with pagination
  search: (searchTerm, params = {}) => {
    const { page = 0, size = 20 } = params;
    return api.get(`/api/designers/search`, {
      params: { search: searchTerm, page, size },
    });
  },

  // Check if designer exists by code
  checkExists: (code) => api.get(`/api/designers/exists/${code}`),

  // Get active count
  getActiveCount: () => api.get("/api/designers/count"),

  // CRUD operations
  create: (designerData) => api.post("/api/designers", designerData),
  update: (id, designerData) => api.put(`/api/designers/${id}`, designerData),
  delete: (id) => api.delete(`/api/designers/${id}`),
  deactivate: (id) => api.patch(`/api/designers/${id}/deactivate`),

  // Get design products for a specific designer
  getDesigns: (designerId) => api.get(`/api/designers/${designerId}/designs`),

  // Get design products for current user's designer
  getCurrentDesignerDesigns: () =>
    designersAPI.getCurrentDesignerInfo()
      .then(designerInfo => {
        if (designerInfo.hasDesigner && designerInfo.data) {
          return designersAPI.getDesigns(designerInfo.data.id);
        } else {
          return { data: [] };
        }
      }),

  // Get designer dashboard data by designer ID
  getDashboard: (designerId) => api.get(`/api/designers/${designerId}/dashboard`),

  // Get designer dashboard data for current user
  getCurrentUserDashboard: () => api.get("/api/designers/dashboard"),
};

// Keep the old designerAPI for backward compatibility but mark as deprecated
export const designerAPI = {
  // Get designer dashboard data - DEPRECATED: Use designersAPI.getCurrentUserDashboard()
  getDashboard: () => designersAPI.getCurrentUserDashboard(),
};

// ===== VENDORS API =====
export const vendorsAPI = {
  // Get all active vendors (filtered by current user if authenticated)
  getAll: () => api.get("/api/vendors"),
  
  // Get current user's vendors (authenticated endpoint)
  getCurrentUserVendors: () => api.get("/api/vendors?filter=current-user"),
  
  // Get current user's vendor info for dashboard
  getCurrentVendorInfo: () => api.get("/api/vendors?filter=current-user")
    .then(response => {
      const vendors = response.data;
      
      return { 
        data: vendors && vendors.length > 0 ? vendors[0] : null,
        hasVendor: vendors && vendors.length > 0
      };
    }),

  // Get vendor by ID
  getById: (id) => api.get(`/api/vendors/${id}`),

  // Get vendor by code
  getByCode: (code) => api.get(`/api/vendors/code/${code}`),

  // Get vendors by country
  getByCountry: (country) => api.get(`/api/vendors/country/${country}`),

  // Get vendors by type
  getByType: (vendorType) => api.get(`/api/vendors/type/${vendorType}`),

  // Search vendors with pagination
  search: (searchTerm, params = {}) => {
    const { page = 0, size = 20 } = params;
    return api.get(`/api/vendors/search`, {
      params: { search: searchTerm, page, size },
    });
  },

  // Check if vendor exists by code
  checkExists: (code) => api.get(`/api/vendors/exists/${code}`),

  // Get active count
  getActiveCount: () => api.get("/api/vendors/count"),

  // CRUD operations
  create: (vendorData) => api.post("/api/vendors", vendorData),
  update: (id, vendorData) => api.put(`/api/vendors/${id}`, vendorData),
  delete: (id) => api.delete(`/api/vendors/${id}`),
  deactivate: (id) => api.patch(`/api/vendors/${id}/deactivate`),
  
  // Get products for a specific vendor
  getProducts: (vendorId) => api.get(`/api/vendors/${vendorId}/products`),
  
  // Get products for current user's vendor
  getCurrentVendorProducts: () => 
    vendorsAPI.getCurrentVendorInfo()
      .then(vendorInfo => {
        if (vendorInfo.hasVendor && vendorInfo.data) {
          return vendorsAPI.getProducts(vendorInfo.data.id);
        } else {
          return { data: [] };
        }
      }),
};

// ===== FILE UPLOAD API =====
export const fileUploadAPI = {
  // Upload file (public endpoint - no auth required)
  upload: (
    file,
    description = "",
    bucketName = "mirror-storage",
    folderPath = "public"
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("bucketName", bucketName);
    formData.append("folderPath", folderPath);

    // Use raw axios without interceptors to bypass Authorization header
    return axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for file upload
    });
  },
};

// ===== NOTIFICATIONS API =====
export const notificationsAPI = {
  // Send email notification (public endpoint - no auth required)
  sendEmail: (recipients, emailType, model, captchaToken) => {
    // Use raw axios without interceptors to bypass Authorization header
    return axios.post(`${API_BASE_URL}/api/notifications/email`, {
      recipients,
      emailType,
      model,
      captchaToken,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  },
};

// Export the axios instance for custom calls
export default api;
