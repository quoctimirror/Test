import api from './api';

/**
 * Production Order Service
 * Handles all API calls for production order and stage management
 */

// ===== PRODUCTION ORDER API =====
export const productionOrderAPI = {
  // Get all production orders with optional filters
  getAll: (params = {}) => api.get('/api/v1/production-orders', { params }),

  // Get production order by ID with stages
  getById: (id) => api.get(`/api/v1/production-orders/${id}`),

  // Get production orders by production plan
  getByPlan: (planId) => api.get(`/api/v1/production-orders/by-plan/${planId}`),

  // Get production orders by status
  getByStatus: (status) => api.get(`/api/v1/production-orders/by-status/${status}`),

  // Get production orders by current holder (vendor)
  getByHolder: (vendorId) => api.get(`/api/v1/production-orders/by-holder/${vendorId}`),

  // Get production orders by JTRC
  getByJtrc: (jtrcId) => api.get(`/api/v1/production-orders/by-jtrc/${jtrcId}`),

  // Get order count
  getCount: () => api.get('/api/v1/production-orders/count'),

  // CRUD operations
  create: (data) => api.post('/api/v1/production-orders', data),

  update: (id, data) => api.put(`/api/v1/production-orders/${id}`, data),

  delete: (id) => api.delete(`/api/v1/production-orders/${id}`),

  // Status update
  updateStatus: (id, status, reason = null) =>
    api.patch(`/api/v1/production-orders/${id}/status`, { status, reason }),

  // Get cost estimate for order
  getCostEstimate: (id) => api.get(`/api/v1/production-orders/${id}/cost-estimate`),
};

// ===== STAGE LIFECYCLE API =====
export const stageAPI = {
  // Start a stage
  start: (orderId, stageId) =>
    api.post(`/api/v1/production-orders/${orderId}/stages/${stageId}/start`),

  // Complete a stage
  complete: (orderId, stageId, data = {}) =>
    api.post(`/api/v1/production-orders/${orderId}/stages/${stageId}/complete`, data),

  // Skip an optional stage
  skip: (orderId, stageId, reason = null) =>
    api.post(`/api/v1/production-orders/${orderId}/stages/${stageId}/skip`, null, {
      params: { reason },
    }),

  // Assign vendor to a stage
  assignVendor: (orderId, stageId, data) =>
    api.patch(`/api/v1/production-orders/${orderId}/stages/${stageId}/assign`, data),

  // Bulk assign vendors to multiple stages
  bulkAssign: (orderId, assignments) =>
    api.post(`/api/v1/production-orders/${orderId}/stages/bulk-assign`, { assignments }),

  // Get stages by vendor
  getByVendor: (vendorId) => api.get(`/api/v1/production-orders/stages/by-vendor/${vendorId}`),
};

// ===== PARTNER CAPABILITY API =====
export const partnerAPI = {
  // Get vendors by capability type
  getByCapability: (capabilityType) =>
    api.get(`/api/v1/partners/by-capability/${capabilityType}`),
};

