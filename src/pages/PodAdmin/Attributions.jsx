import { useState, useEffect } from "react";
import { attributionApi, POD_ENUMS } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminAttributions() {
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
      const response = await attributionApi.getAll(params);
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

  const handleStatusUpdate = async (attributionId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }
    try {
      await attributionApi.updateStatus(attributionId, newStatus);
      fetchAttributions();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
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

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Attributions ({pagination.totalElements})</h1>
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
                      <th>Partner</th>
                      <th>Type</th>
                      <th>Order Amount</th>
                      <th>Attributed</th>
                      <th>Status</th>
                      <th>Order Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributions.map((attr) => (
                      <tr key={attr.id}>
                        <td>
                          <code style={{ background: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                            {attr.orderId?.slice(0, 12)}...
                          </code>
                        </td>
                        <td>{attr.podName || attr.podId?.slice(0, 8)}</td>
                        <td>{attr.partnerName || attr.partnerId?.slice(0, 8)}</td>
                        <td>
                          <span style={{ fontSize: "0.75rem" }}>
                            {attr.attributionType}
                          </span>
                          {attr.attributionWeight && attr.attributionWeight < 1 && (
                            <span style={{ fontSize: "0.625rem", color: "#6b7280", marginLeft: "0.25rem" }}>
                              ({(attr.attributionWeight * 100).toFixed(0)}%)
                            </span>
                          )}
                        </td>
                        <td>{formatCurrency(attr.orderAmount)}</td>
                        <td style={{ color: "#10b981" }}>
                          {formatCurrency(attr.attributedAmount)}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(attr.status)}`}>
                            {attr.status}
                          </span>
                        </td>
                        <td>{formatDate(attr.orderPlacedAt)}</td>
                        <td>
                          {attr.status === "PENDING" && (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => handleStatusUpdate(attr.id, "CONFIRMED")}
                              >
                                Confirm
                              </button>
                              <button
                                className="pod-btn pod-btn-danger pod-btn-sm"
                                onClick={() => handleStatusUpdate(attr.id, "CANCELLED")}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
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
