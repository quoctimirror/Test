import React, { useState, useEffect } from 'react';

/**
 * SKUGenerator - Auto-generate internal SKU codes
 *
 * Step 1 of Product Workflow
 * Generates unique Mirror internal SKU based on:
 * - Product category (RG=Ring, NC=Necklace, BR=Bracelet, ER=Earring)
 * - Year-Month (YYMM)
 * - Sequence number (auto-increment)
 *
 * Format: SKU-{CATEGORY}-{YYMM}-{SEQUENCE}
 * Example: SKU-RG-2401-001
 */

const SKUGenerator = ({ onGenerate, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    category: initialData.category || '',
    customPrefix: initialData.customPrefix || '',
    useCustomPrefix: initialData.useCustomPrefix || false,
    manualOverride: initialData.manualOverride || false,
    customSKU: initialData.customSKU || ''
  });

  const [previewSKU, setPreviewSKU] = useState('');
  const [generating, setGenerating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [lastSequence, setLastSequence] = useState(null);

  // Category options
  const categories = [
    { value: 'RG', label: 'Ring', icon: '💍' },
    { value: 'NC', label: 'Necklace', icon: '📿' },
    { value: 'BR', label: 'Bracelet', icon: '⛓️' },
    { value: 'ER', label: 'Earring', icon: '💎' },
    { value: 'PE', label: 'Pendant', icon: '✨' },
    { value: 'BN', label: 'Bangle', icon: '⭕' },
    { value: 'CH', label: 'Chain', icon: '🔗' },
    { value: 'ST', label: 'Set', icon: '📦' }
  ];

  useEffect(() => {
    if (formData.category && !formData.manualOverride) {
      generatePreviewSKU();
    }
  }, [formData.category, formData.useCustomPrefix, formData.customPrefix]);

  useEffect(() => {
    if (formData.manualOverride) {
      setPreviewSKU(formData.customSKU);
      validateCustomSKU(formData.customSKU);
    }
  }, [formData.customSKU, formData.manualOverride]);

  /**
   * Generate preview SKU
   */
  const generatePreviewSKU = async () => {
    if (!formData.category) return;

    try {
      // TODO: Implement actual API call to get next sequence number
      // const response = await productOpsAPI.getNextSequence(formData.category);
      // const sequence = response.data.nextSequence;

      // Mock sequence number
      const sequence = Math.floor(Math.random() * 100) + 1;
      setLastSequence(sequence);

      // Generate SKU
      const now = new Date();
      const yearMonth = now.getFullYear().toString().slice(-2) + (now.getMonth() + 1).toString().padStart(2, '0');
      const sequenceStr = sequence.toString().padStart(3, '0');

      const prefix = formData.useCustomPrefix && formData.customPrefix
        ? formData.customPrefix
        : formData.category;

      const sku = `SKU-${prefix}-${yearMonth}-${sequenceStr}`;
      setPreviewSKU(sku);
      setValidationError('');
    } catch (error) {
      console.error('Error generating SKU:', error);
      setValidationError('Failed to generate SKU. Please try again.');
    }
  };

  /**
   * Validate custom SKU format
   */
  const validateCustomSKU = async (sku) => {
    if (!sku) {
      setValidationError('SKU cannot be empty');
      return false;
    }

    // Format validation
    const skuPattern = /^SKU-[A-Z]{2,4}-\d{4}-\d{3}$/;
    if (!skuPattern.test(sku)) {
      setValidationError('Invalid SKU format. Expected: SKU-XX-YYMM-NNN');
      return false;
    }

    // TODO: Check uniqueness via API
    // const response = await productOpsAPI.checkSKUUniqueness(sku);
    // if (!response.data.isUnique) {
    //   setValidationError('This SKU already exists. Please use a different one.');
    //   return false;
    // }

    setValidationError('');
    return true;
  };

  /**
   * Handle form field changes
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user makes changes
    if (validationError) {
      setValidationError('');
    }
  };

  /**
   * Handle SKU generation
   */
  const handleGenerate = async () => {
    // Validate
    if (!formData.category && !formData.manualOverride) {
      setValidationError('Please select a product category');
      return;
    }

    if (formData.manualOverride && !formData.customSKU) {
      setValidationError('Please enter a custom SKU');
      return;
    }

    if (formData.manualOverride) {
      const isValid = await validateCustomSKU(formData.customSKU);
      if (!isValid) return;
    }

    setGenerating(true);

    try {
      // TODO: Implement actual API call to save SKU
      // const response = await productOpsAPI.generateSKU({
      //   sku: previewSKU,
      //   category: formData.category,
      //   sequence: lastSequence
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Call parent callback with generated SKU
      if (onGenerate) {
        onGenerate({
          sku: previewSKU,
          category: formData.category,
          sequence: lastSequence
        });
      }
    } catch (error) {
      console.error('Error generating SKU:', error);
      setValidationError('Failed to generate SKU. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="admin-card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
          🔢 Generate Internal SKU
        </h2>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
          Step 1: Create a unique Mirror internal SKU for this product
        </p>
      </div>

      {/* Manual Override Toggle */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <input
          type="checkbox"
          id="manualOverride"
          checked={formData.manualOverride}
          onChange={(e) => handleChange('manualOverride', e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <label
          htmlFor="manualOverride"
          style={{ fontSize: '0.8125rem', color: '#0f172a', cursor: 'pointer', flex: 1 }}
        >
          <strong>Manual Override:</strong> Enter custom SKU instead of auto-generation
        </label>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {!formData.manualOverride ? (
          <>
            {/* Category Selection */}
            <div>
              <label className="admin-label">
                Product Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleChange('category', cat.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: formData.category === cat.value ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      backgroundColor: formData.category === cat.value ? '#eff6ff' : '#ffffff',
                      color: formData.category === cat.value ? '#1e40af' : '#0f172a',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: formData.category === cat.value ? '600' : '500',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span style={{ fontSize: '0.6875rem', opacity: 0.7 }}>({cat.value})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prefix (Optional) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="useCustomPrefix"
                  checked={formData.useCustomPrefix}
                  onChange={(e) => handleChange('useCustomPrefix', e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label
                  htmlFor="useCustomPrefix"
                  className="admin-label"
                  style={{ margin: 0, cursor: 'pointer' }}
                >
                  Use Custom Prefix (Optional)
                </label>
              </div>

              {formData.useCustomPrefix && (
                <input
                  type="text"
                  value={formData.customPrefix}
                  onChange={(e) => handleChange('customPrefix', e.target.value.toUpperCase())}
                  placeholder="e.g., RGDM for Ring Diamond"
                  maxLength="4"
                  className="admin-input"
                  style={{
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                />
              )}
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Custom 2-4 character prefix to replace category code
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Manual SKU Input */}
            <div>
              <label className="admin-label">
                Custom SKU <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.customSKU}
                onChange={(e) => handleChange('customSKU', e.target.value.toUpperCase())}
                placeholder="SKU-RG-2401-001"
                className="admin-input"
                style={{
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Format: SKU-XX-YYMM-NNN (e.g., SKU-RG-2401-001)
              </p>
            </div>

            {/* Category for manual override */}
            <div>
              <label className="admin-label">
                Product Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="admin-select"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label} ({cat.value})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Preview */}
      {previewSKU && (
        <div style={{
          padding: '1.25rem',
          backgroundColor: validationError ? '#fef2f2' : '#f0fdf4',
          borderRadius: '6px',
          borderLeft: `3px solid ${validationError ? '#ef4444' : '#10b981'}`,
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
            {formData.manualOverride ? 'Custom SKU:' : 'Generated SKU Preview:'}
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '1.125rem',
            fontWeight: '700',
            color: validationError ? '#991b1b' : '#166534',
            marginBottom: '0.5rem'
          }}>
            {previewSKU}
          </div>
          {!formData.manualOverride && lastSequence && (
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Sequence #{lastSequence} for {formData.category} category
            </div>
          )}
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          borderRadius: '6px',
          borderLeft: '3px solid #ef4444',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.8125rem', color: '#991b1b' }}>
            ⚠️ {validationError}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#eff6ff',
        borderRadius: '6px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: '1.6' }}>
          <strong>SKU Format Rules:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
            <li>Prefix: "SKU" (fixed)</li>
            <li>Category: 2-4 character code (RG, NC, BR, etc.)</li>
            <li>Date: YYMM format (e.g., 2401 for January 2024)</li>
            <li>Sequence: 3-digit auto-increment (001, 002, 003...)</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button
          onClick={handleCancel}
          className="admin-button admin-button-secondary"
          disabled={generating}
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          className="admin-button admin-button-primary"
          disabled={generating || !previewSKU || !!validationError}
        >
          {generating ? 'Generating...' : '✓ Generate SKU'}
        </button>
      </div>
    </div>
  );
};

export default SKUGenerator;
