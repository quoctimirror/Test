import { useState, useEffect } from "react";
import { partnerPortalApi, POD_ENUMS } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PartnerPortalAttributions() {
  const [attributions, setAttributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAttributions();
  }, [pagination.page, filters]);

  const fetchAttributions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      const response = await partnerPortalApi.getMyAttributions(params);
      setAttributions(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching attributions:", err);
      setError("Failed to load attributions");
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
      PENDING: "pending",
      CONFIRMED: "confirmed",
      CANCELLED: "cancelled",
    };
    return classes[status] || "";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate summary stats
  const summaryStats = {
    total: attributions.length,
    pending: attributions.filter((a) => a.status === "PENDING").length,
    confirmed: attributions.filter((a) => a.status === "CONFIRMED").length,
    totalAmount: attributions
      .filter((a) => a.status === "CONFIRMED")
      .reduce((sum, a) => sum + (a.attributedAmount || 0), 0),
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">My Attributions ({pagination.totalElements})</h1>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div className="pod-card" style={{ padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>{summaryStats.total}</div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Total</div>
        </div>
        <div className="pod-card" style={{ padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#f59e0b" }}>{summaryStats.pending}</div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Pending</div>
        </div>
        <div className="pod-card" style={{ padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#10b981" }}>{summaryStats.confirmed}</div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Confirmed</div>
        </div>
        <div className="pod-card" style={{ padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#10b981" }}>
            {formatCurrency(summaryStats.totalAmount)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Attributed Value</div>
        </div>
      </div>

      {/* Filters */}
      <div className="pod-filters">
        <select
          className="pod-form-select pod-filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          {POD_ENUMS.attributionStatus.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="pod-form-input"
          value={filters.startDate}
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
          style={{ maxWidth: "180px" }}
        />
        <input
          type="date"
          className="pod-form-input"
          value={filters.endDate}
          onChange={(e) => handleFilterChange("endDate", e.target.value)}
          style={{ maxWidth: "180px" }}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading attributions...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchAttributions}>
            Retry
          </button>
        </div>
      )}

      {/* Attributions Table */}
      {!loading && !error && (
        <div className="pod-card">
          {attributions.length === 0 ? (
            <div className="pod-empty">
              <p>No attributions found</p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Attributions are created when orders are placed after QR scans
              </p>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>POD</th>
                      <th>Type</th>
                      <th>Order Amount</th>
                      <th>Attributed</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributions.map((attr) => (
                      <tr key={attr.id}>
                        <td>
                          <code style={{
                            background: "#f3f4f6",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem"
                          }}>
                            {attr.orderId?.slice(0, 12)}...
                          </code>
                        </td>
                        <td>{attr.podName || attr.podId?.slice(0, 8)}</td>
                        <td>
                          <span style={{ fontSize: "0.75rem" }}>
                            {attr.attributionType}
                          </span>
                          {attr.attributionWeight && attr.attributionWeight < 1 && (
                            <span style={{
                              fontSize: "0.625rem",
                              color: "#6b7280",
                              marginLeft: "0.25rem"
                            }}>
                              ({(attr.attributionWeight * 100).toFixed(0)}%)
                            </span>
                          )}
                        </td>
                        <td>{formatCurrency(attr.orderAmount)}</td>
                        <td style={{ color: "#10b981", fontWeight: "500" }}>
                          {formatCurrency(attr.attributedAmount)}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(attr.status)}`}>
                            {attr.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.875rem" }}>
                          {formatDate(attr.orderPlacedAt)}
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
