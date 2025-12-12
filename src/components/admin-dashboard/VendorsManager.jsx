import React, { useState, useEffect } from 'react';
import { vendorsAPI, handleAPIError } from '@services/api';
import { SkeletonStatsGrid, SkeletonTable } from './Skeleton';

// Vendor Type Constants
const VendorType = {
  PARTS_ONLY: 'PARTS_ONLY',
  WHOLE_PIECE_ONLY: 'WHOLE_PIECE_ONLY',
  BOTH: 'BOTH'
};

const VendorsManager = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorMaterials, setVendorMaterials] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendors, searchQuery, selectedCountryFilter]);

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      const vendorData = Array.isArray(response.data) ? response.data : [];
      setVendors(vendorData);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    if (!Array.isArray(vendors)) {
      setFilteredVendors([]);
      return;
    }

    let filtered = vendors;

    if (searchQuery) {
      filtered = filtered.filter(vendor =>
        vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCountryFilter) {
      filtered = filtered.filter(vendor => vendor.country === selectedCountryFilter);
    }

    setFilteredVendors(filtered);
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await vendorsAPI.delete(id);
      setVendors(Array.isArray(vendors) ? vendors.filter(v => v.id !== id) : []);
    } catch (error) {
      const errorInfo = handleAPIError(error, 'Failed to delete vendor');
      alert(errorInfo.message);
    }
  };

  const handleViewDetails = async (vendor) => {
    setSelectedVendor(vendor);

    // For now, mock materials and orders since the API might not have these endpoints yet
    try {
      // TODO: Implement these API endpoints in the backend
      // const [materialsResponse, ordersResponse] = await Promise.all([
      //   vendorsAPI.getMaterials(vendor.id),
      //   vendorsAPI.getPurchaseOrders(vendor.id)
      // ]);
      // setVendorMaterials(materialsResponse.data || []);
      // setVendorOrders(ordersResponse.data || []);

      setVendorMaterials([]);
      setVendorOrders([]);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      setVendorMaterials([]);
      setVendorOrders([]);
    }

    setShowDetailsModal(true);
  };

  const getUniqueCountries = () => {
    if (!Array.isArray(vendors)) return [];
    const countries = vendors.map(v => v.country).filter(Boolean);
    return Array.from(new Set(countries)).sort();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPaymentTerms = (terms) => {
    if (typeof terms === 'string') return terms;
    if (typeof terms === 'object' && terms) {
      return terms.specialConditions || terms.paymentTiming || 'Net 30';
    }
    return 'N/A';
  };

  const getVendorTypeLabel = (type) => {
    const labels = {
      [VendorType.PARTS_ONLY]: 'Parts Only',
      [VendorType.WHOLE_PIECE_ONLY]: 'Whole Pieces Only',
      [VendorType.BOTH]: 'Both Parts & Whole'
    };
    return labels[type] || type;
  };

  const getVendorTypeClass = (type) => {
    const classes = {
      [VendorType.BOTH]: 'vendor-type-both',
      [VendorType.PARTS_ONLY]: 'vendor-type-parts',
      [VendorType.WHOLE_PIECE_ONLY]: 'vendor-type-whole'
    };
    return classes[type] || 'vendor-type-parts';
  };

  if (loading) {
    return (
      <div className="vendors-manager">
        <div className="admin-card admin-p-lg admin-mb-lg">
          <SkeletonStatsGrid count={4} />
        </div>
        <div className="admin-card">
          <div className="admin-section-header">
            <div className="skeleton" style={{ width: '150px', height: '1.25rem' }} />
          </div>
          <SkeletonTable rows={5} columns={7} />
        </div>
      </div>
    );
  }

  return (
    <div className="vendors-manager">
      {/* Header Controls */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <div className="admin-page-header admin-mb-lg">
          <div>
            <h1 className="admin-header-title">Vendor Management</h1>
            <p className="admin-header-subtitle">
              Manage your jewelry suppliers and vendor relationships
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-button admin-button-primary"
          >
            Add New Vendor
          </button>
        </div>

        {/* Filters */}
        <div className="admin-flex-wrap">
          <input
            type="text"
            placeholder="Search vendors by name, code, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input admin-input-flex"
          />
          <select
            value={selectedCountryFilter}
            onChange={(e) => setSelectedCountryFilter(e.target.value)}
            className="admin-select admin-select-fixed"
          >
            <option value="">All Countries</option>
            {getUniqueCountries().map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-card admin-p-lg">
          <div>
            <p className="admin-stat-label">Total Vendors</p>
            <p className="admin-stat-value">{vendors.length}</p>
          </div>
        </div>

        <div className="admin-card admin-p-lg">
          <div>
            <p className="admin-stat-label">Countries</p>
            <p className="admin-stat-value">{getUniqueCountries().length}</p>
          </div>
        </div>

        <div className="admin-card admin-p-lg">
          <div>
            <p className="admin-stat-label">Avg Product Cost</p>
            <p className="admin-stat-value">
              {formatCurrency(
                vendors.reduce((sum, v) => sum + (v.avgProductCost || 0), 0) / (vendors.length || 1)
              )}
            </p>
          </div>
        </div>

        <div className="admin-card admin-p-lg">
          <div>
            <p className="admin-stat-label">Avg Lead Time</p>
            <p className="admin-stat-value">
              {Math.round(
                vendors.reduce((sum, v) => sum + (v.productionLeadTimeDays || 0), 0) / (vendors.length || 1)
              )} days
            </p>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="admin-card">
        <div className="admin-section-header">
          <h2>Vendors ({filteredVendors.length})</h2>
        </div>

        {filteredVendors.length === 0 ? (
          <div className="admin-empty-state">
            {searchQuery || selectedCountryFilter
              ? 'No vendors found. Try adjusting your search criteria.'
              : 'No vendors found. Get started by adding your first vendor.'}
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Country</th>
                  <th>Type</th>
                  <th>Payment Terms</th>
                  <th>Avg Cost</th>
                  <th>Lead Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div>
                        <div className="admin-table-primary">{vendor.name}</div>
                        <div className="admin-table-secondary">
                          Code: <code className="admin-code">{vendor.code || 'N/A'}</code>
                        </div>
                      </div>
                    </td>
                    <td>{vendor.country || 'N/A'}</td>
                    <td>
                      <span className={`vendor-type-badge ${getVendorTypeClass(vendor.vendorType)}`}>
                        {getVendorTypeLabel(vendor.vendorType)}
                      </span>
                    </td>
                    <td>{formatPaymentTerms(vendor.paymentTerms)}</td>
                    <td>{formatCurrency(vendor.avgProductCost)}</td>
                    <td>{vendor.productionLeadTimeDays ? `${vendor.productionLeadTimeDays} days` : 'N/A'}</td>
                    <td>
                      <div className="admin-flex admin-gap-sm">
                        <button
                          onClick={() => handleViewDetails(vendor)}
                          className="admin-button admin-button-outline admin-button-sm"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowEditModal(true);
                          }}
                          className="admin-button admin-button-outline admin-button-sm"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor.id)}
                          className="admin-button admin-button-danger admin-button-sm"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <VendorModal
          vendor={null}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newVendor) => {
            setVendors([...vendors, newVendor]);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && selectedVendor && (
        <VendorModal
          vendor={selectedVendor}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVendor(null);
          }}
          onSuccess={(updatedVendor) => {
            setVendors(vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));
            setShowEditModal(false);
            setSelectedVendor(null);
          }}
        />
      )}

      {/* Vendor Details Modal */}
      {showDetailsModal && selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          materials={vendorMaterials}
          orders={vendorOrders}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedVendor(null);
            setVendorMaterials([]);
            setVendorOrders([]);
          }}
          formatCurrency={formatCurrency}
          formatPaymentTerms={formatPaymentTerms}
          getVendorTypeLabel={getVendorTypeLabel}
          VendorType={VendorType}
        />
      )}
    </div>
  );
};

