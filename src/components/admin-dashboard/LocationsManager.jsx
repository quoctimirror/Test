import React, { useState, useEffect } from "react";
import { locationsAPI, handleAPIError } from "@services/api";

const LocationsManager = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    type: "SHOWROOM",
    address: "",
    city: "",
    phone: "",
    hours: "",
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load locations');
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "SHOWROOM",
      address: "",
      city: "",
      phone: "",
      hours: "",
      latitude: "",
      longitude: ""
    });
    setEditingLocation(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (location) => {
    setFormData({
      name: location.name || "",
      type: location.type || "SHOWROOM",
      address: location.address || "",
      city: location.city || "",
      phone: location.phone || "",
      hours: location.hours || "",
      latitude: location.coordinates?.lat?.toString() || location.latitude?.toString() || "",
      longitude: location.coordinates?.lng?.toString() || location.longitude?.toString() || ""
    });
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        name: formData.name,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        hours: formData.hours,
        latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 0
      };

      if (editingLocation) {
        await locationsAPI.update(editingLocation.id, submitData);
      } else {
        await locationsAPI.create(submitData);
      }

      await fetchLocations();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to save location');
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      await locationsAPI.delete(id);
      await fetchLocations();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to delete location');
      setError(errorInfo.message);
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SHOWROOM': return '🪟';
      case 'BOUTIQUE': return '';
      case 'POD': return '';
      default: return '';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SHOWROOM': return '#ffc107';
      case 'BOUTIQUE': return '#17a2b8';
      case 'POD': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="admin-empty-state">
        <div>Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="admin-card" style={{ padding: '1.5rem' }}>
      {error && (
        <div className="admin-error-state" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ flex: 1 }}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="admin-select"
            style={{ width: '150px' }}
          >
            <option value="all">All Types</option>
            <option value="SHOWROOM">Showroom</option>
            <option value="BOUTIQUE">Boutique</option>
            <option value="POD">Pod</option>
          </select>
        </div>
        <button onClick={handleAdd} className="admin-button admin-button-primary" title="Add Location">
          Add Location
        </button>
      </div>

      {/* Locations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
        {filteredLocations.map(location => (
          <div key={location.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                {location.name}
              </h3>
              <div className="status-pill" style={{
                display: 'inline-block',
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                borderColor: '#cbd5e1',
                textTransform: 'uppercase',
                marginBottom: '0.5rem'
              }}>
                {location.type || 'SHOWROOM'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                ID: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.6875rem' }}>{location.id}</code>
              </div>
            </div>

            {/* Location Details */}
            <div style={{ marginBottom: '1rem', lineHeight: '1.5', fontSize: '0.8125rem', color: '#64748b' }}>
              {location.address && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ color: '#0f172a' }}>
                    {location.address}
                  </div>
                  {location.city && <div style={{ fontSize: '0.75rem' }}>{location.city}</div>}
                </div>
              )}

              {location.phone && (
                <div style={{ marginBottom: '0.5rem' }}>
                  Phone: <span style={{ color: '#0f172a' }}>{location.phone}</span>
                </div>
              )}

              {location.email && (
                <div style={{ marginBottom: '0.5rem' }}>
                  Email: <span style={{ color: '#0f172a' }}>{location.email}</span>
                </div>
              )}

              {location.hours && (
                <div style={{ marginBottom: '0.5rem' }}>
                  Hours: <span style={{ color: '#0f172a' }}>{location.hours}</span>
                </div>
              )}
            </div>

            {/* Coordinates */}
            {(location.latitude || location.longitude) && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#fafbfc',
                borderRadius: '6px',
                fontSize: '0.75rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ color: '#64748b', marginBottom: '0.25rem', fontWeight: '500' }}>Coordinates:</div>
                <div style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '0.6875rem' }}>
                  {location.latitude}, {location.longitude}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => handleEdit(location)}
                className="admin-button admin-button-outline"
                style={{ flex: 1, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              >
                Edit
              </button>
              {(location.latitude && location.longitude) && (
                <button
                  onClick={() => window.open(`https://maps.google.com?q=${location.latitude},${location.longitude}`, '_blank')}
                  className="admin-button admin-button-secondary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                >
                  Map
                </button>
              )}
              <button
                onClick={() => handleDelete(location.id)}
                className="admin-button admin-button-danger"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="admin-empty-state">
          No locations found. {searchTerm || selectedType !== "all" ? "Try adjusting your filters." : "Add your first location to get started."}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                        Location Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="admin-input"
                        placeholder="e.g., District 1 Flagship Store"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="admin-select"
                      >
                        <option value="SHOWROOM">Showroom</option>
                        <option value="BOUTIQUE">Boutique</option>
                        <option value="POD">Pod</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="admin-input"
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="admin-input"
                      placeholder="City name"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="admin-input"
                        placeholder="+84 123 456 7890"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="admin-input"
                        placeholder="store@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                      Business Hours
                    </label>
                    <input
                      type="text"
                      value={formData.hours}
                      onChange={(e) => setFormData({...formData, hours: e.target.value})}
                      className="admin-input"
                      placeholder="e.g., Mon-Sat: 9AM-8PM, Sun: 10AM-6PM"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                        Latitude
                      </label>
                      <input
                        type="number"
                        value={formData.latitude}
                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                        className="admin-input"
                        placeholder="10.7769"
                        step="any"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                        Longitude
                      </label>
                      <input
                        type="number"
                        value={formData.longitude}
                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                        className="admin-input"
                        placeholder="106.7009"
                        step="any"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
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
                    {editingLocation ? 'Update Location' : 'Create Location'}
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

export default LocationsManager;