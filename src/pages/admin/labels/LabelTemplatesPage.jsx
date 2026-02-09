import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  labelTemplateAPI,
  getLabelTypeConfig,
  getLabelTypeOptions,
  formatDimensions,
} from '@/services/labelTemplateService';
import './LabelTemplatesPage.css';

const LabelTemplatesPage = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
  });

  // Modal states
  const [deleteModal, setDeleteModal] = useState({ open: false, template: null });
  const [duplicateModal, setDuplicateModal] = useState({ open: false, template: null, newName: '' });
  const [previewModal, setPreviewModal] = useState({ open: false, template: null, preview: null, loading: false });

  const fetchTemplates = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };
      if (searchTerm) params.search = searchTerm;
      if (filterType) params.labelType = filterType;

      const response = await labelTemplateAPI.getAll(params);
      setTemplates(response.data.content || []);
      setPagination({
        currentPage: response.data.currentPage,
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load label templates');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTemplates(0);
  };

  const handleDelete = async () => {
    if (!deleteModal.template) return;
    try {
      await labelTemplateAPI.delete(deleteModal.template.id);
      setDeleteModal({ open: false, template: null });
      fetchTemplates(pagination.currentPage);
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateModal.template) return;
    try {
      await labelTemplateAPI.duplicate(duplicateModal.template.id, duplicateModal.newName);
      setDuplicateModal({ open: false, template: null, newName: '' });
      fetchTemplates(0);
    } catch (err) {
      console.error('Error duplicating template:', err);
      alert('Failed to duplicate template');
    }
  };

  const handlePreview = async (template) => {
    setPreviewModal({ open: true, template, preview: null, loading: true });
    try {
      // Use sample data for preview
      const sampleData = {
        SKU: 'RNG-2024-001',
        DESCRIPTIVE_CODE: 'NK-DIAMOND-18K',
        PRICE: '15,000,000 ₫',
        BARCODE: '8938518390001',
        PRODUCT_NAME: 'Diamond Ring',
        CATEGORY: 'Ring',
        METAL_TYPE: '18K Gold',
        WEIGHT: '3.5g',
      };
      const response = await labelTemplateAPI.preview(template.id, sampleData);
      setPreviewModal((prev) => ({ ...prev, preview: response.data, loading: false }));
    } catch (err) {
      console.error('Error generating preview:', err);
      setPreviewModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const navigateToForm = (templateId = null) => {
    if (onNavigate) {
      onNavigate('label-template-form', { templateId });
    } else {
      // Fallback to router navigation
      if (templateId) {
        navigate(`/inventory/label-templates/${templateId}/edit`);
      } else {
        navigate('/inventory/label-templates/new');
      }
    }
  };

  const labelTypeOptions = getLabelTypeOptions();

  return (
    <div className="label-templates-page">
      {/* Header */}
      <div className="ltp-header">
        <div className="ltp-header-left">
          <h2>Label Templates</h2>
          <span className="ltp-count">{pagination.totalItems} templates</span>
        </div>
        <button className="ltp-btn ltp-btn-primary" onClick={() => navigateToForm()}>
          + New Template
        </button>
      </div>

      {/* Filters */}
      <div className="ltp-filters">
        <form onSubmit={handleSearch} className="ltp-search-form">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ltp-search-input"
          />
          <button type="submit" className="ltp-btn ltp-btn-secondary">
            Search
          </button>
        </form>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="ltp-filter-select"
        >
          <option value="">All Types</option>
          {labelTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="ltp-loading">Loading templates...</div>
      ) : error ? (
        <div className="ltp-error">{error}</div>
      ) : templates.length === 0 ? (
        <div className="ltp-empty">
          <p>No label templates found.</p>
          <button className="ltp-btn ltp-btn-primary" onClick={() => navigateToForm()}>
            Create your first template
          </button>
        </div>
      ) : (
        <>
          {/* Templates Grid */}
          <div className="ltp-grid">
            {templates.map((template) => {
              const typeConfig = getLabelTypeConfig(template.labelType);
              return (
                <div key={template.id} className="ltp-card">
                  <div className="ltp-card-header">
                    <div
                      className="ltp-type-badge"
                      style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
                    >
                      <span className="ltp-type-icon">{typeConfig.icon}</span>
                      {typeConfig.label}
                    </div>
                    {template.isDefault && (
                      <span className="ltp-default-badge">Default</span>
                    )}
                  </div>

                  <div className="ltp-card-body">
                    <h3 className="ltp-card-title">{template.name}</h3>
                    {template.description && (
                      <p className="ltp-card-description">{template.description}</p>
                    )}

                    <div className="ltp-card-meta">
                      <div className="ltp-meta-item">
                        <span className="ltp-meta-label">Size:</span>
                        <span className="ltp-meta-value">
                          {formatDimensions(template.widthMm, template.heightMm)}
                        </span>
                      </div>
                      <div className="ltp-meta-item">
                        <span className="ltp-meta-label">DPI:</span>
                        <span className="ltp-meta-value">{template.dpi || 203}</span>
                      </div>
                      {template.variables && template.variables.length > 0 && (
                        <div className="ltp-meta-item ltp-meta-full">
                          <span className="ltp-meta-label">Variables:</span>
                          <span className="ltp-meta-value ltp-variables">
                            {template.variables.slice(0, 4).join(', ')}
                            {template.variables.length > 4 && ` +${template.variables.length - 4} more`}
                          </span>
                        </div>
                      )}
                    </div>

                    {template.previewImageUrl && (
                      <div className="ltp-card-preview">
                        <img src={template.previewImageUrl} alt="Preview" />
                      </div>
                    )}
                  </div>

                  <div className="ltp-card-actions">
                    <button
                      className="ltp-btn ltp-btn-small"
                      onClick={() => handlePreview(template)}
                      title="Preview"
                    >
                      👁️
                    </button>
                    <button
                      className="ltp-btn ltp-btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        navigateToForm(template.id);
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="ltp-btn ltp-btn-small"
                      onClick={() =>
                        setDuplicateModal({
                          open: true,
                          template,
                          newName: `${template.name} (Copy)`,
                        })
                      }
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      className="ltp-btn ltp-btn-small ltp-btn-danger"
                      onClick={() => setDeleteModal({ open: true, template })}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="ltp-pagination">
              <button
                className="ltp-btn ltp-btn-secondary"
                onClick={() => fetchTemplates(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
              >
                Previous
              </button>
              <span className="ltp-pagination-info">
                Page {pagination.currentPage + 1} of {pagination.totalPages}
              </span>
              <button
                className="ltp-btn ltp-btn-secondary"
                onClick={() => fetchTemplates(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="ltp-modal-overlay" onClick={() => setDeleteModal({ open: false, template: null })}>
          <div className="ltp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Template</h3>
            <p>
              Are you sure you want to delete "{deleteModal.template?.name}"? This action cannot be
              undone.
            </p>
            <div className="ltp-modal-actions">
              <button
                className="ltp-btn ltp-btn-secondary"
                onClick={() => setDeleteModal({ open: false, template: null })}
              >
                Cancel
              </button>
              <button className="ltp-btn ltp-btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {duplicateModal.open && (
        <div
          className="ltp-modal-overlay"
          onClick={() => setDuplicateModal({ open: false, template: null, newName: '' })}
        >
          <div className="ltp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Duplicate Template</h3>
            <p>Enter a name for the new template:</p>
            <input
              type="text"
              value={duplicateModal.newName}
              onChange={(e) => setDuplicateModal((prev) => ({ ...prev, newName: e.target.value }))}
              className="ltp-modal-input"
              placeholder="New template name"
            />
            <div className="ltp-modal-actions">
              <button
                className="ltp-btn ltp-btn-secondary"
                onClick={() => setDuplicateModal({ open: false, template: null, newName: '' })}
              >
                Cancel
              </button>
              <button className="ltp-btn ltp-btn-primary" onClick={handleDuplicate}>
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.open && (
        <div
          className="ltp-modal-overlay"
          onClick={() => setPreviewModal({ open: false, template: null, preview: null, loading: false })}
        >
          <div className="ltp-modal ltp-modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Preview: {previewModal.template?.name}</h3>
            {previewModal.loading ? (
              <div className="ltp-preview-loading">Generating preview...</div>
            ) : previewModal.preview?.previewImageBase64 ? (
              <div className="ltp-preview-content">
                <img
                  src={`data:image/png;base64,${previewModal.preview.previewImageBase64}`}
                  alt="Label Preview"
                  className="ltp-preview-image"
                />
                <div className="ltp-preview-info">
                  <p>
                    <strong>Size:</strong> {previewModal.preview.widthMm} × {previewModal.preview.heightMm} mm
                  </p>
                  <p>
                    <strong>DPI:</strong> {previewModal.preview.dpi}
                  </p>
                </div>
              </div>
            ) : (
              <div className="ltp-preview-error">
                Failed to generate preview. The Labelary API may be unavailable.
              </div>
            )}
            <div className="ltp-modal-actions">
              <button
                className="ltp-btn ltp-btn-secondary"
                onClick={() =>
                  setPreviewModal({ open: false, template: null, preview: null, loading: false })
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelTemplatesPage;
