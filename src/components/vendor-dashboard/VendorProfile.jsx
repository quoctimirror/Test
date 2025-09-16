import { useState } from "react";

const VendorProfile = ({ vendorInfo }) => {
  const [isEditing, setIsEditing] = useState(false);

  const getVendorTypeLabel = (type) => {
    const typeMap = {
      PARTS_ONLY: "Parts Only",
      WHOLE_PIECE_ONLY: "Whole Piece Only",
      BOTH: "Both",
    };
    return typeMap[type] || type;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!vendorInfo) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-body" style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🏢</div>
          <h3>No Vendor Profile</h3>
          <p>Unable to load vendor profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Vendor Info Card */}
      <div className="vendor-card">
        <div className="vendor-card-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="vendor-card-title">Vendor Information</h3>
            <button
              className="admin-button admin-button-outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
        <div className="vendor-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            {/* Basic Information */}
            <div>
              <h4 style={{ marginBottom: "1rem", color: "#333", borderBottom: "2px solid #f0f0f0", paddingBottom: "0.5rem" }}>
                Basic Information
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Vendor Code</label>
                  <div style={{ fontSize: "16px", marginTop: "0.25rem" }}>
                    <code style={{ background: "#f8f9fa", padding: "4px 8px", borderRadius: "4px" }}>
                      {vendorInfo.code}
                    </code>
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Company Name</label>
                  <div style={{ fontSize: "16px", marginTop: "0.25rem", fontWeight: "500" }}>
                    {vendorInfo.name}
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Vendor Type</label>
                  <div style={{ fontSize: "16px", marginTop: "0.25rem" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      backgroundColor: vendorInfo.vendorType === "BOTH" ? "#e7f3ff" : 
                                     vendorInfo.vendorType === "PARTS_ONLY" ? "#fff3cd" : "#d4edda",
                      color: vendorInfo.vendorType === "BOTH" ? "#0066cc" : 
                             vendorInfo.vendorType === "PARTS_ONLY" ? "#856404" : "#155724",
                    }}>
                      {getVendorTypeLabel(vendorInfo.vendorType)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h4 style={{ marginBottom: "1rem", color: "#333", borderBottom: "2px solid #f0f0f0", paddingBottom: "0.5rem" }}>
                Location & Contact
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Country</label>
                  <div style={{ fontSize: "16px", marginTop: "0.25rem" }}>
                    {vendorInfo.country}
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Contact Person</label>
                  <div style={{ fontSize: "16px", marginTop: "0.25rem" }}>
                    {vendorInfo.contactPerson}
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Email</label>
                  <div style={{ fontSize: "16px", marginTop: "0.25rem" }}>
                    <a href={`mailto:${vendorInfo.contactEmail}`} style={{ color: "#0066cc", textDecoration: "none" }}>
                      {vendorInfo.contactEmail}
                    </a>
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Phone</label>
                  <div style={{ fontSize: "16px", marginTop: "0.25rem" }}>
                    <a href={`tel:${vendorInfo.contactPhone}`} style={{ color: "#0066cc", textDecoration: "none" }}>
                      {vendorInfo.contactPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ marginTop: "2rem" }}>
            <h4 style={{ marginBottom: "1rem", color: "#333", borderBottom: "2px solid #f0f0f0", paddingBottom: "0.5rem" }}>
              Address
            </h4>
            <div style={{ fontSize: "16px", lineHeight: "1.5", color: "#555" }}>
              {vendorInfo.address}
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="vendor-card">
        <div className="vendor-card-header">
          <h3 className="vendor-card-title">Business Information</h3>
        </div>
        <div className="vendor-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            <div>
              <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Payment Terms</label>
              <div style={{ fontSize: "16px", marginTop: "0.5rem", padding: "1rem", background: "#f8f9fa", borderRadius: "8px" }}>
                {vendorInfo.paymentTerms || "Not specified"}
              </div>
            </div>
            <div>
              <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Average Product Cost</label>
              <div style={{ fontSize: "20px", marginTop: "0.5rem", fontWeight: "600", color: "#28a745" }}>
                {formatCurrency(vendorInfo.avgProductCost)}
              </div>
            </div>
            <div>
              <label style={{ fontWeight: "500", color: "#666", fontSize: "14px" }}>Production Lead Time</label>
              <div style={{ fontSize: "20px", marginTop: "0.5rem", fontWeight: "600", color: "#0066cc" }}>
                {vendorInfo.productionLeadTimeDays ? `${vendorInfo.productionLeadTimeDays} days` : "Not specified"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="vendor-card">
        <div className="vendor-card-header">
          <h3 className="vendor-card-title">Account Actions</h3>
        </div>
        <div className="vendor-card-body">
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button className="admin-button admin-button-primary">
              Update Profile
            </button>
            <button className="admin-button admin-button-outline">
              Change Password
            </button>
            <button className="admin-button admin-button-outline">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;