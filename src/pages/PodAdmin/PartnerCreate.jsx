import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { partnerApi, POD_ENUMS } from "@/services/podApi";
import { ROUTES } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminPartnerCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "SPA",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    businessLicense: "",
    taxId: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
    tier: "BRONZE",
    commissionRate: "5.00",
    partnerType: "LOCATION",
    wholesaleDiscountRate: "",
    territory: "",
    canSetOwnPrices: false,
    minMarkupPercent: "",
    maxMarkupPercent: "",
    contractStartDate: "",
    contractEndDate: "",
    securityDeposit: "",
    bankAccountNumber: "",
    bankName: "",
    bankBranch: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      // Set default phygital values when switching to PHYGITAL
      if (name === "partnerType" && value === "PHYGITAL") {
        if (!updated.wholesaleDiscountRate) updated.wholesaleDiscountRate = "20";
        if (!updated.minMarkupPercent) updated.minMarkupPercent = "15";
        if (!updated.maxMarkupPercent) updated.maxMarkupPercent = "50";
      }
      return updated;
    });
  };

  const isPhygital = formData.partnerType === "PHYGITAL";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.businessName || !formData.contactName || !formData.contactEmail) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        commissionRate: parseFloat(formData.commissionRate),
        wholesaleDiscountRate: formData.wholesaleDiscountRate ? parseFloat(formData.wholesaleDiscountRate) : undefined,
        minMarkupPercent: formData.minMarkupPercent ? parseFloat(formData.minMarkupPercent) : undefined,
        maxMarkupPercent: formData.maxMarkupPercent ? parseFloat(formData.maxMarkupPercent) : undefined,
        securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : undefined,
        contractStartDate: formData.contractStartDate || undefined,
        contractEndDate: formData.contractEndDate || undefined,
        territory: formData.territory || undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        bankName: formData.bankName || undefined,
        bankBranch: formData.bankBranch || undefined,
      };

      await partnerApi.create(submitData);
      navigate(ROUTES.POD_ADMIN_PARTNERS);
    } catch (err) {
      console.error("Error creating partner:", err);
      setError(err.response?.data?.message || "Failed to create partner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Create New Partner</h1>
        <Link to={ROUTES.POD_ADMIN_PARTNERS} className="pod-btn pod-btn-secondary">
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
            Business Information
          </h2>

          <div className="pod-form-grid">
            <div className="pod-form-group">
              <label className="pod-form-label">Business Name *</label>
              <input
                type="text"
                name="businessName"
                className="pod-form-input"
                value={formData.businessName}
                onChange={handleChange}
                required
                placeholder="Enter business name"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Business Type *</label>
              <select
                name="businessType"
                className="pod-form-select"
                value={formData.businessType}
                onChange={handleChange}
                required
              >
                {POD_ENUMS.businessType.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Business License</label>
              <input
                type="text"
                name="businessLicense"
                className="pod-form-input"
                value={formData.businessLicense}
                onChange={handleChange}
                placeholder="License number"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Tax ID</label>
              <input
                type="text"
                name="taxId"
                className="pod-form-input"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="Tax identification number"
              />
            </div>
          </div>
        </div>

        <div className="pod-card" style={{ marginTop: "1rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Contact Information
          </h2>

          <div className="pod-form-grid">
            <div className="pod-form-group">
              <label className="pod-form-label">Contact Name *</label>
              <input
                type="text"
                name="contactName"
                className="pod-form-input"
                value={formData.contactName}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Contact Email *</label>
              <input
                type="email"
                name="contactEmail"
                className="pod-form-input"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                placeholder="email@example.com"
              />
            </div>

            <div className="pod-form-group">
              <label className="pod-form-label">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                className="pod-form-input"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+84 xxx xxx xxx"
              />
            </div>
          </div>
        </div>

        <div className="pod-card" style={{ marginTop: "1rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Address
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
                placeholder="Apartment, suite, etc."
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
            Partnership Settings
          </h2>

          <div className="pod-form-grid">
            <div className="pod-form-group">
              <label className="pod-form-label">Partner Type *</label>
              <select
                name="partnerType"
                className="pod-form-select"
                value={formData.partnerType}
                onChange={handleChange}
                required
              >
                {POD_ENUMS.partnerType.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {!isPhygital && (
              <div className="pod-form-group">
                <label className="pod-form-label">Partner Tier</label>
                <select
                  name="tier"
                  className="pod-form-select"
                  value={formData.tier}
                  onChange={handleChange}
                >
                  {POD_ENUMS.partnerTier.map((tier) => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>
            )}

            {!isPhygital && (
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
                  placeholder="5.00"
                />
              </div>
            )}

            <div className="pod-form-group" style={{ gridColumn: "span 2" }}>
              <label className="pod-form-label">Notes</label>
              <textarea
                name="notes"
                className="pod-form-input"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes about the partner..."
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Phygital Settings - only show when partnerType is PHYGITAL */}
        {isPhygital && (
          <div className="pod-card" style={{ marginTop: "1rem" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
              Phygital Partner Settings
            </h2>

            <div className="pod-form-grid">
              <div className="pod-form-group">
                <label className="pod-form-label">Wholesale Discount Rate (%)</label>
                <input
                  type="number"
                  name="wholesaleDiscountRate"
                  className="pod-form-input"
                  value={formData.wholesaleDiscountRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="20.00"
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Territory</label>
                <input
                  type="text"
                  name="territory"
                  className="pod-form-input"
                  value={formData.territory}
                  onChange={handleChange}
                  placeholder="e.g., Ho Chi Minh City - District 1"
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Min Markup (%)</label>
                <input
                  type="number"
                  name="minMarkupPercent"
                  className="pod-form-input"
                  value={formData.minMarkupPercent}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="10.00"
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Max Markup (%)</label>
                <input
                  type="number"
                  name="maxMarkupPercent"
                  className="pod-form-input"
                  value={formData.maxMarkupPercent}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="50.00"
                />
              </div>

              <div className="pod-form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  name="canSetOwnPrices"
                  id="canSetOwnPrices"
                  checked={formData.canSetOwnPrices}
                  onChange={handleChange}
                />
                <label htmlFor="canSetOwnPrices" className="pod-form-label" style={{ marginBottom: 0 }}>
                  Allow partner to set own retail prices
                </label>
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Security Deposit</label>
                <input
                  type="number"
                  name="securityDeposit"
                  className="pod-form-input"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  placeholder="0"
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Contract Start Date</label>
                <input
                  type="date"
                  name="contractStartDate"
                  className="pod-form-input"
                  value={formData.contractStartDate}
                  onChange={handleChange}
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Contract End Date</label>
                <input
                  type="date"
                  name="contractEndDate"
                  className="pod-form-input"
                  value={formData.contractEndDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3 style={{ margin: "1.5rem 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
              Bank Information
            </h3>

            <div className="pod-form-grid">
              <div className="pod-form-group">
                <label className="pod-form-label">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  className="pod-form-input"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g., Vietcombank"
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  className="pod-form-input"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Account number"
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Bank Branch</label>
                <input
                  type="text"
                  name="bankBranch"
                  className="pod-form-input"
                  value={formData.bankBranch}
                  onChange={handleChange}
                  placeholder="Branch name"
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <Link to={ROUTES.POD_ADMIN_PARTNERS} className="pod-btn pod-btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="pod-btn pod-btn-primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Partner"}
          </button>
        </div>
      </form>
    </div>
  );
}
