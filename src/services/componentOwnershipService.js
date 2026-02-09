import api from './api';

/**
 * Component Ownership Service
 * Handles all API calls for component ownership tracking and handoff management
 */

// ===== COMPONENT OWNERSHIP API =====
export const componentOwnershipAPI = {
  // Get handoff by ID
  getById: (id) => api.get(`/api/v1/component-ownership/${id}`),

  // Get complete ownership history for a production order
  getOrderHistory: (orderId) => api.get(`/api/v1/component-ownership/order/${orderId}`),

  // Get paginated ownership history for a production order
  getOrderHistoryPaged: (orderId, params = {}) =>
    api.get(`/api/v1/component-ownership/order/${orderId}/paged`, { params }),

  // Get the most recent handoff for a production order
  getLatestHandoff: (orderId) => api.get(`/api/v1/component-ownership/order/${orderId}/latest`),

  // Check if order has an active handoff in progress
  hasActiveHandoff: (orderId) => api.get(`/api/v1/component-ownership/order/${orderId}/has-active`),

  // Get handoffs awaiting receipt confirmation by vendor
  getPendingReceipts: (vendorId) => api.get(`/api/v1/component-ownership/vendor/${vendorId}/pending`),

  // Get paginated pending receipts
  getPendingReceiptsPaged: (vendorId, params = {}) =>
    api.get(`/api/v1/component-ownership/vendor/${vendorId}/pending/paged`, { params }),

  // Get count of pending receipts
  countPendingReceipts: (vendorId) =>
    api.get(`/api/v1/component-ownership/vendor/${vendorId}/pending/count`),

  // Get items currently held by a vendor
  getItemsHeldByVendor: (vendorId) =>
    api.get(`/api/v1/component-ownership/vendor/${vendorId}/holding`),

  // Get all handoffs initiated by a vendor
  getHandoffsSentByVendor: (vendorId) =>
    api.get(`/api/v1/component-ownership/vendor/${vendorId}/sent`),

  // Get all handoffs received by a vendor
  getHandoffsReceivedByVendor: (vendorId) =>
    api.get(`/api/v1/component-ownership/vendor/${vendorId}/received`),

  // Get all handoffs past expected arrival date
  getOverdueHandoffs: () => api.get('/api/v1/component-ownership/overdue'),

  // Get overdue handoffs for a specific vendor
  getOverdueHandoffsForVendor: (vendorId) =>
    api.get(`/api/v1/component-ownership/vendor/${vendorId}/overdue`),

  // Get all handoffs with a specific status
  getByStatus: (status, params = {}) =>
    api.get(`/api/v1/component-ownership/status/${status}`, { params }),

  // Initiate a new component handoff
  initiateHandoff: (data) => api.post('/api/v1/component-ownership/initiate', data),

  // Mark handoff as in-transit with shipping details
  markInTransit: (handoffId, data) =>
    api.patch(`/api/v1/component-ownership/${handoffId}/in-transit`, data),

  // Confirm receipt of a handoff
  confirmReceipt: (handoffId, data = {}) =>
    api.patch(`/api/v1/component-ownership/${handoffId}/confirm-receipt`, data),

  // Reject a handoff with reason
  rejectHandoff: (handoffId, data) =>
    api.patch(`/api/v1/component-ownership/${handoffId}/reject`, data),

  // Cancel an initiated handoff
  cancelHandoff: (handoffId, reason = null) =>
    api.patch(`/api/v1/component-ownership/${handoffId}/cancel`, null, {
      params: { reason },
    }),
};