// Vendor Form Modal Component
const VendorModal = ({ vendor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: vendor?.code || '',
    name: vendor?.name || '',
    country: vendor?.country || '',
    countryOfOrigin: vendor?.countryOfOrigin || '',
    paymentTerms: vendor?.paymentTerms || '',
    commissionTerm: vendor?.commissionTerm || '',
    importTaxPercent: vendor?.importTaxPercent || 0,
    vatTaxPercent: vendor?.vatTaxPercent || 0,
    taxCustomsPercent: vendor?.taxCustomsPercent || 0,
    shippingFee: vendor?.shippingFee || 0,
    avgLaborCostPerPiece: vendor?.avgLaborCostPerPiece || 0,
    avgProductCost: vendor?.avgProductCost || 0,
    productionLeadTimeDays: vendor?.productionLeadTimeDays || 0,
    vendorType: vendor?.vendorType || VendorType.BOTH,
    laborCostFactors: vendor?.laborCostFactors || '',
    contactPerson: vendor?.contactPerson || '',
    contactEmail: vendor?.contactEmail || '',
    contactPhone: vendor?.contactPhone || '',
    address: vendor?.address || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const countries = [
    'Vietnam', 'China', 'India', 'Thailand', 'Myanmar', 'Indonesia',
    'Malaysia', 'Philippines', 'Singapore', 'South Korea', 'Japan', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        importTaxPercent: parseFloat(formData.importTaxPercent) || 0,
        vatTaxPercent: parseFloat(formData.vatTaxPercent) || 0,
        taxCustomsPercent: parseFloat(formData.taxCustomsPercent) || 0,
        shippingFee: parseFloat(formData.shippingFee) || 0,
        avgLaborCostPerPiece: parseFloat(formData.avgLaborCostPerPiece) || 0,
        avgProductCost: parseFloat(formData.avgProductCost) || 0,
        productionLeadTimeDays: parseInt(formData.productionLeadTimeDays) || 0,
      };

      let response;
      if (vendor) {
        response = await vendorsAPI.update(vendor.id, submitData);
      } else {
        response = await vendorsAPI.create(submitData);
      }
      onSuccess(response.data);
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to save vendor');
      setError(errorInfo.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal admin-modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-body">
          <h3 className="admin-section-title admin-mb-lg" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--mirror-gray-200)' }}>
            {vendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h3>

          {error && (
            <div className="admin-error-state admin-mb-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-flex-col admin-gap-lg">
            {/* Basic Information */}
            <div>
              <h4 className="admin-section-title">Basic Information</h4>
              <div className="admin-grid admin-grid-4">
                <div>
                  <label className="admin-form-label">Vendor Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="admin-input"
                    placeholder="e.g., VEN001"
                  />
                </div>

                <div>
                  <label className="admin-form-label">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="admin-input"
                    placeholder="e.g., Jewelry Manufacturer Ltd"
                  />
                </div>

                <div>
                  <label className="admin-form-label">Vendor Type *</label>
                  <select
                    value={formData.vendorType}
                    onChange={(e) => setFormData({...formData, vendorType: e.target.value})}
                    className="admin-select"
                    required
                  >
                    <option value={VendorType.BOTH}>Both Parts & Whole Pieces</option>
                    <option value={VendorType.PARTS_ONLY}>Parts Only</option>
                    <option value={VendorType.WHOLE_PIECE_ONLY}>Whole Pieces Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h4 className="admin-section-title">Location Information</h4>
              <div className="admin-grid admin-grid-4">
                <div>
                  <label className="admin-form-label">Vendor Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="admin-select"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-form-label">Country of Origin</label>
                  <select
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({...formData, countryOfOrigin: e.target.value})}
                    className="admin-select"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tax Structure */}
            <div>
              <h4 className="admin-section-title">
                Tax Structure
              </h4>
              <div className="admin-grid admin-grid-3">
                <div>
                  <label className="admin-form-label">
                    Import Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.importTaxPercent}
                    onChange={(e) => setFormData({...formData, importTaxPercent: e.target.value})}
                    className="admin-input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="admin-form-label">
                    VAT Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.vatTaxPercent}
                    onChange={(e) => setFormData({...formData, vatTaxPercent: e.target.value})}
                    className="admin-input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="admin-form-label">
                    Customs Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxCustomsPercent}
                    onChange={(e) => setFormData({...formData, taxCustomsPercent: e.target.value})}
                    className="admin-input"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Cost Structure */}
            <div>
              <h4 className="admin-section-title">
                Cost Structure
              </h4>
              <div className="admin-grid admin-grid-2">
                <div>
                  <label className="admin-form-label">
                    Shipping Fee (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData({...formData, shippingFee: e.target.value})}
                    className="admin-input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="admin-form-label">
                    Avg Labor Cost/Piece (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.avgLaborCostPerPiece}
                    onChange={(e) => setFormData({...formData, avgLaborCostPerPiece: e.target.value})}
                    className="admin-input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="admin-form-label">
                    Avg Product Cost (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.avgProductCost}
                    onChange={(e) => setFormData({...formData, avgProductCost: e.target.value})}
                    className="admin-input"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Operational Details */}
            <div>
              <h4 className="admin-section-title">
                Operational Details
              </h4>
              <div className="admin-grid admin-grid-2">
                <div>
                  <label className="admin-form-label">
                    Production Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.productionLeadTimeDays}
                    onChange={(e) => setFormData({...formData, productionLeadTimeDays: e.target.value})}
                    className="admin-input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="admin-form-label">
                    Payment Terms *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                    className="admin-input"
                    placeholder="e.g., Net 30, 50% advance"
                  />
                </div>

                <div>
                  <label className="admin-form-label">
                    Commission Term
                  </label>
                  <input
                    type="text"
                    value={formData.commissionTerm}
                    onChange={(e) => setFormData({...formData, commissionTerm: e.target.value})}
                    className="admin-input"
                    placeholder="Commission structure"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="admin-section-title">
                Contact Information
              </h4>
              <div className="admin-grid admin-grid-2">
                <div>
                  <label className="admin-form-label">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-form-label">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-form-label">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-mt-md">
                <label className="admin-form-label">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="admin-input"
                  rows="2"
                  placeholder="Full address of the vendor"
                />
              </div>

              <div className="admin-mt-md">
                <label className="admin-form-label">
                  Labor Cost Factors (JSON)
                </label>
                <textarea
                  value={formData.laborCostFactors}
                  onChange={(e) => setFormData({...formData, laborCostFactors: e.target.value})}
                  className="admin-input"
                  placeholder='{"complexity_multiplier": 1.2, "skill_level": "high"}'
                  rows={2}
                />
                <p className="admin-form-hint">
                  Optional JSON for labor cost calculations
                </p>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="admin-button admin-button-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="admin-button admin-button-primary"
              >
                {submitting ? 'Saving...' : vendor ? 'Update Vendor' : 'Add Vendor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Vendor Details Modal Component
const VendorDetailsModal = ({ vendor, materials, orders, onClose, formatCurrency, formatPaymentTerms, getVendorTypeLabel, VendorType }) => {
  const getVendorTypeClass = (type) => {
    const classes = {
      [VendorType.BOTH]: 'vendor-type-both',
      [VendorType.PARTS_ONLY]: 'vendor-type-parts',
      [VendorType.WHOLE_PIECE_ONLY]: 'vendor-type-whole'
    };
    return classes[type] || 'vendor-type-parts';
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', width: '90%' }}
      >
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
                {vendor.name}
              </h3>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#64748b' }}>Vendor Details</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#94a3b8',
                lineHeight: '1',
                padding: '0.25rem'
              }}
            >
              ✕
            </button>
          </div>

          {/* Vendor Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>
                Basic Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Code:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.code || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Type:</span>
                  <span className="status-pill" style={{
                    backgroundColor: vendor.vendorType === 'BOTH' ? '#ecfdf5' : vendor.vendorType === 'PARTS_ONLY' ? '#f0f9ff' : '#faf5ff',
                    color: vendor.vendorType === 'BOTH' ? '#059669' : vendor.vendorType === 'PARTS_ONLY' ? '#0284c7' : '#7c3aed',
                    borderColor: vendor.vendorType === 'BOTH' ? '#a7f3d0' : vendor.vendorType === 'PARTS_ONLY' ? '#bae6fd' : '#e9d5ff'
                  }}>
                    {getVendorTypeLabel(vendor.vendorType)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Country:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.country || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Origin:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.countryOfOrigin || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{formatPaymentTerms(vendor.paymentTerms)}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>
                Tax & Cost Structure
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Import Tax:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.importTaxPercent || 0}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>VAT Tax:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.vatTaxPercent || 0}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Customs Tax:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.taxCustomsPercent || 0}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Shipping Fee:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{formatCurrency(vendor.shippingFee)}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>
                Production Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Lead Time:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.productionLeadTimeDays || 0} days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Avg Labor Cost:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{formatCurrency(vendor.avgLaborCostPerPiece)}/pc</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Avg Product Cost:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{formatCurrency(vendor.avgProductCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(vendor.contactPerson || vendor.contactEmail || vendor.contactPhone || vendor.address) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                Contact Information
              </h4>
              <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                {vendor.contactPerson && (
                  <div>
                    <span style={{ color: '#64748b' }}>Person: </span>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.contactPerson}</span>
                  </div>
                )}
                {vendor.contactEmail && (
                  <div>
                    <span style={{ color: '#64748b' }}>Email: </span>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.contactEmail}</span>
                  </div>
                )}
                {vendor.contactPhone && (
                  <div>
                    <span style={{ color: '#64748b' }}>Phone: </span>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.contactPhone}</span>
                  </div>
                )}
                {vendor.address && (
                  <div>
                    <span style={{ color: '#64748b' }}>Address: </span>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>{vendor.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Labor Cost Factors */}
          {vendor.laborCostFactors && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                Labor Cost Factors
              </h4>
              <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <pre style={{ margin: '0', fontSize: '0.75rem', color: '#0f172a', whiteSpace: 'pre-wrap' }}>
                  {vendor.laborCostFactors}
                </pre>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                Materials
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f172a' }}>{materials.length}</div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Active materials</p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                Purchase Orders
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f172a' }}>{orders.length}</div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Total orders</p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                Created
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a', marginTop: '0.5rem' }}>
                {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Registration date</p>
            </div>
          </div>

          {materials.length === 0 && orders.length === 0 && (
            <div className="admin-empty-state">
              This vendor doesn't have any materials or purchase orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorsManager;