// ===== PRODUCTION ORDER CONSTANTS =====
export const PRODUCTION_ORDER_STATUS = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const PRODUCTION_ORDER_STATUS_CONFIG = {
  DRAFT: { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  READY: { bg: '#dbeafe', color: '#1e40af', label: 'Ready' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#854d0e', label: 'In Progress' },
  COMPLETED: { bg: '#dcfce7', color: '#166534', label: 'Completed' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

// ===== STAGE STATUS CONSTANTS =====
export const STAGE_STATUS = {
  BLOCKED: 'BLOCKED',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
};

export const STAGE_STATUS_CONFIG = {
  BLOCKED: { bg: '#f1f5f9', color: '#64748b', label: 'Blocked', icon: '🔒' },
  READY: { bg: '#dbeafe', color: '#1e40af', label: 'Ready', icon: '🔵' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#854d0e', label: 'In Progress', icon: '🔄' },
  COMPLETED: { bg: '#dcfce7', color: '#166534', label: 'Completed', icon: '✅' },
  SKIPPED: { bg: '#e5e7eb', color: '#6b7280', label: 'Skipped', icon: '⏭️' },
};

// ===== PARTNER CAPABILITY TYPES =====
export const CAPABILITY_TYPES = {
  STONE_SOURCING: { label: 'Stone Sourcing', icon: '💎' },
  STONE_CUTTING: { label: 'Stone Cutting', icon: '✂️' },
  STONE_GRADING: { label: 'Stone Grading', icon: '🔬' },
  METAL_CASTING: { label: 'Metal Casting', icon: '🔥' },
  METAL_REFINING: { label: 'Metal Refining', icon: '⚗️' },
  ELECTROPLATING: { label: 'Electroplating', icon: '⚡' },
  SETTING: { label: 'Setting', icon: '💍' },
  ASSEMBLY: { label: 'Assembly', icon: '🔧' },
  POLISHING: { label: 'Polishing', icon: '✨' },
  FINISHING: { label: 'Finishing', icon: '🎨' },
  ENGRAVING: { label: 'Engraving', icon: '✏️' },
  ENAMELING: { label: 'Enameling', icon: '🎭' },
  FILIGREE: { label: 'Filigree', icon: '🕸️' },
  MICRO_PAVE: { label: 'Micro Pave', icon: '🔸' },
  QUALITY_CONTROL: { label: 'Quality Control', icon: '🔍' },
  CERTIFICATION: { label: 'Certification', icon: '📜' },
  PACKAGING: { label: 'Packaging', icon: '📦' },
  SHIPPING: { label: 'Shipping', icon: '🚚' },
};

// ===== HELPER FUNCTIONS =====

/**
 * Get order status config for display
 */
export const getOrderStatusConfig = (status) => {
  return PRODUCTION_ORDER_STATUS_CONFIG[status] || PRODUCTION_ORDER_STATUS_CONFIG.DRAFT;
};

/**
 * Get stage status config for display
 */
export const getStageStatusConfig = (status) => {
  return STAGE_STATUS_CONFIG[status] || STAGE_STATUS_CONFIG.BLOCKED;
};

/**
 * Get capability type config for display
 */
export const getCapabilityConfig = (type) => {
  return CAPABILITY_TYPES[type] || { label: type, icon: '🔹' };
};

/**
 * Check if stage can be started
 */
export const canStartStage = (stage) => {
  return stage.status === STAGE_STATUS.READY && stage.assignedVendorId;
};

/**
 * Check if stage can be completed
 */
export const canCompleteStage = (stage) => {
  return stage.status === STAGE_STATUS.IN_PROGRESS;
};

/**
 * Check if stage can be skipped
 */
export const canSkipStage = (stage) => {
  return [STAGE_STATUS.BLOCKED, STAGE_STATUS.READY].includes(stage.status) && !stage.isFinalStage;
};

/**
 * Check if vendor can be assigned to stage
 * Note: This now uses the backend-computed canAssign field when available.
 * Falls back to local check for backward compatibility.
 */
export const canAssignVendor = (stage) => {
  // Use backend-computed value if available
  if (stage.canAssign !== undefined && stage.canAssign !== null) {
    return stage.canAssign;
  }
  // Fallback to local check for backward compatibility
  return ![STAGE_STATUS.COMPLETED, STAGE_STATUS.SKIPPED].includes(stage.status);
};

/**
 * Calculate order progress
 */
export const calculateOrderProgress = (stages) => {
  if (!stages || stages.length === 0) return 0;
  const completedOrSkipped = stages.filter(
    (s) => s.status === STAGE_STATUS.COMPLETED || s.status === STAGE_STATUS.SKIPPED
  ).length;
  return Math.round((completedOrSkipped / stages.length) * 100);
};

/**
 * Get current stage from order
 */
export const getCurrentStage = (stages, currentStageOrder) => {
  if (!stages || stages.length === 0) return null;
  return stages.find((s) => s.stageOrder === currentStageOrder) || stages[0];
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get stages needing assignment
 */
export const getStagesNeedingAssignment = (stages) => {
  return stages.filter(
    (s) =>
      !s.assignedVendorId &&
      s.status !== STAGE_STATUS.COMPLETED &&
      s.status !== STAGE_STATUS.SKIPPED
  );
};

/**
 * Get assigned stages count
 */
export const getAssignedStagesCount = (stages) => {
  return stages.filter((s) => s.assignedVendorId).length;
};

export default productionOrderAPI;
