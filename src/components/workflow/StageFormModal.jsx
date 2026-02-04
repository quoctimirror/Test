import React, { useState, useEffect } from 'react';
import {
  getCapabilityTypeOptions,
  getCapabilityLabel,
} from '@services/workflowTemplateService';
import './workflow.css';

/**
 * StageFormModal - Modal for creating/editing workflow stage details
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Handler to close modal
 * @param {Function} props.onSave - Handler to save stage data
 * @param {Object} props.stage - Existing stage data for editing (null for new)
 * @param {number} props.stageNumber - Stage number for display
 * @param {boolean} props.canBeFinal - Whether this stage can be marked as final
 */
const StageFormModal = ({
  isOpen,
  onClose,
  onSave,
  stage = null,
  stageNumber = 1,
  canBeFinal = true,
}) => {
  const capabilityOptions = getCapabilityTypeOptions();

  const [formData, setFormData] = useState({
    name: '',
    requiredCapability: '',
    estimatedDurationDays: 1,
    instructions: '',
    isFinalStage: false,
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/stage changes
  useEffect(() => {
    if (isOpen) {
      if (stage) {
        setFormData({
          name: stage.name || '',
          requiredCapability: stage.requiredCapability || '',
          estimatedDurationDays: stage.estimatedDurationDays || 1,
          instructions: stage.instructions || '',
          isFinalStage: stage.isFinalStage || false,
        });
      } else {
        setFormData({
          name: '',
          requiredCapability: '',
          estimatedDurationDays: 1,
          instructions: '',
          isFinalStage: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, stage]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Stage name is required';
    }

    if (!formData.requiredCapability) {
      newErrors.requiredCapability = 'Capability is required';
    }

    if (!formData.estimatedDurationDays || formData.estimatedDurationDays < 1) {
      newErrors.estimatedDurationDays = 'Duration must be at least 1 day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      ...formData,
      estimatedDurationDays: parseInt(formData.estimatedDurationDays, 10),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal stage-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h3>{stage ? `Edit Stage ${stageNumber}` : `Add Stage ${stageNumber}`}</h3>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="stage-form-content">
            <div className="stage-form-grid">
              {/* Stage Name */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Stage Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`admin-input ${errors.name ? 'admin-input-error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Stone Sourcing"
                />
                {errors.name && (
                  <span className="admin-error-message">{errors.name}</span>
                )}
              </div>

              {/* Required Capability & Duration */}
              <div className="stage-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Required Capability <span className="required">*</span>
                  </label>
                  <select
                    className={`admin-select ${errors.requiredCapability ? 'admin-select-error' : ''}`}
                    value={formData.requiredCapability}
                    onChange={(e) => handleChange('requiredCapability', e.target.value)}
                  >
                    <option value="">Select Capability</option>
                    {capabilityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.requiredCapability && (
                    <span className="admin-error-message">{errors.requiredCapability}</span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Duration (days) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={`admin-input ${errors.estimatedDurationDays ? 'admin-input-error' : ''}`}
                    value={formData.estimatedDurationDays}
                    onChange={(e) => handleChange('estimatedDurationDays', e.target.value)}
                    min={1}
                    max={365}
                  />
                  {errors.estimatedDurationDays && (
                    <span className="admin-error-message">{errors.estimatedDurationDays}</span>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="admin-form-group">
                <label className="admin-form-label">Instructions for Partner</label>
                <textarea
                  className="admin-input"
                  rows={4}
                  value={formData.instructions}
                  onChange={(e) => handleChange('instructions', e.target.value)}
                  placeholder="Instructions to be shown to production partners for this stage..."
                />
              </div>

              {/* Final Stage Checkbox */}
              {canBeFinal && (
                <div className="stage-final-checkbox">
                  <label className="stage-final-checkbox-label">
                    <input
                      type="checkbox"
                      className="admin-checkbox"
                      checked={formData.isFinalStage}
                      onChange={(e) => handleChange('isFinalStage', e.target.checked)}
                    />
                    This is the final stage (delivers to MIRROR)
                  </label>
                  <p className="stage-final-hint">
                    The final stage completes the workflow and delivers the finished product to MIRROR.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="admin-modal-footer-section">
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-button admin-button-primary"
              >
                {stage ? 'Save Changes' : 'Add Stage'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StageFormModal;
