import api from './api';

/**
 * Workflow Template Service
 * Handles all API calls for workflow template management
 */

// ===== WORKFLOW TEMPLATE API =====
export const workflowTemplateAPI = {
  // Get all workflow templates with optional filters
  getAll: (params = {}) => api.get('/api/v1/workflow-templates', { params }),

  // Get workflow template by ID
  getById: (id) => api.get(`/api/v1/workflow-templates/${id}`),

  // Get workflow templates by category
  getByCategory: (category, params = {}) =>
    api.get(`/api/v1/workflow-templates/category/${encodeURIComponent(category)}`, { params }),

  // Get workflow templates by status
  getByStatus: (status, params = {}) =>
    api.get(`/api/v1/workflow-templates/status/${status}`, { params }),

  // Get active templates only
  getActive: (params = {}) =>
    api.get('/api/v1/workflow-templates/active', { params }),

  // Get default template for a category
  getDefault: (category) =>
    api.get(`/api/v1/workflow-templates/default/${encodeURIComponent(category)}`),

  // Search workflow templates
  search: (query, params = {}) =>
    api.get('/api/v1/workflow-templates/search', { params: { q: query, ...params } }),

  // Get filter options (categories, statuses)
  getFilterOptions: () => api.get('/api/v1/workflow-templates/filter-options'),

  // Get statistics
  getStatistics: () => api.get('/api/v1/workflow-templates/statistics'),

  // CRUD operations
  create: (data) => api.post('/api/v1/workflow-templates', data),

  update: (id, data) => api.put(`/api/v1/workflow-templates/${id}`, data),

  delete: (id) => api.delete(`/api/v1/workflow-templates/${id}`),

  // Duplicate template
  duplicate: (id) => api.post(`/api/v1/workflow-templates/${id}/duplicate`),

  // Status transitions
  activate: (id) => api.post(`/api/v1/workflow-templates/${id}/activate`),

  archive: (id) => api.post(`/api/v1/workflow-templates/${id}/archive`),

  unarchive: (id) => api.post(`/api/v1/workflow-templates/${id}/unarchive`),

  // Set as default for category
  setDefault: (id) => api.post(`/api/v1/workflow-templates/${id}/set-default`),

  // Save as draft
  saveDraft: (id, data) => api.put(`/api/v1/workflow-templates/${id}/draft`, data),

  // Stage operations
  addStage: (templateId, stageData) =>
    api.post(`/api/v1/workflow-templates/${templateId}/stages`, stageData),

  updateStage: (templateId, stageId, stageData) =>
    api.put(`/api/v1/workflow-templates/${templateId}/stages/${stageId}`, stageData),

  removeStage: (templateId, stageId) =>
    api.delete(`/api/v1/workflow-templates/${templateId}/stages/${stageId}`),

  reorderStages: (templateId, stageIds) =>
    api.put(`/api/v1/workflow-templates/${templateId}/stages/reorder`, { stageIds }),
};

// ===== WORKFLOW TEMPLATE CONSTANTS =====
export const WORKFLOW_TEMPLATE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
};

export const WORKFLOW_TEMPLATE_STATUS_CONFIG = {
  DRAFT: { bg: '#fef3c7', color: '#854d0e', label: 'Draft' },
  ACTIVE: { bg: '#dcfce7', color: '#166534', label: 'Active' },
  ARCHIVED: { bg: '#f1f5f9', color: '#475569', label: 'Archived' },
};

// Product categories that templates can be created for
export const WORKFLOW_CATEGORIES = [
  { value: 'RING', label: 'Ring' },
  { value: 'NECKLACE', label: 'Necklace' },
  { value: 'BRACELET', label: 'Bracelet' },
  { value: 'EARRINGS', label: 'Earrings' },
  { value: 'PENDANT', label: 'Pendant' },
  { value: 'BROOCH', label: 'Brooch' },
  { value: 'CUFFLINKS', label: 'Cufflinks' },
  { value: 'GENERAL', label: 'General' },
];

// Capability types from partnerCapabilityService for stage assignment
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
 * Get status config for display
 */
export const getStatusConfig = (status) => {
  return WORKFLOW_TEMPLATE_STATUS_CONFIG[status] || WORKFLOW_TEMPLATE_STATUS_CONFIG.DRAFT;
};

/**
 * Format category for display
 */
export const formatCategory = (category) => {
  const cat = WORKFLOW_CATEGORIES.find((c) => c.value === category);
  return cat?.label || category || '-';
};

/**
 * Calculate total estimated duration from stages
 */
export const calculateTotalDuration = (stages = []) => {
  return stages.reduce((sum, stage) => sum + (stage.estimatedDurationDays || 0), 0);
};

/**
 * Validate workflow template
 */
export const validateWorkflowTemplate = (template) => {
  const errors = {};

  if (!template.name?.trim()) {
    errors.name = 'Template name is required';
  }

  if (!template.category) {
    errors.category = 'Category is required';
  }

  if (!template.stages || template.stages.length === 0) {
    errors.stages = 'At least one stage is required';
  } else {
    // Check for unique stage names
    const stageNames = template.stages.map((s) => s.name?.toLowerCase().trim());
    const duplicates = stageNames.filter((name, index) => stageNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.stages = 'Stage names must be unique';
    }

    // Check for exactly one final stage
    const finalStages = template.stages.filter((s) => s.isFinalStage);
    if (finalStages.length === 0) {
      errors.finalStage = 'Exactly one stage must be marked as final';
    } else if (finalStages.length > 1) {
      errors.finalStage = 'Only one stage can be marked as final';
    }

    // Validate individual stages
    template.stages.forEach((stage, index) => {
      if (!stage.name?.trim()) {
        errors[`stage_${index}_name`] = `Stage ${index + 1} name is required`;
      }
      if (!stage.requiredCapability) {
        errors[`stage_${index}_capability`] = `Stage ${index + 1} requires a capability`;
      }
      if (!stage.estimatedDurationDays || stage.estimatedDurationDays < 1) {
        errors[`stage_${index}_duration`] = `Stage ${index + 1} requires valid duration`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Create default empty stage
 */
export const createEmptyStage = (order = 1) => ({
  id: `temp_${Date.now()}_${order}`,
  name: '',
  requiredCapability: '',
  estimatedDurationDays: 1,
  instructions: '',
  isFinalStage: false,
  order,
});

export default workflowTemplateAPI;
