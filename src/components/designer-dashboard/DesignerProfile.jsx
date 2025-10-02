import { useState, useEffect } from "react";
import { designersAPI } from "@/services/api";

const DesignerProfile = ({ designerInfo }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (designerInfo) {
      setProfile(designerInfo);
      setFormData(designerInfo);
      setLoading(false);
    }
  }, [designerInfo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await designersAPI.update(profile.id, formData);
      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="designer-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="designer-profile-error">
        <h3>Profile Not Found</h3>
        <p>Unable to load designer profile.</p>
      </div>
    );
  }

  return (
    <div className="designer-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name ? profile.name.charAt(0).toUpperCase() : "D"}
        </div>
        <div className="profile-info">
          <h2>{profile.name}</h2>
          <p className="profile-code">{profile.code}</p>
          <p className="profile-brand">{profile.brandName}</p>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-button" onClick={handleSave}>
                Save Changes
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-content">
        {/* Basic Information */}
        <div className="profile-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Designer Code</label>
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Brand Name</label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Specialty</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="yearsExperience"
                value={formData.yearsExperience || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Design Style</label>
              <input
                type="text"
                name="designStyle"
                value={formData.designStyle || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="profile-section">
          <h3>Default Commission Settings</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Default Commission %</label>
              <input
                type="number"
                name="defaultCommissionPercent"
                value={formData.defaultCommissionPercent || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
                step="0.01"
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Default Loyalty %</label>
              <input
                type="number"
                name="defaultLoyaltyPercent"
                value={formData.defaultLoyaltyPercent || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
                step="0.01"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="profile-section">
          <h3>Contact Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Portfolio URL</label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Bio and Description */}
        <div className="profile-section">
          <h3>About</h3>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-textarea"
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Social Media Links</label>
            <textarea
              name="socialMediaLinks"
              value={formData.socialMediaLinks || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-textarea"
              rows={3}
              placeholder="JSON format or comma-separated links"
            />
          </div>
        </div>

        {/* Status and Statistics */}
        <div className="profile-section">
          <h3>Status & Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Verified Designer</label>
              <span className={`status ${profile.verified ? 'verified' : 'unverified'}`}>
                {profile.verified ? '✓ Verified' : '○ Not Verified'}
              </span>
            </div>
            <div className="stat-item">
              <label>Featured Designer</label>
              <span className={`status ${profile.featured ? 'featured' : 'regular'}`}>
                {profile.featured ? '⭐ Featured' : '○ Regular'}
              </span>
            </div>
            <div className="stat-item">
              <label>Total Designs Created</label>
              <span className="stat-value">{profile.totalDesignsCreated || 0}</span>
            </div>
            <div className="stat-item">
              <label>Total Products Sold</label>
              <span className="stat-value">{profile.totalProductsSold || 0}</span>
            </div>
            <div className="stat-item">
              <label>Average Rating</label>
              <span className="stat-value">
                {profile.rating ? `${parseFloat(profile.rating).toFixed(1)} ⭐` : 'No ratings yet'}
              </span>
            </div>
            <div className="stat-item">
              <label>Join Date</label>
              <span className="stat-value">{profile.joinDate ? formatDate(profile.joinDate) : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerProfile;