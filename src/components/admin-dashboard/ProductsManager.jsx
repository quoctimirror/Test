import React, { useState, useEffect } from "react";
import { productsAPI, categoriesAPI, handleAPIError } from "../../services/api";

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    sku: "",
    price: "",
    currency: "VND",
    metalType: "GOLD",
    metalPurity: "",
    stoneType: "",
    weightGrams: "",
    dimensions: "",
    imageUrl: "",
    imageUrls: "",
    tags: "",
    status: "ACTIVE",
    featured: false,
    stockQuantity: "",
    minStockLevel: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load data');
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      sku: "",
      price: "",
      currency: "VND",
      metalType: "GOLD",
      metalPurity: "",
      stoneType: "",
      weightGrams: "",
      dimensions: "",
      imageUrl: "",
      imageUrls: "",
      tags: "",
      status: "ACTIVE",
      featured: false,
      stockQuantity: "",
      minStockLevel: ""
    });
    setEditingProduct(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      categoryId: product.categoryId || "",
      sku: product.sku || "",
      price: product.price?.toString() || "",
      currency: product.currency || "VND",
      metalType: product.metalType || "GOLD",
      metalPurity: product.metalPurity || "",
      stoneType: product.stoneType || "",
      weightGrams: product.weightGrams?.toString() || "",
      dimensions: product.dimensions ? JSON.stringify(product.dimensions) : "",
      imageUrl: product.imageUrl || "",
      imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls.join(", ") : "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      status: product.status || "ACTIVE",
      featured: product.featured || false,
      stockQuantity: product.stockQuantity?.toString() || "",
      minStockLevel: product.minStockLevel?.toString() || ""
    });
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        weightGrams: formData.weightGrams ? parseFloat(formData.weightGrams) : null,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 1,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [],
        imageUrls: formData.imageUrls ? formData.imageUrls.split(",").map(url => url.trim()).filter(url => url) : [],
        dimensions: formData.dimensions || null
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, submitData);
      } else {
        await productsAPI.create(submitData);
      }

      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to save product');
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.delete(id);
      await fetchData();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to delete product');
      setError(errorInfo.message);
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await productsAPI.toggleFeatured(product.id);
      await fetchData();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to update featured status');
      setError(errorInfo.message);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="products-manager">
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ flex: 1 }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-input"
              style={{ width: '200px' }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} className="admin-button admin-button-primary">
            ✨ Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: '500' }}>{product.name}</div>
                      {product.featured && (
                        <span style={{ fontSize: '12px', color: '#bc224c', fontWeight: '500' }}>⭐ Featured</span>
                      )}
                    </div>
                  </div>
                </td>
                <td><code style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: '4px' }}>{product.sku}</code></td>
                <td>{product.category?.name || 'No Category'}</td>
                <td>{formatPrice(product.price, product.currency)}</td>
                <td>
                  <span style={{ 
                    color: product.stockQuantity <= product.minStockLevel ? '#dc3545' : '#28a745',
                    fontWeight: '500'
                  }}>
                    {product.stockQuantity || 0}
                  </span>
                  {product.stockQuantity <= product.minStockLevel && (
                    <span style={{ fontSize: '12px', color: '#dc3545', marginLeft: '4px' }}>Low</span>
                  )}
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    backgroundColor: product.status === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                    color: product.status === 'ACTIVE' ? '#155724' : '#721c24'
                  }}>
                    {product.status || 'ACTIVE'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      className="admin-button admin-button-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleFeatured(product)}
                      className="admin-button admin-button-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                    >
                      {product.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="admin-button"
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        fontSize: '12px',
                        backgroundColor: '#dc3545',
                        color: 'white'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6c757d' }}>
            No products found. {searchTerm || selectedCategory !== "all" ? "Try adjusting your filters." : "Add your first product to get started."}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '24px', fontWeight: '600' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>SKU *</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        className="admin-input"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="admin-input"
                      rows="3"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category *</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="admin-input"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="admin-input"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Metal Type</label>
                      <select
                        value={formData.metalType}
                        onChange={(e) => setFormData({...formData, metalType: e.target.value})}
                        className="admin-input"
                      >
                        <option value="GOLD">Gold</option>
                        <option value="SILVER">Silver</option>
                        <option value="PLATINUM">Platinum</option>
                        <option value="ROSE_GOLD">Rose Gold</option>
                        <option value="WHITE_GOLD">White Gold</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Metal Purity</label>
                      <input
                        type="text"
                        value={formData.metalPurity}
                        onChange={(e) => setFormData({...formData, metalPurity: e.target.value})}
                        className="admin-input"
                        placeholder="e.g., 18K, 14K"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Weight (g)</label>
                      <input
                        type="number"
                        value={formData.weightGrams}
                        onChange={(e) => setFormData({...formData, weightGrams: e.target.value})}
                        className="admin-input"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Stock Quantity</label>
                      <input
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                        className="admin-input"
                        min="0"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Min Stock Level</label>
                      <input
                        type="number"
                        value={formData.minStockLevel}
                        onChange={(e) => setFormData({...formData, minStockLevel: e.target.value})}
                        className="admin-input"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Image URL</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="admin-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="admin-input"
                      placeholder="luxury, engagement, diamond"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      />
                      <span style={{ fontWeight: '500' }}>Featured Product</span>
                    </label>
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
                    {editingProduct ? 'Update Product' : 'Create Product'}
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

export default ProductsManager;