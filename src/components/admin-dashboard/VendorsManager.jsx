import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, MapPin, CreditCard, Package, ShoppingCart, Eye, Clock, DollarSign, Globe } from 'lucide-react';
import { vendorsAPI, handleAPIError } from '@services/api';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vendor Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your jewelry suppliers and vendor relationships
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add New Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search vendors by name, code, or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {getUniqueCountries().map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">{vendors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Countries</p>
                <p className="text-2xl font-semibold text-gray-900">{getUniqueCountries().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Product Cost</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(
                    vendors.reduce((sum, v) => sum + (v.avgProductCost || 0), 0) / (vendors.length || 1)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Lead Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(
                    vendors.reduce((sum, v) => sum + (v.productionLeadTimeDays || 0), 0) / (vendors.length || 1)
                  )} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Vendors ({filteredVendors.length})</h2>
          </div>

          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedCountryFilter
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first vendor.'}
              </p>
              {!searchQuery && !selectedCountryFilter && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                  >
                    <Plus size={20} />
                    Add New Vendor
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Terms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                            <div className="text-sm text-gray-500">Code: {vendor.code || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{vendor.country || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          vendor.vendorType === VendorType.BOTH ? 'bg-green-100 text-green-800' :
                          vendor.vendorType === VendorType.PARTS_ONLY ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {getVendorTypeLabel(vendor.vendorType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{formatPaymentTerms(vendor.paymentTerms)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(vendor.avgProductCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.productionLeadTimeDays ? `${vendor.productionLeadTimeDays} days` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(vendor)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vendor.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {vendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., VEN001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Jewelry Manufacturer Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Type *
                  </label>
                  <select
                    value={formData.vendorType}
                    onChange={(e) => setFormData({...formData, vendorType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Location Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country of Origin
                  </label>
                  <select
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({...formData, countryOfOrigin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Tax Structure
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Import Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.importTaxPercent}
                    onChange={(e) => setFormData({...formData, importTaxPercent: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.vatTaxPercent}
                    onChange={(e) => setFormData({...formData, vatTaxPercent: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customs Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxCustomsPercent}
                    onChange={(e) => setFormData({...formData, taxCustomsPercent: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Cost Structure */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Cost Structure
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Fee (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData({...formData, shippingFee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg Labor Cost/Piece (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.avgLaborCostPerPiece}
                    onChange={(e) => setFormData({...formData, avgLaborCostPerPiece: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg Product Cost (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.avgProductCost}
                    onChange={(e) => setFormData({...formData, avgProductCost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Operational Details */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Operational Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.productionLeadTimeDays}
                    onChange={(e) => setFormData({...formData, productionLeadTimeDays: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Net 30, 50% advance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Term
                  </label>
                  <input
                    type="text"
                    value={formData.commissionTerm}
                    onChange={(e) => setFormData({...formData, commissionTerm: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Commission structure"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Full address of the vendor"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labor Cost Factors (JSON)
                </label>
                <textarea
                  value={formData.laborCostFactors}
                  onChange={(e) => setFormData({...formData, laborCostFactors: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='{"complexity_multiplier": 1.2, "skill_level": "high"}'
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">Optional JSON for labor cost calculations</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
              <p className="text-sm text-gray-500">Vendor Details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Vendor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Basic Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-medium">{vendor.code || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    vendor.vendorType === VendorType.BOTH ? 'bg-green-100 text-green-800' :
                    vendor.vendorType === VendorType.PARTS_ONLY ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {getVendorTypeLabel(vendor.vendorType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium">{vendor.country || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Origin:</span>
                  <span className="font-medium">{vendor.countryOfOrigin || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium">{formatPaymentTerms(vendor.paymentTerms)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Tax & Cost Structure
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Import Tax:</span>
                  <span className="font-medium">{vendor.importTaxPercent || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT Tax:</span>
                  <span className="font-medium">{vendor.vatTaxPercent || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customs Tax:</span>
                  <span className="font-medium">{vendor.taxCustomsPercent || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Fee:</span>
                  <span className="font-medium">{formatCurrency(vendor.shippingFee)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Production Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lead Time:</span>
                  <span className="font-medium">{vendor.productionLeadTimeDays || 0} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Labor Cost:</span>
                  <span className="font-medium">{formatCurrency(vendor.avgLaborCostPerPiece)}/pc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Product Cost:</span>
                  <span className="font-medium">{formatCurrency(vendor.avgProductCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(vendor.contactPerson || vendor.contactEmail || vendor.contactPhone || vendor.address) && (
            <div className="mb-8">
              <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                {vendor.contactPerson && (
                  <div><span className="text-gray-600">Person:</span> <span className="font-medium">{vendor.contactPerson}</span></div>
                )}
                {vendor.contactEmail && (
                  <div><span className="text-gray-600">Email:</span> <span className="font-medium">{vendor.contactEmail}</span></div>
                )}
                {vendor.contactPhone && (
                  <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{vendor.contactPhone}</span></div>
                )}
                {vendor.address && (
                  <div><span className="text-gray-600">Address:</span> <span className="font-medium">{vendor.address}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Labor Cost Factors */}
          {vendor.laborCostFactors && (
            <div className="mb-8">
              <h4 className="font-medium text-gray-900 mb-4">Labor Cost Factors</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {vendor.laborCostFactors}
                </pre>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <h4 className="font-medium text-gray-900 mb-2">Materials</h4>
              <div className="text-3xl font-bold text-blue-600">{materials.length}</div>
              <p className="text-sm text-gray-600 mt-1">Active materials</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <h4 className="font-medium text-gray-900 mb-2">Purchase Orders</h4>
              <div className="text-3xl font-bold text-green-600">{orders.length}</div>
              <p className="text-sm text-gray-600 mt-1">Total orders</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <h4 className="font-medium text-gray-900 mb-2">Created</h4>
              <div className="text-sm font-medium text-purple-900 mt-2">
                {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-xs text-gray-600 mt-1">Registration date</p>
            </div>
          </div>

          {materials.length === 0 && orders.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                This vendor doesn't have any materials or purchase orders yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorsManager;
