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
  });

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
      await partnerApi.updateStatus(partnerId, newStatus);
      fetchPartners();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
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
          <option value="">All Types</option>
          {POD_ENUMS.businessType.map((type) => (
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
                      <th>Type</th>
                      <th>Tier</th>
                      <th>Status</th>
                      <th>Commission %</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner.id}>
                        <td>
                          <Link
                            to={getPodPartnerDetailRoute(partner.id)}
                            style={{ color: "#4f8cff", textDecoration: "none" }}
                          >
                            {partner.businessName}
                          </Link>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {partner.id}
                          </div>
                        </td>
                        <td>
                          <div>{partner.contactName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {partner.contactEmail}
                          </div>
                        </td>
                        <td>{partner.businessType}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={getTierBadgeStyle(partner.tier)}
                          >
                            {partner.tier}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(partner.status)}`}
                          >
                            {partner.status}
                          </span>
                        </td>
                        <td>{partner.commissionRate}%</td>
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
                    ))}
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
    </div>
  );
}
