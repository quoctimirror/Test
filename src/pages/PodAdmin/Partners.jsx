import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { partnerApi, POD_ENUMS } from "@/services/podApi";
import { ROUTES, getPodPartnerDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminPartners() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    tier: "",
    businessType: "",
    partnerType: "",
  });
  const [credentialPopup, setCredentialPopup] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, [pagination.page, filters]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      const response = await partnerApi.getAll(params);
      setPartners(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching partners:", err);
      setError("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleStatusUpdate = async (partnerId, newStatus) => {
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

      fetchPartners();
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

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Partners ({pagination.totalElements})</h1>
        <Link to={ROUTES.POD_ADMIN_PARTNER_CREATE} className="pod-btn pod-btn-primary">
          + Add Partner
        </Link>
      </div>

      {/* Filters */}
      <div className="pod-filters">
        <input
          type="text"
          className="pod-form-input pod-search"
          placeholder="Search by name, email..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
        />
        <select
          className="pod-form-select pod-filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          {POD_ENUMS.partnerStatus.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          className="pod-form-select pod-filter-select"
          value={filters.tier}
          onChange={(e) => handleFilterChange("tier", e.target.value)}
        >
          <option value="">All Tiers</option>
          {POD_ENUMS.partnerTier.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
        <select
          className="pod-form-select pod-filter-select"
          value={filters.businessType}
          onChange={(e) => handleFilterChange("businessType", e.target.value)}
        >
          <option value="">All Business Types</option>
          {POD_ENUMS.businessType.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          className="pod-form-select pod-filter-select"
          value={filters.partnerType}
          onChange={(e) => handleFilterChange("partnerType", e.target.value)}
        >
          <option value="">All Partner Types</option>
          {POD_ENUMS.partnerType.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading partners...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchPartners}>
            Retry
          </button>
        </div>
      )}

      {/* Partners Table */}
      {!loading && !error && (
        <div className="pod-card">
          {partners.length === 0 ? (
            <div className="pod-empty">
              <p>No partners found</p>
              <Link to={ROUTES.POD_ADMIN_PARTNER_CREATE} className="pod-btn pod-btn-primary">
                Add First Partner
              </Link>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>Business Name</th>
                      <th>Contact</th>
                      <th>Partner Type</th>
                      <th>Model</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => {
                      const isPhygital = partner.partnerType === "PHYGITAL";
                      return (
                      <tr key={partner.id}>
                        <td>
                          <Link
                            to={getPodPartnerDetailRoute(partner.id)}
                            style={{ color: "#4f8cff", textDecoration: "none" }}
                          >
                            {partner.businessName}
                          </Link>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {partner.businessType} &middot; {partner.id}
                          </div>
                        </td>
                        <td>
                          <div>{partner.contactName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {partner.contactEmail}
                          </div>
                        </td>
                        <td>
                          <span className="status-badge" style={{
                            background: isPhygital ? "#ede9fe" : "#e0f2fe",
                            color: isPhygital ? "#7c3aed" : "#0369a1",
                          }}>
                            {partner.partnerType || "LOCATION"}
                          </span>
                        </td>
                        <td>
                          {isPhygital ? (
                            <div>
                              <div style={{ fontWeight: "500" }}>Discount: {partner.wholesaleDiscountRate ?? 0}%</div>
                              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                {partner.territory || "-"}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="status-badge" style={getTierBadgeStyle(partner.tier)}>
                                {partner.tier}
                              </span>
                              <span style={{ marginLeft: "0.5rem" }}>{partner.commissionRate}%</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(partner.status)}`}
                          >
                            {partner.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="pod-btn pod-btn-secondary pod-btn-sm"
                              onClick={() => navigate(getPodPartnerDetailRoute(partner.id))}
                            >
                              View
                            </button>
                            {partner.status === "PENDING" && (
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => handleStatusUpdate(partner.id, "APPROVED")}
                              >
                                Approve
                              </button>
                            )}
                            {partner.status === "APPROVED" && (
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => handleStatusUpdate(partner.id, "ACTIVE")}
                              >
                                Activate
                              </button>
                            )}
                            {partner.status === "ACTIVE" && (
                              <button
                                className="pod-btn pod-btn-danger pod-btn-sm"
                                onClick={() => handleStatusUpdate(partner.id, "SUSPENDED")}
                              >
                                Suspend
                              </button>
                            )}
                            {partner.status === "SUSPENDED" && (
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => handleStatusUpdate(partner.id, "ACTIVE")}
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pod-pagination">
                  <button
                    className="pod-pagination-btn"
                    disabled={pagination.page === 0}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span style={{ margin: "0 1rem" }}>
                    Page {pagination.page + 1} of {pagination.totalPages}
                  </span>
                  <button
                    className="pod-pagination-btn"
                    disabled={pagination.page >= pagination.totalPages - 1}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
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
