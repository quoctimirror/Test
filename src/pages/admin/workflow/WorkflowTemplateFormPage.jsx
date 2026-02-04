import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  workflowTemplateAPI,
  WORKFLOW_TEMPLATE_STATUS,
  WORKFLOW_CATEGORIES,
  validateWorkflowTemplate,
  createEmptyStage,
  calculateTotalDuration,
} from '@services/workflowTemplateService';
import {
  WorkflowStatusBadge,
  WorkflowStageCard,
  StageFormModal,
} from '@components/workflow';
import { SkeletonTable } from '@components/admin-dashboard/Skeleton';
import '@components/workflow/workflow.css';

/**
 * WorkflowTemplateFormPage - Create/Edit/View form for workflow templates
 * Features: Template info, Stage Builder with reordering
 */
const WorkflowTemplateFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'new'; // new, edit, view
  const templateId = searchParams.get('id');
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Stage form modal state
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStageIndex, setEditingStageIndex] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isDefault: false,
    stages: [],
    status: WORKFLOW_TEMPLATE_STATUS.DRAFT,
  });

  // Fetch existing template for edit/view
  useEffect(() => {
    if (templateId && (isEditMode || isViewMode)) {
      const fetchTemplate = async () => {
        setLoading(true);
        try {
          const response = await workflowTemplateAPI.getById(templateId);
          const data = response.data;
          setFormData({
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            isDefault: data.isDefault || false,
            stages: data.stages || [],
            status: data.status || WORKFLOW_TEMPLATE_STATUS.DRAFT,
          });
        } catch (err) {
          console.error('Error fetching template:', err);
          setError('Failed to load workflow template. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchTemplate();
    }
  }, [templateId, isEditMode, isViewMode]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Stage management
  const handleAddStage = () => {
    setEditingStageIndex(null);
    setStageModalOpen(true);
  };

  const handleEditStage = (index) => {
    setEditingStageIndex(index);
    setStageModalOpen(true);
  };

  const handleSaveStage = (stageData) => {
    setFormData((prev) => {
      const newStages = [...prev.stages];

      if (editingStageIndex !== null) {
        // Editing existing stage
        newStages[editingStageIndex] = {
          ...newStages[editingStageIndex],
          ...stageData,
        };
      } else {
        // Adding new stage
        const newStage = {
          ...createEmptyStage(newStages.length + 1),
          ...stageData,
        };
        newStages.push(newStage);
      }

      // If this stage is marked as final, unmark others
      if (stageData.isFinalStage) {
        newStages.forEach((s, i) => {
          if (i !== (editingStageIndex ?? newStages.length - 1)) {
            s.isFinalStage = false;
          }
        });
      }

      return { ...prev, stages: newStages };
    });

    setStageModalOpen(false);
    setEditingStageIndex(null);
  };

  const handleDeleteStage = (index) => {
    if (!window.confirm(`Delete stage "${formData.stages[index]?.name || 'Unnamed'}"?`)) {
      return;
    }

    setFormData((prev) => {
      const newStages = prev.stages.filter((_, i) => i !== index);
      // Update order numbers
      newStages.forEach((s, i) => {
        s.order = i + 1;
      });
      return { ...prev, stages: newStages };
    });
  };

  const handleMoveStageUp = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const newStages = [...prev.stages];
      [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
      // Update order numbers
      newStages.forEach((s, i) => {
        s.order = i + 1;
      });
      return { ...prev, stages: newStages };
    });
  };

  const handleMoveStageDown = (index) => {
    if (index === formData.stages.length - 1) return;
    setFormData((prev) => {
      const newStages = [...prev.stages];
      [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
      // Update order numbers
      newStages.forEach((s, i) => {
        s.order = i + 1;
      });
      return { ...prev, stages: newStages };
    });
  };

  // Validate form
  const validate = useCallback(() => {
    const result = validateWorkflowTemplate(formData);
    setValidationErrors(result.errors);
    return result.isValid;
  }, [formData]);

  // Handle save draft
  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);

    try {
      let response;
      if (isEditMode && templateId) {
        response = await workflowTemplateAPI.saveDraft(templateId, formData);
      } else {
        response = await workflowTemplateAPI.create({ ...formData, status: WORKFLOW_TEMPLATE_STATUS.DRAFT });
      }
      alert('Draft saved successfully!');
      // Navigate to edit mode with new ID
      if (!isEditMode) {
        navigate(`/dashboard/admin?tab=workflow-template-form&mode=edit&id=${response.data.id}`, { replace: true });
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle activate
  const handleActivate = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let templateIdToActivate = templateId;

      // Save first if new or has changes
      if (!isEditMode || !templateId) {
        const createResponse = await workflowTemplateAPI.create(formData);
        templateIdToActivate = createResponse.data.id;
      } else {
        await workflowTemplateAPI.update(templateId, formData);
      }

      // Activate
      await workflowTemplateAPI.activate(templateIdToActivate);
      alert('Template activated successfully!');
      navigate('/dashboard/admin?tab=workflow-templates');
    } catch (err) {
      console.error('Error activating template:', err);
      setError('Failed to activate template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle back
  const handleBack = () => {
    navigate('/dashboard/admin?tab=workflow-templates');
  };

  const totalDuration = calculateTotalDuration(formData.stages);
  const hasFinalStage = formData.stages.some((s) => s.isFinalStage);

  if (loading) {
    return (
      <div className="workflow-template-form-page">
        <div className="admin-card admin-p-lg">
          <SkeletonTable rows={10} columns={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-template-form-page">
      {/* Header */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <div className="workflow-form-header">
          <div className="workflow-form-title">
            <button onClick={handleBack} className="workflow-back-link">
              Back to Templates
            </button>
            <h1>
              {mode === 'new' && 'Create New Workflow Template'}
              {mode === 'edit' && `Edit Template - ${formData.name || 'Draft'}`}
              {mode === 'view' && `View Template - ${formData.name}`}
            </h1>
            {formData.status && <WorkflowStatusBadge status={formData.status} />}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="admin-error-state admin-mb-lg">{error}</div>
      )}

      {/* Validation Errors Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="workflow-validation-errors admin-mb-lg">
          <h4>Please fix the following errors:</h4>
          <ul>
            {Object.entries(validationErrors).map(([key, message]) => (
              <li key={key}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Template Info Section */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <h3 className="workflow-section-title">Template Information</h3>

        <div className="admin-grid admin-grid-2">
          <div className="admin-form-group">
            <label className="admin-form-label">
              Template Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`admin-input ${validationErrors.name ? 'admin-input-error' : ''}`}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Standard Ring Production"
              disabled={isViewMode}
            />
            {validationErrors.name && (
              <span className="admin-error-message">{validationErrors.name}</span>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Product Category <span className="required">*</span>
            </label>
            <select
              className={`admin-select ${validationErrors.category ? 'admin-select-error' : ''}`}
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={isViewMode}
            >
              <option value="">Select Category</option>
              {WORKFLOW_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <span className="admin-error-message">{validationErrors.category}</span>
            )}
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Description</label>
          <textarea
            className="admin-input"
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe this workflow template..."
            disabled={isViewMode}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-checkbox-group">
            <input
              type="checkbox"
              className="admin-checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
              disabled={isViewMode}
            />
            <span className="admin-checkbox-label">
              Set as default template for this category
            </span>
          </label>
          <p className="admin-form-hint">
            The default template will be automatically selected when creating new production plans.
          </p>
        </div>
      </div>

      {/* Stage Builder Section */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <div className="stage-builder">
          <div className="stage-builder-header">
            <div>
              <h3 className="stage-builder-title">Production Stages</h3>
              <p className="workflow-section-subtitle">
                Define the stages in order. Use the arrows to reorder. Mark one stage as final.
              </p>
            </div>
            <div className="stage-builder-summary">
              <span>
                <strong>{formData.stages.length}</strong> stage{formData.stages.length !== 1 ? 's' : ''}
              </span>
              {formData.stages.length > 0 && (
                <>
                  {' | '}
                  <span>
                    <strong>{totalDuration}</strong> day{totalDuration !== 1 ? 's' : ''} total
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Validation error for stages */}
          {(validationErrors.stages || validationErrors.finalStage) && (
            <div className="admin-error-state admin-mb-lg" style={{ padding: '0.75rem 1rem' }}>
              {validationErrors.stages || validationErrors.finalStage}
            </div>
          )}

          {/* Stage List */}
          <div className="stage-list">
            {formData.stages.length === 0 ? (
              <div className="stage-list-empty">
                <p>No stages defined yet. Click "Add Stage" to create your first stage.</p>
              </div>
            ) : (
              formData.stages.map((stage, index) => (
                <WorkflowStageCard
                  key={stage.id || index}
                  stage={stage}
                  index={index}
                  totalStages={formData.stages.length}
                  onMoveUp={handleMoveStageUp}
                  onMoveDown={handleMoveStageDown}
                  onEdit={handleEditStage}
                  onDelete={handleDeleteStage}
                  disabled={isViewMode}
                />
              ))
            )}
          </div>

          {/* Add Stage Button */}
          {!isViewMode && (
            <div style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={handleAddStage}
              >
                + Add Stage
              </button>
              {!hasFinalStage && formData.stages.length > 0 && (
                <span style={{ marginLeft: '1rem', fontSize: '0.8125rem', color: 'var(--color-warning)' }}>
                  Note: Mark one stage as the final stage.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Footer */}
      {!isViewMode && (
        <div className="admin-card admin-p-lg">
          <div className="workflow-form-footer">
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={handleBack}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              className="admin-button admin-button-primary"
              onClick={handleActivate}
              disabled={saving}
            >
              {saving ? 'Activating...' : 'Save & Activate'}
            </button>
          </div>
        </div>
      )}

      {/* Stage Form Modal */}
      <StageFormModal
        isOpen={stageModalOpen}
        onClose={() => {
          setStageModalOpen(false);
          setEditingStageIndex(null);
        }}
        onSave={handleSaveStage}
        stage={editingStageIndex !== null ? formData.stages[editingStageIndex] : null}
        stageNumber={editingStageIndex !== null ? editingStageIndex + 1 : formData.stages.length + 1}
        canBeFinal={!hasFinalStage || (editingStageIndex !== null && formData.stages[editingStageIndex]?.isFinalStage)}
      />
    </div>
  );
};

export default WorkflowTemplateFormPage;
