import React, { useState, useEffect } from "react";
import { componentsAPI, handleAPIError } from "../../services/api";

const ComponentsManager = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    type: "MATERIAL",
    description: "",
    category: "",
    options: "",
    priceModifier: "",
    stockQuantity: "",
    isCustomizable: false,
    isRequired: false,
    displayOrder: ""
  });

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      // Try to fetch from API, fall back to mock data if not available
      try {
        const response = await componentsAPI.getAll();
        setComponents(response.data || []);
        return;
      } catch (apiError) {
        console.warn('Components API not available, using mock data:', apiError.message);
      }
      
      // Mock data fallback
      const mockComponents = [
        {
          id: "CMP000001",
          name: "18K Gold Setting",
          type: "MATERIAL",
          description: "Premium 18-karat gold setting for rings and pendants",
          category: "PRECIOUS_METALS",
          options: ["Yellow Gold", "White Gold", "Rose Gold"],
          priceModifier: 250000,
          stockQuantity: 50,
          isCustomizable: true,
          isRequired: true,
          displayOrder: 1
        },
        {
          id: "CMP000002", 
          name: "Diamond Grade",
          type: "STONE",
          description: "Diamond quality and grade selection",
          category: "GEMSTONES",
          options: ["VS1", "VS2", "VVS1", "VVS2", "FL"],
          priceModifier: 500000,
          stockQuantity: 25,
          isCustomizable: true,
          isRequired: false,
          displayOrder: 2
        },
        {
          id: "CMP000003",
          name: "Ring Size",
          type: "SIZING",
          description: "Standard ring sizing options",
          category: "DIMENSIONS",
          options: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"],
          priceModifier: 0,
          stockQuantity: 100,
          isCustomizable: false,
          isRequired: true,
          displayOrder: 3
        }
      ];
      setComponents(mockComponents);
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load components');
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "MATERIAL",
      description: "",
      category: "",
      options: "",
      priceModifier: "",
      stockQuantity: "",
      isCustomizable: false,
      isRequired: false,
      displayOrder: ""
    });
    setEditingComponent(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (component) => {
    setFormData({
      name: component.name || "",
      type: component.type || "MATERIAL",
      description: component.description || "",
      category: component.category || "",
      options: Array.isArray(component.options) ? component.options.join(", ") : "",
      priceModifier: component.priceModifier?.toString() || "",
      stockQuantity: component.stockQuantity?.toString() || "",
      isCustomizable: component.isCustomizable || false,
      isRequired: component.isRequired || false,
      displayOrder: component.displayOrder?.toString() || ""
    });
    setEditingComponent(component);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        ...formData,
        priceModifier: parseFloat(formData.priceModifier) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        displayOrder: parseInt(formData.displayOrder) || 0,
        options: formData.options.split(",").map(option => option.trim()).filter(option => option)
      };

      if (editingComponent) {
        await componentsAPI.update(editingComponent.id, submitData);
      } else {
        await componentsAPI.create(submitData);
      }

      await fetchComponents();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to save component');
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this component?')) {
      return;
    }

    try {
      await componentsAPI.delete(id);
      await fetchComponents();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to delete component');
      setError(errorInfo.message);
    }
  };

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || component.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'MATERIAL': return '🏗️';
      case 'STONE': return '💎';
      case 'SIZING': return '📏';
      case 'FINISH': return '✨';
      case 'ACCESSORY': return '🔧';
      default: return '⚙️';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'MATERIAL': return '#8b5a3c';
      case 'STONE': return '#bc224c';
      case 'SIZING': return '#17a2b8';
      case 'FINISH': return '#ffc107';
      case 'ACCESSORY': return '#28a745';
      default: return '#6c757d';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div>Loading components...</div>
      </div>
    );
  }

  return (
    <div className="components-manager">
      {error && (
        <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee', borderColor: '#feb2b2' }}>
          <div style={{ color: '#c53030' }}>{error}</div>
        </div>
      )}

      {/* Header Controls */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ flex: 1 }}
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="admin-input"
              style={{ width: '150px' }}
            >
              <option value="all">All Types</option>
              <option value="MATERIAL">Material</option>
              <option value="STONE">Stone</option>
              <option value="SIZING">Sizing</option>
              <option value="FINISH">Finish</option>
              <option value="ACCESSORY">Accessory</option>
            </select>
          </div>
          <button onClick={handleAdd} className="admin-button admin-button-primary" title="Add Component">
            +
          </button>
        </div>
      </div>

      {/* Components Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {filteredComponents.map(component => (
          <div key={component.id} className="admin-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div 
                style={{ 
                  fontSize: '24px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: getTypeColor(component.type),
                  color: 'white',
                  flexShrink: 0
                }}
              >
                {getTypeIcon(component.type)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '18px', fontWeight: '600', color: '#212529' }}>
                  {component.name}
                </h3>
                <div style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: getTypeColor(component.type),
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}>
                  {component.type}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  ID: <code style={{ background: '#f8f9fa', padding: '2px 4px', borderRadius: '4px' }}>{component.id}</code>
                </div>
              </div>
            </div>

            {/* Component Details */}
            <div style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#495057' }}>
                {component.description}
              </p>
              
              {component.category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '14px' }}>📂</span>
                  <span style={{ fontSize: '14px', color: '#495057' }}>
                    Category: <strong>{component.category.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
              )}
              
              {component.priceModifier !== 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '14px' }}>💰</span>
                  <span style={{ fontSize: '14px', color: '#495057' }}>
                    Price Modifier: <strong style={{ color: component.priceModifier > 0 ? '#28a745' : '#dc3545' }}>
                      {component.priceModifier > 0 ? '+' : ''}{formatPrice(component.priceModifier)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Options */}
            {component.options && component.options.length > 0 && (
              <div style={{ 
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ color: '#6c757d', fontSize: '12px', marginBottom: '0.5rem' }}>Available Options:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {component.options.slice(0, 5).map((option, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#495057'
                      }}
                    >
                      {option}
                    </span>
                  ))}
                  {component.options.length > 5 && (
                    <span style={{ fontSize: '12px', color: '#6c757d', padding: '0.25rem' }}>
                      +{component.options.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.5rem',
              marginBottom: '1rem',
              fontSize: '12px'
            }}>
              <div style={{ 
                padding: '0.5rem',
                backgroundColor: component.isCustomizable ? '#d4edda' : '#f8d7da',
                color: component.isCustomizable ? '#155724' : '#721c24',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {component.isCustomizable ? '✅ Customizable' : '❌ Fixed'}
              </div>
              <div style={{ 
                padding: '0.5rem',
                backgroundColor: component.isRequired ? '#fff3cd' : '#d1ecf1',
                color: component.isRequired ? '#856404' : '#0c5460',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {component.isRequired ? '⚠️ Required' : 'ℹ️ Optional'}
              </div>
            </div>

            {/* Stock and Order */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <div>
                <span style={{ color: '#6c757d' }}>Stock:</span>
                <span style={{ 
                  marginLeft: '0.5rem', 
                  fontWeight: '500',
                  color: component.stockQuantity > 10 ? '#28a745' : '#dc3545'
                }}>
                  {component.stockQuantity}
                </span>
              </div>
              <div>
                <span style={{ color: '#6c757d' }}>Order:</span>
                <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                  #{component.displayOrder}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => handleEdit(component)}
                className="admin-button admin-button-outline"
                style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(component.id)}
                className="admin-button"
                style={{ 
                  padding: '0.5rem',
                  fontSize: '14px',
                  backgroundColor: '#dc3545',
                  color: 'white'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: '#6c757d' }}>
          No components found. {searchTerm || selectedType !== "all" ? "Try adjusting your filters." : "Add your first component to get started."}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '24px', fontWeight: '600' }}>
                {editingComponent ? 'Edit Component' : 'Add New Component'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Component Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="admin-input"
                        placeholder="e.g., 18K Gold Setting"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="admin-input"
                      >
                        <option value="MATERIAL">Material</option>
                        <option value="STONE">Stone</option>
                        <option value="SIZING">Sizing</option>
                        <option value="FINISH">Finish</option>
                        <option value="ACCESSORY">Accessory</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="admin-input"
                      rows="3"
                      placeholder="Describe this component and its purpose..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="admin-input"
                      placeholder="e.g., PRECIOUS_METALS, GEMSTONES"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Available Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.options}
                      onChange={(e) => setFormData({...formData, options: e.target.value})}
                      className="admin-input"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Price Modifier (VND)
                      </label>
                      <input
                        type="number"
                        value={formData.priceModifier}
                        onChange={(e) => setFormData({...formData, priceModifier: e.target.value})}
                        className="admin-input"
                        placeholder="0"
                        step="1000"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                        className="admin-input"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({...formData, displayOrder: e.target.value})}
                        className="admin-input"
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.isCustomizable}
                          onChange={(e) => setFormData({...formData, isCustomizable: e.target.checked})}
                        />
                        <span style={{ fontWeight: '500' }}>Customizable</span>
                      </label>
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.isRequired}
                          onChange={(e) => setFormData({...formData, isRequired: e.target.checked})}
                        />
                        <span style={{ fontWeight: '500' }}>Required</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="admin-button admin-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-button admin-button-primary"
                  >
                    {editingComponent ? 'Update Component' : 'Create Component'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentsManager;