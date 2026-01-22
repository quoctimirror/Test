import { useState, useEffect } from "react";
import { partnerPortalApi, POD_ENUMS } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PartnerPortalPods() {
  const [pods, setPods] = useState([]);
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
  });

  useEffect(() => {
    fetchPods();
  }, [pagination.page, filters]);

  const fetchPods = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      const response = await partnerPortalApi.getMyPods(params);
      setPods(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching PODs:", err);
      setError("Failed to load your PODs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      DRAFT: "draft",
      ACTIVE: "active",
      MAINTENANCE: "maintenance",
      INACTIVE: "inactive",
    };
    return classes[status] || "";
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">My PODs ({pagination.totalElements})</h1>
      </div>

      {/* Filters */}
      <div className="pod-filters">
        <input
          type="text"
          className="pod-form-input pod-search"
          placeholder="Search by name, location..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
        />
        <select
          className="pod-form-select pod-filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          {POD_ENUMS.podStatus.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading your PODs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchPods}>
            Retry
          </button>
        </div>
      )}

      {/* PODs Grid */}
      {!loading && !error && (
        <>
          {pods.length === 0 ? (
            <div className="pod-card">
              <div className="pod-empty">
                <p>No PODs found</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Contact admin to set up your first Point of Display
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {pods.map((pod) => (
                <div key={pod.id} className="pod-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.125rem" }}>{pod.name}</h3>
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                        {pod.id}
                      </p>
                    </div>
                    <span className={`status-badge ${getStatusBadgeClass(pod.status)}`}>
                      {pod.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "1rem" }}>
                    <div>📍 {pod.locationName}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {pod.city}, {pod.country}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    background: "#f9fafb",
                    borderRadius: "8px"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                        {formatNumber(pod.qrCodeCount)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>QR Codes</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                        {formatNumber(pod.totalScans)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Scans</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#10b981" }}>
                        {formatNumber(pod.totalAttributions)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Orders</div>
                    </div>
                  </div>

                  {pod.attributedAmount > 0 && (
                    <div style={{
                      marginTop: "0.75rem",
                      padding: "0.5rem",
                      background: "#ecfdf5",
                      borderRadius: "6px",
                      textAlign: "center"
                    }}>
                      <span style={{ fontSize: "0.75rem", color: "#059669" }}>
                        Total Revenue: {formatCurrency(pod.attributedAmount)}
                      </span>
                    </div>
                  )}

                  <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#9ca3af" }}>
                    Capacity: {pod.displayCapacity} products
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pod-pagination" style={{ marginTop: "1.5rem" }}>
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
  );
}
