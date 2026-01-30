import React, { useState, useEffect, useCallback } from 'react';
import { productFinderAdminAPI, productFinderAPI } from '../../services/api';
import './ProductFinderAdminPage.css';

const ProductFinderAdminPage = () => {
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCombination, setEditingCombination] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Options for dropdowns
  const [bandOptions, setBandOptions] = useState([]);
  const [mainStoneOptions, setMainStoneOptions] = useState([]);
  const [sideStoneOptions, setSideStoneOptions] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    bandCode: '',
    mainStoneCode: '',
    sideStoneCode: '',
    modelId: '',
    images: [''],
    isActive: true,
  });

  // Load combinations
  const loadCombinations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productFinderAdminAPI.getCombinations();
      setCombinations(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load combinations:', err);
      setError('Failed to load combinations. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load options for dropdowns
  const loadOptions = useCallback(async () => {
    try {
      const [bandsRes, stonesRes, sidestonesRes] = await Promise.all([
        productFinderAPI.getBandStyles(),
        productFinderAPI.getDiamondShapes(),
        productFinderAPI.getSideStones(),
      ]);
      setBandOptions(bandsRes.data || []);
      setMainStoneOptions(stonesRes.data || []);
      setSideStoneOptions(sidestonesRes.data || []);
    } catch (err) {
      console.error('Failed to load options:', err);
    }
  }, []);

  useEffect(() => {
    loadCombinations();
    loadOptions();
  }, [loadCombinations, loadOptions]);

  // Auto-clear action message after 5 seconds
  useEffect(() => {
    if (actionMessage.text) {
      const timer = setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // Show action message (replaces alert())
  const showMessage = (type, text) => {
    setActionMessage({ type, text });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle images array changes
  const handleImageChange = (index, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const removeImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Open modal for creating new combination
  const handleCreate = () => {
    setEditingCombination(null);
    setFormData({
      bandCode: '',
      mainStoneCode: '',
      sideStoneCode: '',
      modelId: '',
      images: [''],
      isActive: true,
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (combination) => {
    setEditingCombination(combination);
    setFormData({
      bandCode: combination.bandCode,
      mainStoneCode: combination.mainStoneCode,
      sideStoneCode: combination.sideStoneCode,
      modelId: combination.modelId || '',
      images: combination.images?.length > 0 ? combination.images : [''],
      isActive: combination.isActive,
    });
    setShowModal(true);
  };

  // Save combination
  const handleSave = async () => {
    try {
      setSaving(true);

      // Filter out empty images
      const cleanedData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
      };

      if (editingCombination) {
        await productFinderAdminAPI.updateCombination(editingCombination.id, cleanedData);
      } else {
        await productFinderAdminAPI.createCombination(cleanedData);
      }

      setShowModal(false);
      loadCombinations();
      showMessage('success', 'Combination saved successfully');
    } catch (err) {
      console.error('Failed to save combination:', err);
      showMessage('error', err.response?.data?.message || 'Failed to save combination');
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggle = async (id) => {
    try {
      await productFinderAdminAPI.toggleCombination(id);
      loadCombinations();
      showMessage('success', 'Status updated');
    } catch (err) {
      console.error('Failed to toggle combination:', err);
      showMessage('error', 'Failed to toggle combination status');
    }
  };

  // Delete combination
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this combination?')) {
      return;
    }

    try {
      await productFinderAdminAPI.deleteCombination(id);
      loadCombinations();
      showMessage('success', 'Combination deleted');
    } catch (err) {
      console.error('Failed to delete combination:', err);
      showMessage('error', 'Failed to delete combination');
    }
  };

  if (loading) {
    return (
      <div className="pf-admin">
        <div className="pf-admin__loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pf-admin">
        <div className="pf-admin__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="pf-admin">
      <div className="pf-admin__header">
        <h1>Product Finder Combinations</h1>
        <button className="pf-admin__btn pf-admin__btn--primary" onClick={handleCreate}>
          + Add New Combination
        </button>
      </div>

      {/* Action message toast */}
      {actionMessage.text && (
        <div className={`pf-admin__toast pf-admin__toast--${actionMessage.type}`}>
          {actionMessage.text}
          <button onClick={() => setActionMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="pf-admin__table-container">
        <table className="pf-admin__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Band</th>
              <th>Main Stone</th>
              <th>Side Stone</th>
              <th>Model ID</th>
              <th>Images</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {combinations.map((combo) => (
              <tr key={combo.id} className={!combo.isActive ? 'pf-admin__row--inactive' : ''}>
                <td>{combo.id}</td>
                <td>{combo.bandCode}</td>
                <td>{combo.mainStoneCode}</td>
                <td>{combo.sideStoneCode}</td>
                <td className="pf-admin__cell--modelid">
                  {combo.modelId ? (
                    <span title={combo.modelId}>{combo.modelId.substring(0, 12)}...</span>
                  ) : (
                    <span className="pf-admin__empty">-</span>
                  )}
                </td>
                <td>{combo.images?.length || 0} images</td>
                <td>
                  <button
                    className={`pf-admin__toggle ${combo.isActive ? 'pf-admin__toggle--active' : ''}`}
                    onClick={() => handleToggle(combo.id)}
                  >
                    {combo.isActive ? '✓' : '✗'}
                  </button>
                </td>
                <td className="pf-admin__actions">
                  <button className="pf-admin__btn pf-admin__btn--edit" onClick={() => handleEdit(combo)}>
                    Edit
                  </button>
                  <button className="pf-admin__btn pf-admin__btn--delete" onClick={() => handleDelete(combo.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {combinations.length === 0 && (
              <tr>
                <td colSpan="8" className="pf-admin__empty-row">
                  No combinations found. Click "Add New Combination" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="pf-admin__modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pf-admin__modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCombination ? 'Edit Combination' : 'New Combination'}</h2>

            <div className="pf-admin__form">
              <div className="pf-admin__form-group">
                <label>Band Style</label>
                <select name="bandCode" value={formData.bandCode} onChange={handleInputChange}>
                  <option value="">-- Select Band --</option>
                  {bandOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name} ({opt.id})</option>
                  ))}
                </select>
              </div>

              <div className="pf-admin__form-group">
                <label>Main Stone</label>
                <select name="mainStoneCode" value={formData.mainStoneCode} onChange={handleInputChange}>
                  <option value="">-- Select Main Stone --</option>
                  {mainStoneOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name} ({opt.id})</option>
                  ))}
                </select>
              </div>

              <div className="pf-admin__form-group">
                <label>Side Stone</label>
                <select name="sideStoneCode" value={formData.sideStoneCode} onChange={handleInputChange}>
                  <option value="">-- Select Side Stone --</option>
                  {sideStoneOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name} ({opt.id})</option>
                  ))}
                </select>
              </div>

              <div className="pf-admin__form-group">
                <label>Model ID (iJewel)</label>
                <input
                  type="text"
                  name="modelId"
                  value={formData.modelId}
                  onChange={handleInputChange}
                  placeholder="e.g. SLWfrDdYSqaqN9UFP1CXcA"
                />
              </div>

              <div className="pf-admin__form-group">
                <label>Images (JSON Array)</label>
                {formData.images.map((img, index) => (
                  <div key={index} className="pf-admin__image-input">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder={`Image path ${index + 1}, e.g. /product-finder/a1_single_round_baguette.png`}
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        className="pf-admin__btn pf-admin__btn--remove"
                        onClick={() => removeImageField(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="pf-admin__btn pf-admin__btn--add" onClick={addImageField}>
                  + Add Image
                </button>
              </div>

              <div className="pf-admin__form-group pf-admin__form-group--checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="pf-admin__modal-actions">
              <button
                className="pf-admin__btn pf-admin__btn--cancel"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="pf-admin__btn pf-admin__btn--save"
                onClick={handleSave}
                disabled={saving || !formData.bandCode || !formData.mainStoneCode || !formData.sideStoneCode}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFinderAdminPage;
