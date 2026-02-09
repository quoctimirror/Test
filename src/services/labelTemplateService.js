import api from './api';

/**
 * Label Template Service
 * Handles all API calls for label template management and printing
 */

// ===== LABEL TEMPLATE API =====
export const labelTemplateAPI = {
  // Get all label templates with optional filters
  getAll: (params = {}) => api.get('/api/v1/label-templates', { params }),

  // Get label template by ID
  getById: (id) => api.get(`/api/v1/label-templates/${id}`),

  // Get label templates by type
  getByType: (labelType) => api.get(`/api/v1/label-templates/by-type/${labelType}`),

  // Get default template for a label type
  getDefault: (labelType) => api.get(`/api/v1/label-templates/default/${labelType}`),

  // Get all default templates
  getDefaults: () => api.get('/api/v1/label-templates/defaults'),

  // Get distinct label types that have templates
  getTypes: () => api.get('/api/v1/label-templates/types'),

  // Get all label types (enum values)
  getAllTypes: () => api.get('/api/v1/label-templates/all-types'),

  // Get supported variables
  getVariables: () => api.get('/api/v1/label-templates/variables'),

  // Get template count
  getCount: () => api.get('/api/v1/label-templates/count'),

  // CRUD operations
  create: (data) => api.post('/api/v1/label-templates', data),

  update: (id, data) => api.put(`/api/v1/label-templates/${id}`, data),

  delete: (id) => api.delete(`/api/v1/label-templates/${id}`),

  // Duplicate template
  duplicate: (id, newName) => api.post(`/api/v1/label-templates/${id}/duplicate`, null, {
    params: { newName }
  }),

  // Generate preview for a template
  preview: (id, variables = {}) =>
    api.post(`/api/v1/label-templates/${id}/preview`, variables),
};

// ===== LABEL RENDERING API =====
export const labelAPI = {
  // Render a label with variable substitution
  render: (data) => api.post('/api/v1/labels/render', data),

  // Generate a preview with image
  preview: (data) => api.post('/api/v1/labels/preview', data),

  // Batch render labels for multiple products
  renderBatch: (data) => api.post('/api/v1/labels/render-batch', data),

  // Preview batch labels (first 5)
  previewBatch: (data) => api.post('/api/v1/labels/preview-batch', data),

  // Get product variables
  getProductVariables: (productId) =>
    api.get(`/api/v1/labels/product-variables/${productId}`),
};

// ===== LOCAL PRINT SERVICE API =====
// This calls the local print server running on the same network

const LOCAL_PRINT_SERVER = 'http://localhost:3001';

export const printerAPI = {
  // Set base URL for local print service
  setBaseUrl: (url) => {
    printerAPI._baseUrl = url;
  },

  // Get configured base URL
  getBaseUrl: () => printerAPI._baseUrl || LOCAL_PRINT_SERVER,

  // Health check
  health: async () => {
    try {
      const response = await fetch(`${printerAPI.getBaseUrl()}/health`);
      return await response.json();
    } catch (error) {
      throw new Error(`Print server unavailable: ${error.message}`);
    }
  },

  // Get available printers
  getPrinters: async () => {
    try {
      const response = await fetch(`${printerAPI.getBaseUrl()}/printers`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get printers: ${error.message}`);
    }
  },

  // Get printer status
  getStatus: async (printerName) => {
    try {
      const url = printerName
        ? `${printerAPI.getBaseUrl()}/status/${encodeURIComponent(printerName)}`
        : `${printerAPI.getBaseUrl()}/status`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get printer status: ${error.message}`);
    }
  },

  // Print ZPL content
  print: async (zpl, options = {}) => {
    try {
      const response = await fetch(`${printerAPI.getBaseUrl()}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zpl,
          printer: options.printer,
          copies: options.copies || 1,
        }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Print failed: ${error.message}`);
    }
  },

  // Test print
  testPrint: async (printerName) => {
    try {
      const response = await fetch(`${printerAPI.getBaseUrl()}/test-print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printer: printerName }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Test print failed: ${error.message}`);
    }
  },

  // Get pending print jobs
  getJobs: async () => {
    try {
      const response = await fetch(`${printerAPI.getBaseUrl()}/jobs`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get print jobs: ${error.message}`);
    }
  },

  // Cancel a print job
  cancelJob: async (jobId) => {
    try {
      const response = await fetch(`${printerAPI.getBaseUrl()}/jobs/${jobId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  },
};

// ===== LABEL TYPE CONSTANTS =====
export const LABEL_TYPES = {
  JEWELRY_TAG: 'JEWELRY_TAG',
  BUTTERFLY_TAG: 'BUTTERFLY_TAG',
  PRODUCT_LABEL: 'PRODUCT_LABEL',
  QR_CODE: 'QR_CODE',
  BARCODE: 'BARCODE',
  PRICE_TAG: 'PRICE_TAG',
};

export const LABEL_TYPE_CONFIG = {
  JEWELRY_TAG: { label: 'Jewelry Tag', bg: '#fef3c7', color: '#854d0e', icon: '💎' },
  BUTTERFLY_TAG: { label: 'Butterfly Tag', bg: '#fce7f3', color: '#9d174d', icon: '🦋' },
  PRODUCT_LABEL: { label: 'Product Label', bg: '#dbeafe', color: '#1e40af', icon: '🏷️' },
  QR_CODE: { label: 'QR Code', bg: '#dcfce7', color: '#166534', icon: '📱' },
  BARCODE: { label: 'Barcode', bg: '#f1f5f9', color: '#475569', icon: '▮▯▮' },
  PRICE_TAG: { label: 'Price Tag', bg: '#fef2f2', color: '#b91c1c', icon: '💰' },
};

// Common DPI values for Zebra printers
export const DPI_OPTIONS = [
  { value: 152, label: '152 dpi' },
  { value: 203, label: '203 dpi (Standard)' },
  { value: 300, label: '300 dpi (High Resolution)' },
  { value: 600, label: '600 dpi (Ultra High)' },
];

// Common label sizes in mm
export const LABEL_SIZE_PRESETS = [
  { name: 'Jewelry Tag Small', width: 25, height: 51, dpi: 203 },
  { name: 'Jewelry Tag Medium', width: 30, height: 51, dpi: 203 },
  { name: 'Butterfly Tag', width: 20, height: 45, dpi: 203 },
  { name: 'Product Label 2x1', width: 51, height: 25, dpi: 203 },
  { name: 'Product Label 2x2', width: 51, height: 51, dpi: 203 },
  { name: 'Product Label 4x2', width: 102, height: 51, dpi: 203 },
  { name: 'QR Code Label', width: 51, height: 51, dpi: 203 },
];

// ===== HELPER FUNCTIONS =====

/**
 * Get label type configuration
 */
export const getLabelTypeConfig = (type) => {
  return LABEL_TYPE_CONFIG[type] || { label: type, bg: '#f1f5f9', color: '#475569', icon: '🏷️' };
};

/**
 * Get label type options for dropdown
 */
export const getLabelTypeOptions = () => {
  return Object.keys(LABEL_TYPES).map((key) => ({
    value: LABEL_TYPES[key],
    label: LABEL_TYPE_CONFIG[LABEL_TYPES[key]].label,
  }));
};

/**
 * Extract variables from ZPL content
 * Finds all {{VARIABLE_NAME}} patterns
 */
export const extractVariablesFromZpl = (zpl) => {
  if (!zpl) return [];
  const pattern = /\{\{([A-Z_0-9]+)\}\}/g;
  const matches = [...zpl.matchAll(pattern)];
  const variables = [...new Set(matches.map((m) => m[1]))];
  return variables;
};

/**
 * Validate ZPL content
 */
export const validateZpl = (zpl) => {
  const errors = [];

  if (!zpl || !zpl.trim()) {
    errors.push('ZPL content is required');
    return { isValid: false, errors };
  }

  if (!zpl.includes('^XA')) {
    errors.push('ZPL must start with ^XA (start format)');
  }

  if (!zpl.includes('^XZ')) {
    errors.push('ZPL must end with ^XZ (end format)');
  }

  // Check for common ZPL commands
  const hasFieldOrigin = zpl.includes('^FO');
  const hasFieldData = zpl.includes('^FD');

  if (!hasFieldOrigin && !hasFieldData) {
    errors.push('ZPL appears to have no content (no ^FO or ^FD commands)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
};

/**
 * Format dimensions for display
 */
export const formatDimensions = (widthMm, heightMm) => {
  if (!widthMm || !heightMm) return '-';
  return `${widthMm} × ${heightMm} mm`;
};

/**
 * Check if print server is online
 */
export const checkPrintServerStatus = async () => {
  try {
    const health = await printerAPI.health();
    return { online: true, ...health };
  } catch (error) {
    return { online: false, error: error.message };
  }
};

export default labelTemplateAPI;
