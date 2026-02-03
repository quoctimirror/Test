import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { partnerApi, POD_ENUMS } from "@/services/podApi";
import { ROUTES } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminPartnerDetail() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [credentialPopup, setCredentialPopup] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchPartnerDetail();
  }, [partnerId]);

  const fetchPartnerDetail = async () => {
    try {
      setLoading(true);
      const response = await partnerApi.getDetail(partnerId);
      setPartner(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching partner:", err);
      setError("Failed to load partner details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }
    try {
      const response = await partnerApi.updateStatus(partnerId, newStatus);
      const data = response.data;

      // Show credentials popup if account was just created (activation)
      if (data.generatedUsername && data.generatedPassword) {
        setCredentialPopup({
          username: data.generatedUsername,
          password: data.generatedPassword,
        });
      }

      fetchPartnerDetail();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCopyCredential = (field, text) => {
    const doCopy = () => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    };
    navigator.clipboard.writeText(text).then(doCopy).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      doCopy();
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this partner? This action cannot be undone.")) {
      return;
    }
    try {
      await partnerApi.delete(partnerId);
      navigate(ROUTES.POD_ADMIN_PARTNERS);
    } catch (err) {
      console.error("Error deleting partner:", err);
      alert("Failed to delete partner: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      PENDING: "pending",
      APPROVED: "approved",
      ACTIVE: "active",
      SUSPENDED: "suspended",
      TERMINATED: "inactive",
    };
    return classes[status] || "";
  };

  const getTierBadgeStyle = (tier) => {
    const styles = {
      BRONZE: { background: "#cd7f32", color: "#fff" },
      SILVER: { background: "#c0c0c0", color: "#333" },
      GOLD: { background: "#ffd700", color: "#333" },
      PLATINUM: { background: "#e5e4e2", color: "#333" },
    };
    return styles[tier] || {};
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="pod-page">
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error || "Partner not found"}</p>
          <Link to={ROUTES.POD_ADMIN_PARTNERS} className="pod-btn pod-btn-primary">
            Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pod-page">
      {/* Header */}
      <div className="pod-page-header">
        <div>
          <Link to={ROUTES.POD_ADMIN_PARTNERS} style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Partners
          </Link>
          <h1 className="pod-page-title" style={{ marginTop: "0.5rem" }}>
            {partner.businessName}
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>{partner.id}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {partner.status === "PENDING" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("APPROVED")}>
              Approve
            </button>
          )}
          {partner.status === "APPROVED" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("ACTIVE")}>
              Activate
            </button>
          )}
          {partner.status === "ACTIVE" && (
            <button className="pod-btn pod-btn-warning" onClick={() => handleStatusUpdate("SUSPENDED")}>
              Suspend
            </button>
          )}
          {partner.status === "SUSPENDED" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("ACTIVE")}>
              Reactivate
            </button>
          )}
          {partner.status !== "TERMINATED" && (
            <button className="pod-btn pod-btn-danger" onClick={() => handleStatusUpdate("TERMINATED")}>
              Terminate
            </button>
          )}
          <button className="pod-btn pod-btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {/* Status & Tier */}
      <div className="pod-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <span className={`status-badge ${getStatusBadgeClass(partner.status)}`}>
            {partner.status}
          </span>
          <span className="status-badge" style={getTierBadgeStyle(partner.tier)}>
            {partner.tier}
          </span>
          <span className="status-badge" style={{
            background: partner.partnerType === "PHYGITAL" ? "#dbeafe" : "#f3f4f6",
            color: partner.partnerType === "PHYGITAL" ? "#1d4ed8" : "#374151",
          }}>
            {partner.partnerType || "LOCATION"}
          </span>
          <span style={{ color: "#6b7280" }}>
            Commission Rate: <strong>{partner.commissionRate}%</strong>
          </span>
        </div>
      </div>

      {/* Statistics */}
      {(partner.totalPods !== undefined || partner.totalScans !== undefined) && (
        <div className="pod-stats-grid" style={{ marginBottom: "1rem" }}>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{partner.totalPods || 0}</div>
            <div className="pod-stat-label">Total PODs</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{partner.activePods || 0}</div>
            <div className="pod-stat-label">Active PODs</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{partner.totalScans || 0}</div>
            <div className="pod-stat-label">Total Scans</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{formatCurrency(partner.totalRevenue)}</div>
            <div className="pod-stat-label">Total Revenue</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{formatCurrency(partner.paidCommissions)}</div>
            <div className="pod-stat-label">Paid Commissions</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{formatCurrency(partner.pendingCommissions)}</div>
            <div className="pod-stat-label">Pending Commissions</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Business Information */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Business Information
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">Business Name</span>
              <span className="pod-detail-value">{partner.businessName}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Business Type</span>
              <span className="pod-detail-value">{partner.businessType}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Business License</span>
              <span className="pod-detail-value">{partner.businessLicense || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Tax ID</span>
              <span className="pod-detail-value">{partner.taxId || "-"}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Contact Information
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">Contact Name</span>
              <span className="pod-detail-value">{partner.contactName}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Email</span>
              <span className="pod-detail-value">{partner.contactEmail}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Phone</span>
              <span className="pod-detail-value">{partner.contactPhone || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Username</span>
              <span className="pod-detail-value">{partner.username || "Not created yet"}</span>
            </div>
            {partner.username && (
              <div className="pod-detail-item">
                <span className="pod-detail-label">Password</span>
                <span className="pod-detail-value">********</span>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Address
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item" style={{ gridColumn: "span 2" }}>
              <span className="pod-detail-label">Address</span>
              <span className="pod-detail-value">
                {[partner.addressLine1, partner.addressLine2].filter(Boolean).join(", ") || "-"}
              </span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">City</span>
              <span className="pod-detail-value">{partner.city || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">State/Province</span>
              <span className="pod-detail-value">{partner.state || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Postal Code</span>
              <span className="pod-detail-value">{partner.postalCode || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Country</span>
              <span className="pod-detail-value">{partner.country || "-"}</span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Timeline
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">Created At</span>
              <span className="pod-detail-value">{formatDate(partner.createdAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Updated At</span>
              <span className="pod-detail-value">{formatDate(partner.updatedAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Approved At</span>
              <span className="pod-detail-value">{formatDate(partner.approvedAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Approved By</span>
              <span className="pod-detail-value">{partner.approvedBy || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phygital Settings */}
      {partner.partnerType === "PHYGITAL" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div className="pod-card">
            <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
              Phygital Settings
            </h2>
            <div className="pod-detail-grid">
              <div className="pod-detail-item">
                <span className="pod-detail-label">Wholesale Discount Rate</span>
                <span className="pod-detail-value">{partner.wholesaleDiscountRate != null ? `${partner.wholesaleDiscountRate}%` : "-"}</span>
              </div>
              <div className="pod-detail-item">
                <span className="pod-detail-label">Territory</span>
                <span className="pod-detail-value">{partner.territory || "-"}</span>
              </div>
              <div className="pod-detail-item">
                <span className="pod-detail-label">Can Set Own Prices</span>
                <span className="pod-detail-value">{partner.canSetOwnPrices ? "Yes" : "No"}</span>
              </div>
              <div className="pod-detail-item">
                <span className="pod-detail-label">Markup Range</span>
                <span className="pod-detail-value">
                  {partner.minMarkupPercent != null || partner.maxMarkupPercent != null
                    ? `${partner.minMarkupPercent ?? 0}% - ${partner.maxMarkupPercent ?? "∞"}%`
                    : "-"}
                </span>
              </div>
              <div className="pod-detail-item">
                <span className="pod-detail-label">Contract Period</span>
                <span className="pod-detail-value">
                  {partner.contractStartDate || partner.contractEndDate
                    ? `${partner.contractStartDate || "?"} → ${partner.contractEndDate || "?"}`
                    : "-"}
                </span>
              </div>
              <div className="pod-detail-item">
                <span className="pod-detail-label">Security Deposit</span>
                <span className="pod-detail-value">{partner.securityDeposit ? formatCurrency(partner.securityDeposit) : "-"}</span>
              </div>
            </div>
          </div>

          <div className="pod-card">
            <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
              Bank Information
            </h2>
            <div className="pod-detail-grid">
              <div className="pod-detail-item">
                <span className="pod-detail-label">Bank Name</span>
                <span className="pod-detail-value">{partner.bankName || "-"}</span>
              </div>
              <div className="pod-detail-item">
                <span className="pod-detail-label">Account Number</span>
                <span className="pod-detail-value">{partner.bankAccountNumber || "-"}</span>
              </div>
              <div className="pod-detail-item">
                <span className="pod-detail-label">Branch</span>
                <span className="pod-detail-value">{partner.bankBranch || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {partner.notes && (
        <div className="pod-card" style={{ marginTop: "1rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Notes
          </h2>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{partner.notes}</p>
        </div>
      )}

      {/* Credentials Popup */}
      {credentialPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: "12px", padding: "2rem", maxWidth: "480px", width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 700 }}>
              Partner Account Created
            </h2>
            <p style={{ color: "#6b7280", margin: "0 0 1.5rem", fontSize: "0.875rem" }}>
              Please save these credentials. The password will not be shown again.
            </p>

            <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem", fontWeight: 600 }}>
                  Username
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <code style={{
                    flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px",
                    padding: "0.5rem 0.75rem", fontSize: "0.95rem", fontFamily: "monospace",
                  }}>
                    {credentialPopup.username}
                  </code>
                  <button
                    className="pod-btn pod-btn-secondary pod-btn-sm"
                    onClick={() => handleCopyCredential("username", credentialPopup.username)}
                  >
                    Copy
                  </button>
                </div>
                {copiedField === "username" && (
                  <span style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>Copied!</span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem", fontWeight: 600 }}>
                  Temporary Password
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <code style={{
                    flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px",
                    padding: "0.5rem 0.75rem", fontSize: "0.95rem", fontFamily: "monospace",
                  }}>
                    {credentialPopup.password}
                  </code>
                  <button
                    className="pod-btn pod-btn-secondary pod-btn-sm"
                    onClick={() => handleCopyCredential("password", credentialPopup.password)}
                  >
                    Copy
                  </button>
                </div>
                {copiedField === "password" && (
                  <span style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>Copied!</span>
                )}
              </div>
            </div>

            <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0 0 1.5rem" }}>
              Warning: This is the only time the password will be displayed. Make sure to copy it now.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="pod-btn pod-btn-primary"
                onClick={() => setCredentialPopup(null)}
              >
                I've saved the credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
