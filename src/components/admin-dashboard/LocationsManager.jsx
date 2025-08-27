import React, { useState, useEffect } from "react";
import { locationsAPI, handleAPIError } from "../../services/api";

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
    type: "STORE",
    address: "",
    city: "",
    phone: "",
    email: "",
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
      type: "STORE",
      address: "",
      city: "",
      phone: "",
      email: "",
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
      type: location.type || "STORE",
      address: location.address || "",
      city: location.city || "",
      phone: location.phone || "",
      email: location.email || "",
      hours: location.hours || "",
      latitude: location.latitude?.toString() || "",
      longitude: location.longitude?.toString() || ""
    });
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
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
      case 'FLAGSHIP': return '🏢';
      case 'BOUTIQUE': return '🏪';
      case 'OUTLET': return '🏬';
      case 'SHOWROOM': return '🪟';
      default: return '📍';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'FLAGSHIP': return '#bc224c';
      case 'BOUTIQUE': return '#17a2b8';
      case 'OUTLET': return '#28a745';
      case 'SHOWROOM': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div>Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="locations-manager">
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
              placeholder="Search locations..."
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
              <option value="STORE">Store</option>
              <option value="FLAGSHIP">Flagship</option>
              <option value="BOUTIQUE">Boutique</option>
              <option value="OUTLET">Outlet</option>
              <option value="SHOWROOM">Showroom</option>
            </select>
          </div>
          <button onClick={handleAdd} className="admin-button admin-button-primary">
            📍 Add Location
          </button>
        </div>
      </div>

      {/* Locations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {filteredLocations.map(location => (
          <div key={location.id} className="admin-card" style={{ padding: '1.5rem' }}>
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
                  backgroundColor: getTypeColor(location.type),
                  color: 'white',
                  flexShrink: 0
                }}
              >
                {getTypeIcon(location.type)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '18px', fontWeight: '600', color: '#212529' }}>
                  {location.name}
                </h3>
                <div style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: getTypeColor(location.type),
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}>
                  {location.type || 'STORE'}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  ID: <code style={{ background: '#f8f9fa', padding: '2px 4px', borderRadius: '4px' }}>{location.id}</code>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
              {location.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '14px' }}>📍</span>
                  <div style={{ fontSize: '14px', color: '#495057' }}>
                    {location.address}
                    {location.city && <div style={{ color: '#6c757d', fontSize: '13px' }}>{location.city}</div>}
                  </div>
                </div>
              )}
              
              {location.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '14px' }}>📞</span>
                  <span style={{ fontSize: '14px', color: '#495057' }}>{location.phone}</span>
                </div>
              )}
              
              {location.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '14px' }}>📧</span>
                  <span style={{ fontSize: '14px', color: '#495057' }}>{location.email}</span>
                </div>
              )}
              
              {location.hours && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '14px' }}>🕒</span>
                  <span style={{ fontSize: '14px', color: '#495057' }}>{location.hours}</span>
                </div>
              )}
            </div>

            {/* Coordinates */}
            {(location.latitude || location.longitude) && (
              <div style={{ 
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <div style={{ color: '#6c757d', marginBottom: '0.25rem' }}>Coordinates:</div>
                <div style={{ fontFamily: 'monospace', color: '#495057' }}>
                  {location.latitude}, {location.longitude}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => handleEdit(location)}
                className="admin-button admin-button-outline"
                style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}
              >
                Edit
              </button>
              {(location.latitude && location.longitude) && (
                <button
                  onClick={() => window.open(`https://maps.google.com?q=${location.latitude},${location.longitude}`, '_blank')}
                  className="admin-button admin-button-secondary"
                  style={{ padding: '0.5rem', fontSize: '14px' }}
                >
                  Map
                </button>
              )}
              <button
                onClick={() => handleDelete(location.id)}
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

      {filteredLocations.length === 0 && (
        <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: '#6c757d' }}>
          No locations found. {searchTerm || selectedType !== "all" ? "Try adjusting your filters." : "Add your first location to get started."}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '24px', fontWeight: '600' }}>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="admin-input"
                      >
                        <option value="STORE">Store</option>
                        <option value="FLAGSHIP">Flagship</option>
                        <option value="BOUTIQUE">Boutique</option>
                        <option value="OUTLET">Outlet</option>
                        <option value="SHOWROOM">Showroom</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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