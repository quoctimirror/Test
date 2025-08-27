import React, { useState, useEffect } from "react";
import { categoriesAPI, handleAPIError } from "../../services/api";

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load categories');
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: ""
    });
    setEditingCategory(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name || "",
      description: category.description || ""
    });
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
      } else {
        await categoriesAPI.create(formData);
      }

      await fetchCategories();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to save category');
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoriesAPI.delete(id);
      await fetchCategories();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to delete category');
      setError(errorInfo.message);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="categories-manager">
      {error && (
        <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee', borderColor: '#feb2b2' }}>
          <div style={{ color: '#c53030' }}>{error}</div>
        </div>
      )}

      {/* Header Controls */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ flex: 1, maxWidth: '400px' }}
          />
          <button onClick={handleAdd} className="admin-button admin-button-primary">
            📂 Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredCategories.map(category => (
          <div key={category.id} className="admin-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '18px', fontWeight: '600', color: '#212529' }}>
                  {category.name}
                </h3>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '0.5rem' }}>
                  ID: <code style={{ background: '#f8f9fa', padding: '2px 4px', borderRadius: '4px' }}>{category.id}</code>
                </div>
                <p style={{ margin: '0', fontSize: '14px', color: '#6c757d', lineHeight: '1.4' }}>
                  {category.description || 'No description provided'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => handleEdit(category)}
                className="admin-button admin-button-outline"
                style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="admin-button"
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '14px',
                  backgroundColor: '#dc3545',
                  color: 'white'
                }}
              >
                Delete
              </button>
            </div>

            {/* Category Stats */}
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#6c757d'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Products:</span>
                <span style={{ fontWeight: '500' }}>-</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span>Status:</span>
                <span style={{ 
                  color: category.isActive !== false ? '#28a745' : '#dc3545',
                  fontWeight: '500'
                }}>
                  {category.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: '#6c757d' }}>
          No categories found. {searchTerm ? "Try adjusting your search." : "Add your first category to get started."}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '24px', fontWeight: '600' }}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="admin-input"
                      placeholder="e.g., Rings, Necklaces, Earrings"
                      required
                    />
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
                      placeholder="Describe this product category..."
                    />
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
                    {editingCategory ? 'Update Category' : 'Create Category'}
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

export default CategoriesManager;