import api from './api';

/**
 * Partner Capability Service
 * Handles all API calls for vendor/partner capabilities management
 */

// ===== PARTNER CAPABILITY API =====
export const partnerCapabilityAPI = {
  // Get all capabilities for a vendor
  getByVendorId: (vendorId) =>
    api.get(`/api/v1/vendors/${vendorId}/capabilities`),

  // Get a specific capability
  getById: (vendorId, capabilityId) =>
    api.get(`/api/v1/vendors/${vendorId}/capabilities/${capabilityId}`),

  // Add a new capability to a vendor
  create: (vendorId, data) =>
    api.post(`/api/v1/vendors/${vendorId}/capabilities`, data),

  // Update an existing capability
  update: (vendorId, capabilityId, data) =>
    api.put(`/api/v1/vendors/${vendorId}/capabilities/${capabilityId}`, data),

  // Delete a capability
  delete: (vendorId, capabilityId) =>
    api.delete(`/api/v1/vendors/${vendorId}/capabilities/${capabilityId}`),

  // Get all capability types (for dropdown)
  getCapabilityTypes: () =>
    api.get('/api/v1/capability-types'),

  // Search vendors by capability
  searchVendorsByCapability: (capabilityType, params = {}) =>
    api.get('/api/v1/vendors/by-capability', {
      params: { capabilityType, ...params }
    }),

  // Get vendors with specific capabilities
  getVendorsWithCapabilities: (capabilityTypes = []) =>
    api.post('/api/v1/vendors/with-capabilities', { capabilityTypes }),

  // Get capability statistics for a vendor
  getVendorCapabilityStats: (vendorId) =>
    api.get(`/api/v1/vendors/${vendorId}/capabilities/stats`),
};

// ===== CAPABILITY TYPE CONSTANTS =====
export const CAPABILITY_TYPES = {
  // Stone related
  STONE_SOURCING: 'STONE_SOURCING',
  STONE_CUTTING: 'STONE_CUTTING',
  STONE_GRADING: 'STONE_GRADING',

  // Metal related
  METAL_CASTING: 'METAL_CASTING',
  METAL_REFINING: 'METAL_REFINING',
  ELECTROPLATING: 'ELECTROPLATING',

  // Assembly related
  SETTING: 'SETTING',
  ASSEMBLY: 'ASSEMBLY',
  POLISHING: 'POLISHING',
  FINISHING: 'FINISHING',

  // Special techniques
  ENGRAVING: 'ENGRAVING',
  ENAMELING: 'ENAMELING',
  FILIGREE: 'FILIGREE',
  MICRO_PAVE: 'MICRO_PAVE',

  // Quality & Certification
  QUALITY_CONTROL: 'QUALITY_CONTROL',
  CERTIFICATION: 'CERTIFICATION',

  // Logistics
  PACKAGING: 'PACKAGING',
  SHIPPING: 'SHIPPING',
};

export const CAPABILITY_TYPE_LABELS = {
  [CAPABILITY_TYPES.STONE_SOURCING]: 'Stone Sourcing',
  [CAPABILITY_TYPES.STONE_CUTTING]: 'Stone Cutting',
  [CAPABILITY_TYPES.STONE_GRADING]: 'Stone Grading',
  [CAPABILITY_TYPES.METAL_CASTING]: 'Metal Casting',
  [CAPABILITY_TYPES.METAL_REFINING]: 'Metal Refining',
  [CAPABILITY_TYPES.ELECTROPLATING]: 'Electroplating',
  [CAPABILITY_TYPES.SETTING]: 'Setting',
  [CAPABILITY_TYPES.ASSEMBLY]: 'Assembly',
  [CAPABILITY_TYPES.POLISHING]: 'Polishing',
  [CAPABILITY_TYPES.FINISHING]: 'Finishing',
  [CAPABILITY_TYPES.ENGRAVING]: 'Engraving',
  [CAPABILITY_TYPES.ENAMELING]: 'Enameling',
  [CAPABILITY_TYPES.FILIGREE]: 'Filigree',
  [CAPABILITY_TYPES.MICRO_PAVE]: 'Micro Pave',
  [CAPABILITY_TYPES.QUALITY_CONTROL]: 'Quality Control',
  [CAPABILITY_TYPES.CERTIFICATION]: 'Certification',
  [CAPABILITY_TYPES.PACKAGING]: 'Packaging',
  [CAPABILITY_TYPES.SHIPPING]: 'Shipping',
};

export const CAPABILITY_TYPE_COLORS = {
  // Stone related - Blue tones
  [CAPABILITY_TYPES.STONE_SOURCING]: { bg: '#dbeafe', color: '#1e40af' },
  [CAPABILITY_TYPES.STONE_CUTTING]: { bg: '#e0e7ff', color: '#3730a3' },
  [CAPABILITY_TYPES.STONE_GRADING]: { bg: '#c7d2fe', color: '#4338ca' },

  // Metal related - Orange/Amber tones
  [CAPABILITY_TYPES.METAL_CASTING]: { bg: '#fef3c7', color: '#854d0e' },
  [CAPABILITY_TYPES.METAL_REFINING]: { bg: '#fed7aa', color: '#9a3412' },
  [CAPABILITY_TYPES.ELECTROPLATING]: { bg: '#ffedd5', color: '#c2410c' },

  // Assembly related - Green tones
  [CAPABILITY_TYPES.SETTING]: { bg: '#dcfce7', color: '#166534' },
  [CAPABILITY_TYPES.ASSEMBLY]: { bg: '#d1fae5', color: '#065f46' },
  [CAPABILITY_TYPES.POLISHING]: { bg: '#a7f3d0', color: '#047857' },
  [CAPABILITY_TYPES.FINISHING]: { bg: '#bbf7d0', color: '#15803d' },

  // Special techniques - Purple tones
  [CAPABILITY_TYPES.ENGRAVING]: { bg: '#f3e8ff', color: '#6b21a8' },
  [CAPABILITY_TYPES.ENAMELING]: { bg: '#e9d5ff', color: '#7c3aed' },
  [CAPABILITY_TYPES.FILIGREE]: { bg: '#ddd6fe', color: '#5b21b6' },
  [CAPABILITY_TYPES.MICRO_PAVE]: { bg: '#ede9fe', color: '#6d28d9' },

  // Quality & Certification - Teal tones
  [CAPABILITY_TYPES.QUALITY_CONTROL]: { bg: '#ccfbf1', color: '#0f766e' },
  [CAPABILITY_TYPES.CERTIFICATION]: { bg: '#99f6e4', color: '#0d9488' },

  // Logistics - Gray tones
  [CAPABILITY_TYPES.PACKAGING]: { bg: '#f1f5f9', color: '#475569' },
  [CAPABILITY_TYPES.SHIPPING]: { bg: '#e2e8f0', color: '#334155' },
};

export const CAPABILITY_CATEGORIES = [
  {
    name: 'Stone Processing',
    types: [
      CAPABILITY_TYPES.STONE_SOURCING,
      CAPABILITY_TYPES.STONE_CUTTING,
      CAPABILITY_TYPES.STONE_GRADING,
    ],
  },
  {
    name: 'Metal Work',
    types: [
      CAPABILITY_TYPES.METAL_CASTING,
      CAPABILITY_TYPES.METAL_REFINING,
      CAPABILITY_TYPES.ELECTROPLATING,
    ],
  },
  {
    name: 'Assembly & Finishing',
    types: [
      CAPABILITY_TYPES.SETTING,
      CAPABILITY_TYPES.ASSEMBLY,
      CAPABILITY_TYPES.POLISHING,
      CAPABILITY_TYPES.FINISHING,
    ],
  },
  {
    name: 'Special Techniques',
    types: [
      CAPABILITY_TYPES.ENGRAVING,
      CAPABILITY_TYPES.ENAMELING,
      CAPABILITY_TYPES.FILIGREE,
      CAPABILITY_TYPES.MICRO_PAVE,
    ],
  },
  {
    name: 'Quality & Logistics',
    types: [
      CAPABILITY_TYPES.QUALITY_CONTROL,
      CAPABILITY_TYPES.CERTIFICATION,
      CAPABILITY_TYPES.PACKAGING,
      CAPABILITY_TYPES.SHIPPING,
    ],
  },
];

// ===== QUALITY RATING =====
export const QUALITY_RATINGS = [
  { value: 1, label: '1 - Basic', description: 'Basic quality' },
  { value: 2, label: '2 - Standard', description: 'Standard quality' },
  { value: 3, label: '3 - Good', description: 'Good quality' },
  { value: 4, label: '4 - Excellent', description: 'Excellent quality' },
  { value: 5, label: '5 - Premium', description: 'Premium quality' },
];

// ===== HELPER FUNCTIONS =====

/**
 * Get capability type label
 */
export const getCapabilityLabel = (type) => {
  return CAPABILITY_TYPE_LABELS[type] || type;
};

/**
 * Get capability type color config
 */
export const getCapabilityColor = (type) => {
  return CAPABILITY_TYPE_COLORS[type] || { bg: '#f1f5f9', color: '#475569' };
};

/**
 * Get all capability types as options for dropdown
 */
export const getCapabilityTypeOptions = () => {
  return Object.keys(CAPABILITY_TYPES).map((key) => ({
    value: CAPABILITY_TYPES[key],
    label: CAPABILITY_TYPE_LABELS[CAPABILITY_TYPES[key]],
  }));
};

/**
 * Get capability types grouped by category
 */
export const getGroupedCapabilityTypes = () => {
  return CAPABILITY_CATEGORIES.map((category) => ({
    ...category,
    options: category.types.map((type) => ({
      value: type,
      label: CAPABILITY_TYPE_LABELS[type],
    })),
  }));
};

/**
 * Format lead time display
 */
export const formatLeadTime = (days) => {
  if (!days) return 'N/A';
  if (days === 1) return '1 day';
  return `${days} days`;
};

/**
 * Format cost rate display
 */
export const formatCostRate = (amount, currency = 'USD') => {
  if (!amount) return 'N/A';
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Render quality rating as stars or visual
 */
export const renderQualityRating = (rating) => {
  if (!rating || rating < 1 || rating > 5) return 'N/A';
  return QUALITY_RATINGS.find((r) => r.value === rating)?.label || `${rating}/5`;
};

/**
 * Check if vendor has specific capability
 */
export const vendorHasCapability = (capabilities, capabilityType) => {
  if (!Array.isArray(capabilities)) return false;
  return capabilities.some((cap) => cap.capabilityType === capabilityType);
};

/**
 * Get vendor's capability details by type
 */
export const getVendorCapability = (capabilities, capabilityType) => {
  if (!Array.isArray(capabilities)) return null;
  return capabilities.find((cap) => cap.capabilityType === capabilityType);
};

export default partnerCapabilityAPI;
