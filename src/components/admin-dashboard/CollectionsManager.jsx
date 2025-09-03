import React, { useState, useEffect } from "react";
import { collectionsAPI, handleAPIError } from "../../services/api";

const CollectionsManager = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    season: "",
    year: new Date().getFullYear().toString(),
    theme: "",
    imageUrl: "",
    bannerImageUrl: "",
    imageUrls: "",
    status: "ACTIVE",
    featured: false,
    sortOrder: 0,
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await collectionsAPI.getAll();
      setCollections(response.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load collections');
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      description: "",
      season: "",
      year: new Date().getFullYear().toString(),
      theme: "",
      imageUrl: "",
      bannerImageUrl: "",
      imageUrls: "",
      status: "ACTIVE",
      featured: false,
      sortOrder: 0,
      startDate: "",
      endDate: ""
    });
    setEditingCollection(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (collection) => {
    setFormData({
      name: collection.name || "",
      title: collection.title || "",
      description: collection.description || "",
      season: collection.season || "",
      year: collection.year?.toString() || new Date().getFullYear().toString(),
      theme: collection.theme || "",
      imageUrl: collection.imageUrl || "",
      bannerImageUrl: collection.bannerImageUrl || "",
      imageUrls: Array.isArray(collection.imageUrls) ? collection.imageUrls.join(", ") : "",
      status: collection.status || "ACTIVE",
      featured: collection.featured || false,
      sortOrder: collection.sortOrder?.toString() || "0",
      startDate: collection.startDate || "",
      endDate: collection.endDate || ""
    });
    setEditingCollection(collection);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        name: formData.name,
        title: formData.title,
        description: formData.description,
        season: formData.season || null,
        year: parseInt(formData.year) || null,
        theme: formData.theme || null,
        imageUrl: formData.imageUrl || null,
        bannerImageUrl: formData.bannerImageUrl || null,
        imageUrls: formData.imageUrls ? JSON.stringify(formData.imageUrls.split(",").map(url => url.trim()).filter(url => url)) : null,
        status: formData.status,
        featured: formData.featured,
        sortOrder: parseInt(formData.sortOrder) || 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      };

      if (editingCollection) {
        await collectionsAPI.update(editingCollection.id, submitData);
      } else {
        await collectionsAPI.create(submitData);
      }

      await fetchCollections();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to save collection');
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      await collectionsAPI.delete(id);
      await fetchCollections();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to delete collection');
      setError(errorInfo.message);
    }
  };

  const toggleFeatured = async (collection) => {
    try {
      const updateData = {
        name: collection.name,
        title: collection.title,
        description: collection.description,
        season: collection.season,
        year: collection.year,
        theme: collection.theme,
        imageUrl: collection.imageUrl,
        bannerImageUrl: collection.bannerImageUrl,
        status: collection.status,
        featured: !collection.featured,
        sortOrder: collection.sortOrder,
        startDate: collection.startDate,
        endDate: collection.endDate
      };
      await collectionsAPI.update(collection.id, updateData);
      await fetchCollections();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to update featured status');
      setError(errorInfo.message);
    }
  };

  const filteredCollections = collections.filter(collection =>
    collection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.season?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  if (loading) {
    return (
      <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div>Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="collections-manager">
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
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ flex: 1, maxWidth: '400px' }}
          />
          <button onClick={handleAdd} className="admin-button admin-button-primary">
            📦 Add Collection
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredCollections.map(collection => (
          <div key={collection.id} className="admin-card" style={{ overflow: 'hidden' }}>
            {collection.imageUrl && (
              <div style={{ 
                height: '200px', 
                backgroundImage: `url(${collection.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                {collection.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#bc224c',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    ⭐ Featured
                  </div>
                )}
              </div>
            )}
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '18px', fontWeight: '600', color: '#212529' }}>
                    {collection.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '0.5rem' }}>
                    ID: <code style={{ background: '#f8f9fa', padding: '2px 4px', borderRadius: '4px' }}>{collection.id}</code>
                  </div>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6c757d', lineHeight: '1.4' }}>
                    {collection.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Collection Info */}
              <div style={{ 
                margin: '1rem 0',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <span style={{ color: '#6c757d' }}>Season:</span>
                    <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                      {collection.season || 'All Seasons'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>Year:</span>
                    <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                      {collection.year || currentYear}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>Products:</span>
                    <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                      {collection.productCount || 0}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>Status:</span>
                    <span style={{ 
                      marginLeft: '0.5rem',
                      color: collection.isActive !== false ? '#28a745' : '#dc3545',
                      fontWeight: '500'
                    }}>
                      {collection.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => handleEdit(collection)}
                  className="admin-button admin-button-outline"
                  style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleFeatured(collection)}
                  className="admin-button admin-button-secondary"
                  style={{ padding: '0.5rem', fontSize: '14px' }}
                >
                  {collection.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => handleDelete(collection.id)}
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
          </div>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: '#6c757d' }}>
          No collections found. {searchTerm ? "Try adjusting your search." : "Add your first collection to get started."}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '24px', fontWeight: '600' }}>
                {editingCollection ? 'Edit Collection' : 'Add New Collection'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Collection Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="admin-input"
                        placeholder="e.g., Spring Elegance"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="admin-input"
                        placeholder="e.g., Elegant Spring Jewelry Collection"
                        required
                      />
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
                      placeholder="Describe this collection's theme and style..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Season
                      </label>
                      <select
                        value={formData.season}
                        onChange={(e) => setFormData({...formData, season: e.target.value})}
                        className="admin-input"
                      >
                        <option value="">All Seasons</option>
                        <option value="SPRING">Spring</option>
                        <option value="SUMMER">Summer</option>
                        <option value="AUTUMN">Autumn</option>
                        <option value="WINTER">Winter</option>
                        <option value="HOLIDAY">Holiday</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Year
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="admin-input"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({...formData, sortOrder: e.target.value})}
                        className="admin-input"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Theme
                    </label>
                    <input
                      type="text"
                      value={formData.theme}
                      onChange={(e) => setFormData({...formData, theme: e.target.value})}
                      className="admin-input"
                      placeholder="e.g., Floral, Vintage, Modern"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Collection Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        className="admin-input"
                        placeholder="https://example.com/collection-image.jpg"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Banner Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.bannerImageUrl}
                        onChange={(e) => setFormData({...formData, bannerImageUrl: e.target.value})}
                        className="admin-input"
                        placeholder="https://example.com/banner-image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Additional Images (comma-separated URLs)
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrls}
                      onChange={(e) => setFormData({...formData, imageUrls: e.target.value})}
                      className="admin-input"
                      placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="admin-input"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        />
                        <span style={{ fontWeight: '500' }}>Featured Collection</span>
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
                    {editingCollection ? 'Update Collection' : 'Create Collection'}
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

export default CollectionsManager;