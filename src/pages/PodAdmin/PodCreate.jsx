import { useState, useEffect } from "react";
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
    displayCapacity: 10,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.partnerId || !formData.name || !formData.locationName) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        displayCapacity: parseInt(formData.displayCapacity),
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
