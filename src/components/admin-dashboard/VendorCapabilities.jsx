import React, { useState, useEffect, useCallback } from 'react';
import {
  partnerCapabilityAPI,
  CAPABILITY_TYPES,
  CAPABILITY_TYPE_LABELS,
  CAPABILITY_TYPE_COLORS,
  CAPABILITY_CATEGORIES,
  QUALITY_RATINGS,
  getCapabilityLabel,
  getCapabilityColor,
  formatLeadTime,
  formatCostRate,
  vendorHasCapability,
} from '@services/partnerCapabilityService';
import { SkeletonTable } from './Skeleton';
import './AdminDashboard.css';

/**
 * VendorCapabilities - Component for managing vendor capabilities
 * Can be used standalone or as part of vendor detail page
 *
 * @param {Object} props
 * @param {number} props.vendorId - Vendor ID
 * @param {string} props.vendorName - Vendor name for display
 * @param {boolean} props.readOnly - View only mode
 */
const VendorCapabilities = ({ vendorId, vendorName = '', readOnly = false }) => {
  // State
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState(null);

  // Fetch capabilities
  const fetchCapabilities = useCallback(async () => {
    if (!vendorId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await partnerCapabilityAPI.getByVendorId(vendorId);
      setCapabilities(response.data || []);
    } catch (err) {
      console.error('Error fetching capabilities:', err);
      setError('Failed to load capabilities. Please try again.');
      setCapabilities([]);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  // Handlers
  const handleAdd = () => {
    setSelectedCapability(null);
    setShowAddModal(true);
  };

  const handleEdit = (capability) => {
    setSelectedCapability(capability);
    setShowEditModal(true);
  };

  const handleDelete = async (capability) => {
    if (!window.confirm(`Remove "${getCapabilityLabel(capability.capabilityType)}" capability?`)) {
      return;
    }

    try {
      await partnerCapabilityAPI.delete(vendorId, capability.id);
      fetchCapabilities();
    } catch (err) {
      console.error('Error deleting capability:', err);
      alert('Failed to delete capability. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCapability(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    fetchCapabilities();
  };

  // Get available capability types (not already added)
  const getAvailableCapabilityTypes = () => {
    return Object.keys(CAPABILITY_TYPES).filter(
      (key) => !vendorHasCapability(capabilities, CAPABILITY_TYPES[key])
    );
  };

  // Render capability badge
  const renderCapabilityBadge = (capabilityType) => {
    const color = getCapabilityColor(capabilityType);
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: color.bg,
          color: color.color,
          whiteSpace: 'nowrap',
        }}
      >
        {getCapabilityLabel(capabilityType)}
      </span>
    );
  };

  // Render quality stars
  const renderQualityStars = (rating) => {
    if (!rating) return 'N/A';
    return (
      <span style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: star <= rating ? '#f59e0b' : '#e5e7eb',
              fontSize: '1rem',
            }}
          >
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="vendor-capabilities">
        <div className="admin-card admin-p-lg">
          <SkeletonTable rows={3} columns={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-capabilities">
      {/* Header */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--mirror-navy)' }}>
              Partner Capabilities
            </h2>
            {vendorName && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--mirror-gray-600)' }}>
                {vendorName}
              </p>
            )}
          </div>
          {!readOnly && (
            <button
              className="admin-button admin-button-primary"
              onClick={handleAdd}
              disabled={getAvailableCapabilityTypes().length === 0}
            >
              + Add Capability
            </button>
          )}
        </div>

        {/* Quick View - Capability Chips */}
        {capabilities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {capabilities.map((cap) => renderCapabilityBadge(cap.capabilityType))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="admin-error-state admin-mb-lg">{error}</div>
      )}

      {/* Capabilities List */}
      <div className="admin-card">
        <div className="admin-section-header">
          <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
            Capabilities ({capabilities.length})
          </h3>
        </div>

        {capabilities.length === 0 ? (
          <div className="admin-empty-state">
            <p>No capabilities defined for this vendor.</p>
            {!readOnly && (
              <p className="admin-form-hint">
                Add capabilities to define what this partner can do.
              </p>
            )}
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Lead Time</th>
                  <th>Cost Rate (USD)</th>
                  <th>Quality Rating</th>
                  <th>Notes</th>
                  {!readOnly && <th style={{ width: '120px' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {capabilities.map((cap) => (
                  <tr key={cap.id}>
                    <td>{renderCapabilityBadge(cap.capabilityType)}</td>
                    <td>{formatLeadTime(cap.leadTimeDays)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatCostRate(cap.costRateUsd)}
                    </td>
                    <td>{renderQualityStars(cap.qualityRating)}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cap.notes || '-'}
                    </td>
                    {!readOnly && (
                      <td>
                        <div className="admin-flex admin-gap-sm">
                          <button
                            className="admin-button admin-button-outline admin-button-sm"
                            onClick={() => handleEdit(cap)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-button admin-button-danger admin-button-sm"
                            onClick={() => handleDelete(cap)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <CapabilityModal
          vendorId={vendorId}
          capability={null}
          availableTypes={getAvailableCapabilityTypes()}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCapability && (
        <CapabilityModal
          vendorId={vendorId}
          capability={selectedCapability}
          availableTypes={[]}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

/**
 * CapabilityModal - Add/Edit capability modal
 */
const CapabilityModal = ({ vendorId, capability, availableTypes, onClose, onSuccess }) => {
  const isEdit = !!capability;

  const [formData, setFormData] = useState({
    capabilityType: capability?.capabilityType || '',
    leadTimeDays: capability?.leadTimeDays || '',
    costRateUsd: capability?.costRateUsd || '',
    qualityRating: capability?.qualityRating || 3,
    notes: capability?.notes || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        leadTimeDays: parseInt(formData.leadTimeDays) || 0,
        costRateUsd: parseFloat(formData.costRateUsd) || 0,
        qualityRating: parseInt(formData.qualityRating),
      };

      if (isEdit) {
        await partnerCapabilityAPI.update(vendorId, capability.id, payload);
      } else {
        await partnerCapabilityAPI.create(vendorId, payload);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving capability:', err);
      setError(err.response?.data?.message || 'Failed to save capability. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="admin-modal-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--mirror-gray-200)' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
              {isEdit ? 'Edit Capability' : 'Add Capability'}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--mirror-gray-500)',
              }}
            >
              x
            </button>
          </div>

          {error && (
            <div className="admin-error-state admin-mb-md">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Capability Type */}
            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
              <label className="admin-form-label">
                Capability Type <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              {isEdit ? (
                <input
                  type="text"
                  className="admin-input"
                  value={getCapabilityLabel(formData.capabilityType)}
                  disabled
                />
              ) : (
                <select
                  className="admin-select"
                  value={formData.capabilityType}
                  onChange={(e) => handleChange('capabilityType', e.target.value)}
                  required
                >
                  <option value="">Select Capability</option>
                  {CAPABILITY_CATEGORIES.map((category) => (
                    <optgroup key={category.name} label={category.name}>
                      {category.types
                        .filter((type) => availableTypes.includes(Object.keys(CAPABILITY_TYPES).find(k => CAPABILITY_TYPES[k] === type)))
                        .map((type) => (
                          <option key={type} value={type}>
                            {CAPABILITY_TYPE_LABELS[type]}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>

            <div className="admin-grid admin-grid-2" style={{ gap: '1rem' }}>
              {/* Lead Time */}
              <div className="admin-form-group">
                <label className="admin-form-label">Lead Time (days)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.leadTimeDays}
                  onChange={(e) => handleChange('leadTimeDays', e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>

              {/* Cost Rate */}
              <div className="admin-form-group">
                <label className="admin-form-label">Cost Rate (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  className="admin-input"
                  value={formData.costRateUsd}
                  onChange={(e) => handleChange('costRateUsd', e.target.value)}
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Quality Rating */}
            <div className="admin-form-group" style={{ marginTop: '1rem' }}>
              <label className="admin-form-label">Quality Rating</label>
              <select
                className="admin-select"
                value={formData.qualityRating}
                onChange={(e) => handleChange('qualityRating', e.target.value)}
              >
                {QUALITY_RATINGS.map((rating) => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label} - {rating.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="admin-form-group" style={{ marginTop: '1rem' }}>
              <label className="admin-form-label">Notes</label>
              <textarea
                className="admin-input"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes about this capability..."
              />
            </div>

            {/* Actions */}
            <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--mirror-gray-200)' }}>
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-button admin-button-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : isEdit ? 'Update Capability' : 'Add Capability'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorCapabilities;