// ===== HANDOFF STATUS CONSTANTS =====
export const HANDOFF_STATUS = {
  INITIATED: 'INITIATED',
  IN_TRANSIT: 'IN_TRANSIT',
  RECEIVED: 'RECEIVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

export const HANDOFF_STATUS_CONFIG = {
  INITIATED: {
    bg: '#dbeafe',
    color: '#1e40af',
    label: 'Initiated',
    icon: '📤',
    description: 'Handoff initiated, awaiting shipment',
  },
  IN_TRANSIT: {
    bg: '#fef3c7',
    color: '#854d0e',
    label: 'In Transit',
    icon: '🚚',
    description: 'Component is being shipped',
  },
  RECEIVED: {
    bg: '#dcfce7',
    color: '#166534',
    label: 'Received',
    icon: '✅',
    description: 'Receipt confirmed by vendor',
  },
  REJECTED: {
    bg: '#fee2e2',
    color: '#991b1b',
    label: 'Rejected',
    icon: '❌',
    description: 'Handoff rejected by recipient',
  },
  CANCELLED: {
    bg: '#e5e7eb',
    color: '#6b7280',
    label: 'Cancelled',
    icon: '🚫',
    description: 'Handoff was cancelled',
  },
};

// ===== HANDOFF TYPE CONSTANTS =====
export const HANDOFF_TYPE = {
  INITIAL_ASSIGNMENT: 'INITIAL_ASSIGNMENT',
  STAGE_START: 'STAGE_START',
  STAGE_COMPLETE: 'STAGE_COMPLETE',
  VENDOR_REASSIGN: 'VENDOR_REASSIGN',
  RETURN_TO_MIRROR: 'RETURN_TO_MIRROR',
  REWORK_RETURN: 'REWORK_RETURN',
};

export const HANDOFF_TYPE_CONFIG = {
  INITIAL_ASSIGNMENT: {
    label: 'Initial Assignment',
    icon: '🏁',
    description: 'Component sent from MIRROR to first vendor',
  },
  STAGE_START: {
    label: 'Stage Start',
    icon: '▶️',
    description: 'Component transferred to vendor for stage work',
  },
  STAGE_COMPLETE: {
    label: 'Stage Complete',
    icon: '✔️',
    description: 'Stage completed, component moving to next vendor',
  },
  VENDOR_REASSIGN: {
    label: 'Vendor Reassign',
    icon: '🔄',
    description: 'Component reassigned to different vendor',
  },
  RETURN_TO_MIRROR: {
    label: 'Return to MIRROR',
    icon: '🏠',
    description: 'Component returned to MIRROR (final or rework)',
  },
  REWORK_RETURN: {
    label: 'Rework Return',
    icon: '⚠️',
    description: 'Component returned for rework',
  },
};

// ===== HELPER FUNCTIONS =====

/**
 * Get handoff status config for display
 */
export const getHandoffStatusConfig = (status) => {
  return HANDOFF_STATUS_CONFIG[status] || HANDOFF_STATUS_CONFIG.INITIATED;
};

/**
 * Get handoff type config for display
 */
export const getHandoffTypeConfig = (type) => {
  return HANDOFF_TYPE_CONFIG[type] || { label: type, icon: '📦', description: '' };
};

/**
 * Check if handoff can be confirmed
 */
export const canConfirmReceipt = (handoff) => {
  if (handoff.canConfirmReceipt !== undefined) {
    return handoff.canConfirmReceipt;
  }
  return [HANDOFF_STATUS.INITIATED, HANDOFF_STATUS.IN_TRANSIT].includes(handoff.status);
};

/**
 * Check if handoff can be rejected
 */
export const canRejectHandoff = (handoff) => {
  if (handoff.canReject !== undefined) {
    return handoff.canReject;
  }
  return [HANDOFF_STATUS.INITIATED, HANDOFF_STATUS.IN_TRANSIT].includes(handoff.status);
};

/**
 * Check if handoff can be cancelled
 */
export const canCancelHandoff = (handoff) => {
  if (handoff.canCancel !== undefined) {
    return handoff.canCancel;
  }
  return handoff.status === HANDOFF_STATUS.INITIATED;
};

/**
 * Check if handoff is in terminal state
 */
export const isTerminalStatus = (handoff) => {
  if (handoff.isTerminal !== undefined) {
    return handoff.isTerminal;
  }
  return [
    HANDOFF_STATUS.RECEIVED,
    HANDOFF_STATUS.REJECTED,
    HANDOFF_STATUS.CANCELLED,
  ].includes(handoff.status);
};

/**
 * Check if handoff is overdue
 */
export const isOverdue = (handoff) => {
  if (handoff.isOverdue !== undefined) {
    return handoff.isOverdue;
  }
  if (isTerminalStatus(handoff) || !handoff.expectedArrivalDate) {
    return false;
  }
  return new Date(handoff.expectedArrivalDate) < new Date();
};

/**
 * Format handoff for display in timeline
 */
export const formatHandoffForTimeline = (handoff) => {
  const statusConfig = getHandoffStatusConfig(handoff.status);
  const typeConfig = getHandoffTypeConfig(handoff.handoffType);

  return {
    ...handoff,
    statusLabel: statusConfig.label,
    statusIcon: statusConfig.icon,
    statusColor: statusConfig.color,
    statusBg: statusConfig.bg,
    typeLabel: typeConfig.label,
    typeIcon: typeConfig.icon,
    fromLabel: handoff.fromVendorName || 'MIRROR',
    toLabel: handoff.toVendorName || 'MIRROR',
    isOverdue: isOverdue(handoff),
  };
};

/**
 * Group handoffs by date for timeline display
 */
export const groupHandoffsByDate = (handoffs) => {
  const groups = {};
  handoffs.forEach((handoff) => {
    const date = new Date(handoff.initiatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(formatHandoffForTimeline(handoff));
  });
  return groups;
};

/**
 * Get summary statistics for handoffs
 */
export const getHandoffStats = (handoffs) => {
  const stats = {
    total: handoffs.length,
    byStatus: {},
    pending: 0,
    completed: 0,
    overdue: 0,
    avgTransitDays: 0,
  };

  let totalTransitDays = 0;
  let transitCount = 0;

  handoffs.forEach((h) => {
    // Count by status
    stats.byStatus[h.status] = (stats.byStatus[h.status] || 0) + 1;

    // Pending (not terminal)
    if (!isTerminalStatus(h)) {
      stats.pending++;
      if (isOverdue(h)) {
        stats.overdue++;
      }
    } else if (h.status === HANDOFF_STATUS.RECEIVED) {
      stats.completed++;

      // Calculate transit time for completed handoffs
      if (h.initiatedAt && h.receivedAt) {
        const days =
          (new Date(h.receivedAt) - new Date(h.initiatedAt)) / (1000 * 60 * 60 * 24);
        totalTransitDays += days;
        transitCount++;
      }
    }
  });

  if (transitCount > 0) {
    stats.avgTransitDays = Math.round((totalTransitDays / transitCount) * 10) / 10;
  }

  return stats;
};

/**
 * Format date for display
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date only for display
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
 * Get days until expected arrival
 */
export const getDaysUntilArrival = (expectedArrivalDate) => {
  if (!expectedArrivalDate) return null;
  const days = Math.ceil(
    (new Date(expectedArrivalDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  return days;
};

/**
 * Get arrival status label
 */
export const getArrivalStatusLabel = (expectedArrivalDate) => {
  const days = getDaysUntilArrival(expectedArrivalDate);
  if (days === null) return null;
  if (days < 0) return { label: `${Math.abs(days)} days overdue`, color: '#dc2626' };
  if (days === 0) return { label: 'Due today', color: '#f59e0b' };
  if (days === 1) return { label: 'Due tomorrow', color: '#f59e0b' };
  if (days <= 3) return { label: `Due in ${days} days`, color: '#3b82f6' };
  return { label: `Due in ${days} days`, color: '#6b7280' };
};

export default componentOwnershipAPI;
