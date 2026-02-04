import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  labelTemplateAPI,
  getLabelTypeOptions,
  DPI_OPTIONS,
  LABEL_SIZE_PRESETS,
  extractVariablesFromZpl,
  validateZpl,
} from '@/services/labelTemplateService';
import './LabelTemplateFormPage.css';

const LabelTemplateFormPage = ({ templateId: propTemplateId, onBack, onSaved }) => {
  const { id: routeTemplateId } = useParams();
  const navigate = useNavigate();

  // Use prop templateId if provided, otherwise use route param
  const templateId = propTemplateId || routeTemplateId;
  const isEditing = !!templateId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [supportedVariables, setSupportedVariables] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    labelType: 'JEWELRY_TAG',
    widthMm: 25,
    heightMm: 51,
    dpi: 203,
    zplContent: '',
    variables: [],
    isDefault: false,
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Preview state
  const [preview, setPreview] = useState({ loading: false, image: null, error: null });

  // Load template data if editing
  useEffect(() => {
    if (isEditing) {
      loadTemplate();
    }
    loadSupportedVariables();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await labelTemplateAPI.getById(templateId);
      const template = response.data;
      setFormData({
        name: template.name || '',
        description: template.description || '',
        labelType: template.labelType || 'JEWELRY_TAG',
        widthMm: template.widthMm || 25,
        heightMm: template.heightMm || 51,
        dpi: template.dpi || 203,
        zplContent: template.zplContent || '',
        variables: template.variables || [],
        isDefault: template.isDefault || false,
      });
    } catch (err) {
      console.error('Error loading template:', err);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const loadSupportedVariables = async () => {
    try {
      const response = await labelTemplateAPI.getVariables();
      setSupportedVariables(response.data || []);
    } catch (err) {
      console.error('Error loading variables:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleZplChange = (zpl) => {
    setFormData((prev) => ({
      ...prev,
      zplContent: zpl,
      variables: extractVariablesFromZpl(zpl),
    }));
    setErrors((prev) => ({ ...prev, zplContent: null }));
    setPreview({ loading: false, image: null, error: null });
  };

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      widthMm: preset.width,
      heightMm: preset.height,
      dpi: preset.dpi,
    }));
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('zpl-editor');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.zplContent;
      const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
      handleZplChange(newText);
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const generatePreview = async () => {
    if (!formData.zplContent) {
      setPreview({ loading: false, image: null, error: 'No ZPL content to preview' });
      return;
    }

    setPreview({ loading: true, image: null, error: null });

    try {
      // If editing, use the existing template ID
      // Otherwise, we need to generate a preview using sample data
      const sampleData = {
        SKU: 'RNG-2024-001',
        DESCRIPTIVE_CODE: 'NK-DIAMOND-18K',
        PRICE: '15,000,000 ₫',
        BARCODE: '8938518390001',
        PRODUCT_NAME: 'Diamond Ring',
        NAME: 'Diamond Ring',
        CATEGORY: 'Ring',
        METAL_TYPE: '18K Gold',
        WEIGHT: '3.5g',
        STONE_TYPE: 'Lab Diamond',
        DATE: new Date().toLocaleDateString(),
      };

      // Render the ZPL with sample data locally
      let renderedZpl = formData.zplContent;
      for (const [key, value] of Object.entries(sampleData)) {
        renderedZpl = renderedZpl.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }

      // Call Labelary API directly
      const dpi = formData.dpi || 203;
      const widthInches = (formData.widthMm || 25) / 25.4;
      const heightInches = (formData.heightMm || 51) / 25.4;

      const response = await fetch(
        `http://api.labelary.com/v1/printers/${dpi}dpi/labels/${widthInches.toFixed(1)}x${heightInches.toFixed(1)}/0/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'image/png' },
          body: renderedZpl,
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPreview({ loading: false, image: imageUrl, error: null });
      } else {
        setPreview({ loading: false, image: null, error: 'Failed to generate preview' });
      }
    } catch (err) {
      console.error('Preview error:', err);
      setPreview({ loading: false, image: null, error: err.message });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.labelType) {
      newErrors.labelType = 'Label type is required';
    }

    if (!formData.zplContent?.trim()) {
      newErrors.zplContent = 'ZPL content is required';
    } else {
      const zplValidation = validateZpl(formData.zplContent);
      if (!zplValidation.isValid) {
        newErrors.zplContent = zplValidation.errors.join('. ');
      }
    }

    if (!formData.widthMm || formData.widthMm < 1) {
      newErrors.widthMm = 'Width must be positive';
    }

    if (!formData.heightMm || formData.heightMm < 1) {
      newErrors.heightMm = 'Height must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = {
        ...formData,
        variables: formData.variables,
      };

      if (isEditing) {
        await labelTemplateAPI.update(templateId, data);
      } else {
        await labelTemplateAPI.create(data);
      }

      if (onSaved) {
        onSaved();
      } else if (onBack) {
        onBack();
      } else {
        navigate('/inventory/label-templates');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const labelTypeOptions = getLabelTypeOptions();

  if (loading) {
    return <div className="ltf-loading">Loading template...</div>;
  }

  return (
    <div className="label-template-form-page">
      {/* Header */}
      <div className="ltf-header">
        <button className="ltf-back-btn" onClick={onBack || (() => navigate('/inventory/label-templates'))}>
          ← Back
        </button>
        <h2>{isEditing ? 'Edit Label Template' : 'New Label Template'}</h2>
      </div>

      {error && <div className="ltf-error">{error}</div>}

      <form onSubmit={handleSubmit} className="ltf-form">
        <div className="ltf-layout">
          {/* Left Column - Basic Info */}
          <div className="ltf-column">
            <div className="ltf-section">
              <h3>Basic Information</h3>

              <div className="ltf-field">
                <label htmlFor="name">Template Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Jewelry Tag 25x51mm"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="ltf-field-error">{errors.name}</span>}
              </div>

              <div className="ltf-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the template purpose..."
                  rows={3}
                />
              </div>

              <div className="ltf-field">
                <label htmlFor="labelType">Label Type *</label>
                <select
                  id="labelType"
                  value={formData.labelType}
                  onChange={(e) => handleInputChange('labelType', e.target.value)}
                  className={errors.labelType ? 'error' : ''}
                >
                  {labelTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.labelType && <span className="ltf-field-error">{errors.labelType}</span>}
              </div>

              <div className="ltf-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  />
                  {' '}Set as default for this label type
                </label>
              </div>
            </div>

            <div className="ltf-section">
              <h3>Label Dimensions</h3>

              <div className="ltf-presets">
                <label>Presets:</label>
                <div className="ltf-preset-buttons">
                  {LABEL_SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className="ltf-preset-btn"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ltf-row">
                <div className="ltf-field">
                  <label htmlFor="widthMm">Width (mm) *</label>
                  <input
                    id="widthMm"
                    type="number"
                    value={formData.widthMm}
                    onChange={(e) => handleInputChange('widthMm', parseInt(e.target.value) || 0)}
                    min={1}
                    className={errors.widthMm ? 'error' : ''}
                  />
                  {errors.widthMm && <span className="ltf-field-error">{errors.widthMm}</span>}
                </div>

                <div className="ltf-field">
                  <label htmlFor="heightMm">Height (mm) *</label>
                  <input
                    id="heightMm"
                    type="number"
                    value={formData.heightMm}
                    onChange={(e) => handleInputChange('heightMm', parseInt(e.target.value) || 0)}
                    min={1}
                    className={errors.heightMm ? 'error' : ''}
                  />
                  {errors.heightMm && <span className="ltf-field-error">{errors.heightMm}</span>}
                </div>

                <div className="ltf-field">
                  <label htmlFor="dpi">DPI *</label>
                  <select
                    id="dpi"
                    value={formData.dpi}
                    onChange={(e) => handleInputChange('dpi', parseInt(e.target.value))}
                  >
                    {DPI_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - ZPL Editor */}
          <div className="ltf-column ltf-column-wide">
            <div className="ltf-section">
              <div className="ltf-section-header">
                <h3>ZPL Content</h3>
                <button type="button" className="ltf-btn ltf-btn-secondary" onClick={generatePreview}>
                  Preview
                </button>
              </div>

              <div className="ltf-variables-bar">
                <span className="ltf-variables-label">Insert Variable:</span>
                <div className="ltf-variables-list">
                  {supportedVariables.slice(0, 12).map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      className="ltf-variable-btn"
                      onClick={() => insertVariable(variable)}
                      title={`Insert {{${variable}}}`}
                    >
                      {variable}
                    </button>
                  ))}
                  {supportedVariables.length > 12 && (
                    <span className="ltf-more-vars">+{supportedVariables.length - 12} more</span>
                  )}
                </div>
              </div>

              <div className="ltf-field">
                <textarea
                  id="zpl-editor"
                  value={formData.zplContent}
                  onChange={(e) => handleZplChange(e.target.value)}
                  placeholder={`^XA
^FO20,20^A0N,30,30^FD{{PRODUCT_NAME}}^FS
^FO20,60^A0N,25,25^FDSKU: {{SKU}}^FS
^FO20,100^A0N,35,35^FD{{PRICE}}^FS
^FO20,150^BY2^BCN,50,Y,N,N^FD{{BARCODE}}^FS
^XZ`}
                  rows={20}
                  className={`ltf-zpl-editor ${errors.zplContent ? 'error' : ''}`}
                />
                {errors.zplContent && <span className="ltf-field-error">{errors.zplContent}</span>}
              </div>

              {formData.variables.length > 0 && (
                <div className="ltf-detected-vars">
                  <span className="ltf-detected-label">Detected Variables:</span>
                  {formData.variables.map((v) => (
                    <span key={v} className="ltf-detected-var">
                      {v}
                    </span>
                  ))}
                </div>
              )}

              {/* Preview */}
              {preview.loading && <div className="ltf-preview-loading">Generating preview...</div>}
              {preview.error && <div className="ltf-preview-error">{preview.error}</div>}
              {preview.image && (
                <div className="ltf-preview-container">
                  <h4>Preview (with sample data)</h4>
                  <img src={preview.image} alt="Label Preview" className="ltf-preview-image" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="ltf-actions">
          <button type="button" className="ltf-btn ltf-btn-secondary" onClick={onBack || (() => navigate('/inventory/label-templates'))}>
            Cancel
          </button>
          <button type="submit" className="ltf-btn ltf-btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabelTemplateFormPage;
