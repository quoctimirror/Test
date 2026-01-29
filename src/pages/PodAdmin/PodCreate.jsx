import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { podApi_pods, partnerApi, POD_ENUMS } from "@/services/podApi";
import { ROUTES } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminPodCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const mapRef = useRef(null);

  const [formData, setFormData] = useState({
    partnerId: "",
    name: "",
    locationName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
    latitude: "",
    longitude: "",
    displayCapacity: 10,
    commissionRate: "",
    notes: "",
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoadingPartners(true);
      const response = await partnerApi.getAll({ size: 100, status: "ACTIVE" });
      setPartners(response.data.content || []);
    } catch (err) {
      console.error("Error fetching partners:", err);
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Search address and get coordinates using Nominatim (OpenStreetMap)
  const searchAddressCoordinates = async () => {
    const address = [
      formData.addressLine1,
      formData.city,
      formData.state,
      formData.country
    ].filter(Boolean).join(", ");

    if (!address || address === "Vietnam") {
      alert("Please enter an address first (Address Line 1 and City at minimum)");
      return;
    }

    try {
      setSearchingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { "User-Agent": "MirrorDiamond-POD-System" } }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(lat).toFixed(6),
          longitude: parseFloat(lon).toFixed(6),
        }));
        alert(`Coordinates found!\nLatitude: ${lat}\nLongitude: ${lon}`);
      } else {
        alert("Could not find coordinates for this address. Please enter manually or try a different address.");
      }
    } catch (err) {
      console.error("Error searching address:", err);
      alert("Failed to search address. Please enter coordinates manually.");
    } finally {
      setSearchingAddress(false);
    }
  };

  // Get map URL for preview
  const getMapPreviewUrl = () => {
    if (formData.latitude && formData.longitude) {
      return `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&hl=en&z=16&output=embed`;
    }
    return `https://www.google.com/maps?q=Ho+Chi+Minh+City,Vietnam&hl=en&z=12&output=embed`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.partnerId || !formData.name || !formData.locationName) {
      setError("Please fill in all required fields");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please set the location coordinates (use 'Search Coordinates' button or enter manually)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        displayCapacity: parseInt(formData.displayCapacity),
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
      };

      await podApi_pods.create(submitData);
      navigate(ROUTES.POD_ADMIN_PODS);
    } catch (err) {
      console.error("Error creating POD:", err);
      setError(err.response?.data?.message || "Failed to create POD");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Create New POD</h1>
        <Link to={ROUTES.POD_ADMIN_PODS} className="pod-btn pod-btn-secondary">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="pod-card" style={{ background: "#fef2f2", borderColor: "#fecaca", marginBottom: "1rem" }}>
          <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="pod-card">
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
            POD Information
          </h2>

          <div className="pod-form-grid">
            <div className="pod-form-group">
              <label className="pod-form-label">Partner *</label>
              <select
                name="partnerId"
                className="pod-form-select"
                value={formData.partnerId}
                onChange={handleChange}
                required
                disabled={loadingPartners}
              >
                <option value="">
                  {loadingPartners ? "Loading partners..." : "Select a partner"}
                </option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.businessName} ({partner.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">POD Name *</label>
              <input
                type="text"
                name="name"
                className="pod-form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Lobby Display"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Location Name *</label>
              <input
                type="text"
                name="locationName"
                className="pod-form-input"
                value={formData.locationName}
                onChange={handleChange}
                required
                placeholder="e.g., Main Reception Area"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Display Capacity</label>
              <input
                type="number"
                name="displayCapacity"
                className="pod-form-input"
                value={formData.displayCapacity}
                onChange={handleChange}
                min="1"
                max="100"
                placeholder="Number of products"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Commission Rate (%)</label>
              <input
                type="number"
                name="commissionRate"
                className="pod-form-input"
                value={formData.commissionRate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="Leave empty to use partner rate"
              />
              <small style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>
                Optional: Set a custom rate for this POD. If empty, uses partner's default rate.
              </small>
            </div>
          </div>
        </div>

        <div className="pod-card" style={{ marginTop: "1rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Location Address
          </h2>

          <div className="pod-form-grid">
            <div className="pod-form-group" style={{ gridColumn: "span 2" }}>
              <label className="pod-form-label">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                className="pod-form-input"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="pod-form-group" style={{ gridColumn: "span 2" }}>
              <label className="pod-form-label">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                className="pod-form-input"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Floor, building, etc."
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">City</label>
              <input
                type="text"
                name="city"
                className="pod-form-input"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">State/Province</label>
              <input
                type="text"
                name="state"
                className="pod-form-input"
                value={formData.state}
                onChange={handleChange}
                placeholder="State/Province"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                className="pod-form-input"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Country</label>
              <input
                type="text"
                name="country"
                className="pod-form-input"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* Map Coordinates Section */}
        <div className="pod-card" style={{ marginTop: "1rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Map Coordinates *
          </h2>

          <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#fef3c7", borderRadius: "8px", border: "1px solid #fcd34d" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#92400e" }}>
              📍 Location coordinates are required to display this POD on the map.
              Enter the address above and click "Search Coordinates", or enter latitude/longitude manually.
            </p>
          </div>

          <div className="pod-form-grid">
            <div className="pod-form-group">
              <label className="pod-form-label">Latitude *</label>
              <input
                type="number"
                name="latitude"
                className="pod-form-input"
                value={formData.latitude}
                onChange={handleChange}
                step="0.000001"
                placeholder="e.g., 10.762622"
                required
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Longitude *</label>
              <input
                type="number"
                name="longitude"
                className="pod-form-input"
                value={formData.longitude}
                onChange={handleChange}
                step="0.000001"
                placeholder="e.g., 106.660172"
                required
              />
            </div>

            <div className="pod-form-group" style={{ gridColumn: "span 2" }}>
              <button
                type="button"
                className="pod-btn pod-btn-secondary"
                onClick={searchAddressCoordinates}
                disabled={searchingAddress}
                style={{ width: "100%" }}
              >
                {searchingAddress ? "Searching..." : "🔍 Search Coordinates from Address"}
              </button>
              <small style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.5rem", display: "block" }}>
                Fill in the address fields above, then click this button to auto-fill coordinates
              </small>
            </div>
          </div>

          {/* Map Preview */}
          <div style={{ marginTop: "1rem" }}>
            <label className="pod-form-label">Map Preview</label>
            <div style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
              height: "300px",
              position: "relative"
            }}>
              {formData.latitude && formData.longitude ? (
                <iframe
                  ref={mapRef}
                  src={getMapPreviewUrl()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="POD Location Preview"
                />
              ) : (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  background: "#f3f4f6",
                  color: "#6b7280"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗺️</div>
                    <p style={{ margin: 0 }}>Enter coordinates to preview location on map</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pod-card" style={{ marginTop: "1rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Additional Information
          </h2>

          <div className="pod-form-group">
            <label className="pod-form-label">Notes</label>
            <textarea
              name="notes"
              className="pod-form-input"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes about the POD..."
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <Link to={ROUTES.POD_ADMIN_PODS} className="pod-btn pod-btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="pod-btn pod-btn-primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create POD"}
          </button>
        </div>
      </form>
    </div>
  );
}
