import { useState, useEffect } from "react";
import { partnerPortalApi } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PartnerPortalUserAttributions() {
  const [attributions, setAttributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });

  useEffect(() => {
    fetchAttributions();
  }, [pagination.page]);

  const fetchAttributions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
      };
      const response = await partnerPortalApi.getMyUserAttributions(params);
      setAttributions(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching user attributions:", err);
      setError("Failed to load user attributions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      ACTIVE: "confirmed",
      EXPIRED: "cancelled",
    };
    return classes[status] || "";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Calculate summary stats
  const summaryStats = {
    total: pagination.totalElements,
    active: attributions.filter((a) => a.status === "ACTIVE").length,
    expired: attributions.filter((a) => a.status === "EXPIRED").length,
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">My User Attributions ({pagination.totalElements})</h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
          Users currently linked to your PODs (30-day attribution window)
        </p>
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
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#10b981" }}>{summaryStats.active}</div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Active</div>
        </div>
        <div className="pod-card" style={{ padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#6b7280" }}>{summaryStats.expired}</div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Expired</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading user attributions...</p>
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

      {/* Table */}
      {!loading && !error && (
        <div className="pod-card">
          {attributions.length === 0 ? (
            <div className="pod-empty">
              <p>No user attributions found</p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                User attributions are created when users log in after scanning your POD QR codes
              </p>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>POD ID</th>
                      <th>Product</th>
                      <th>First Scan</th>
                      <th>Expires</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributions.map((attr) => (
                      <tr key={attr.id}>
                        <td style={{ fontWeight: "500" }}>{attr.userId}</td>
                        <td>{attr.podId}</td>
                        <td>{attr.productId || "-"}</td>
                        <td style={{ fontSize: "0.875rem" }}>{formatDate(attr.firstScanAt)}</td>
                        <td style={{
                          fontSize: "0.875rem",
                          color: isExpired(attr.expiresAt) ? "#ef4444" : "#10b981"
                        }}>
                          {formatDate(attr.expiresAt)}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(attr.status)}`}>
                            {attr.status}
                          </span>
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
