import api from './api';

/**
 * Production Plan Service
 * Handles all API calls for production plan management
 */

// ===== PRODUCTION PLAN API =====
export const productionPlanAPI = {
  // Get all production plans with optional filters
  getAll: (params = {}) => api.get('/api/v1/production-plans', { params }),

  // Get production plan by ID
  getById: (id) => api.get(`/api/v1/production-plans/${id}`),

  // Get production plans by status
  getByStatus: (status, params = {}) =>
    api.get(`/api/v1/production-plans/status/${status}`, { params }),

  // Get production plans by collection plan
  getByCollectionPlan: (collectionPlanId, params = {}) =>
    api.get(`/api/v1/production-plans/collection-plan/${collectionPlanId}`, { params }),

  // Get production plans by workflow template
  getByWorkflowTemplate: (templateId, params = {}) =>
    api.get(`/api/v1/production-plans/workflow-template/${templateId}`, { params }),

  // Search production plans
  search: (query, params = {}) =>
    api.get('/api/v1/production-plans/search', { params: { q: query, ...params } }),

  // Get filter options (statuses, collections, templates)
  getFilterOptions: () => api.get('/api/v1/production-plans/filter-options'),

  // Get statistics
  getStatistics: () => api.get('/api/v1/production-plans/statistics'),

  // CRUD operations
  create: (data) => api.post('/api/v1/production-plans', data),

  update: (id, data) => api.put(`/api/v1/production-plans/${id}`, data),

  delete: (id) => api.delete(`/api/v1/production-plans/${id}`),

  // Status transitions
  start: (id) => api.post(`/api/v1/production-plans/${id}/start`),

  pause: (id) => api.post(`/api/v1/production-plans/${id}/pause`),

  resume: (id) => api.post(`/api/v1/production-plans/${id}/resume`),

  complete: (id) => api.post(`/api/v1/production-plans/${id}/complete`),

  cancel: (id, reason) => api.post(`/api/v1/production-plans/${id}/cancel`, { reason }),

  // Generate production orders for this plan
  generateOrders: (id) => api.post(`/api/v1/production-plans/${id}/generate-orders`),

  // Get production orders for this plan
  getOrders: (id, params = {}) =>
    api.get(`/api/v1/production-plans/${id}/orders`, { params }),

  // Get progress/summary for this plan
  getProgress: (id) => api.get(`/api/v1/production-plans/${id}/progress`),

  // Update target dates
  updateTargetDates: (id, startDate, endDate) =>
    api.put(`/api/v1/production-plans/${id}/target-dates`, { targetStartDate: startDate, targetEndDate: endDate }),
};

// ===== PRODUCTION PLAN CONSTANTS =====
export const PRODUCTION_PLAN_STATUS = {
  DRAFT: 'DRAFT',
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const PRODUCTION_PLAN_STATUS_CONFIG = {
  DRAFT: { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  PLANNED: { bg: '#dbeafe', color: '#1e40af', label: 'Planned' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#854d0e', label: 'In Progress' },
  PAUSED: { bg: '#fed7aa', color: '#9a3412', label: 'Paused' },
  COMPLETED: { bg: '#dcfce7', color: '#166534', label: 'Completed' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

// Status transitions allowed
export const PRODUCTION_PLAN_STATUS_TRANSITIONS = {
  DRAFT: ['PLANNED', 'CANCELLED'],
  PLANNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// ===== HELPER FUNCTIONS =====

/**
 * Get status config for display
 */
export const getStatusConfig = (status) => {
  return PRODUCTION_PLAN_STATUS_CONFIG[status] || PRODUCTION_PLAN_STATUS_CONFIG.DRAFT;
};

/**
 * Get allowed next statuses for a given status
 */
export const getAllowedTransitions = (currentStatus) => {
  return PRODUCTION_PLAN_STATUS_TRANSITIONS[currentStatus] || [];
};

/**
 * Check if transition is allowed
 */
export const canTransitionTo = (currentStatus, targetStatus) => {
  const allowed = PRODUCTION_PLAN_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
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
 * Format date range for display
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return '-';
  if (!startDate) return `Until ${formatDate(endDate)}`;
  if (!endDate) return `From ${formatDate(startDate)}`;
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (completedCount, totalCount) => {
  if (!totalCount || totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (percentage) => {
  if (percentage >= 100) return { bg: '#dcfce7', color: '#166534' }; // Green
  if (percentage >= 75) return { bg: '#dbeafe', color: '#1e40af' }; // Blue
  if (percentage >= 50) return { bg: '#fef3c7', color: '#854d0e' }; // Yellow
  if (percentage >= 25) return { bg: '#fed7aa', color: '#9a3412' }; // Orange
  return { bg: '#f1f5f9', color: '#475569' }; // Gray
};

/**
 * Validate production plan
 */
export const validateProductionPlan = (plan) => {
  const errors = {};

  if (!plan.name?.trim()) {
    errors.name = 'Plan name is required';
  }

  if (!plan.collectionPlanId) {
    errors.collectionPlanId = 'Collection plan is required';
  }

  if (!plan.workflowTemplateId) {
    errors.workflowTemplateId = 'Workflow template is required';
  }

  if (plan.targetStartDate && plan.targetEndDate) {
    const startDate = new Date(plan.targetStartDate);
    const endDate = new Date(plan.targetEndDate);
    if (endDate < startDate) {
      errors.targetEndDate = 'End date must be after start date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format progress text
 */
export const formatProgressText = (completedCount, totalCount) => {
  if (totalCount === 0) return 'No orders';
  if (completedCount === totalCount) return 'All complete';
  return `${completedCount}/${totalCount} orders complete`;
};

/**
 * Check if plan is editable
 */
export const isPlanEditable = (status) => {
  return [PRODUCTION_PLAN_STATUS.DRAFT, PRODUCTION_PLAN_STATUS.PLANNED].includes(status);
};

/**
 * Check if orders can be generated for plan
 */
export const canGenerateOrders = (status, hasOrders) => {
  // Can only generate orders for PLANNED status and if no orders exist yet
  return status === PRODUCTION_PLAN_STATUS.PLANNED && !hasOrders;
};

export default productionPlanAPI;
