import { useState, useEffect } from "react";
import { partnerPortalApi } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PartnerPortalScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    podId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchScans();
  }, [pagination.page, filters]);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      const response = await partnerPortalApi.getMyScans(params);
      setScans(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching scans:", err);
      setError("Failed to load scans");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (deviceType) => {
    const icons = {
      MOBILE: "📱",
      TABLET: "📱",
      DESKTOP: "💻",
      UNKNOWN: "❓",
    };
    return icons[deviceType] || icons.UNKNOWN;
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">QR Scans ({pagination.totalElements})</h1>
      </div>

      {/* Filters */}
      <div className="pod-filters">
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
        <button
          className="pod-btn pod-btn-secondary"
          onClick={() => {
            setFilters({ podId: "", startDate: "", endDate: "" });
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading scans...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchScans}>
            Retry
          </button>
        </div>
      )}

      {/* Scans Table */}
      {!loading && !error && (
        <div className="pod-card">
          {scans.length === 0 ? (
            <div className="pod-empty">
              <p>No scans found</p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Scans will appear here when customers scan your QR codes
              </p>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>POD</th>
                      <th>QR Code</th>
                      <th>Product</th>
                      <th>Device</th>
                      <th>Location</th>
                      <th>Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((scan) => (
                      <tr key={scan.id}>
                        <td>
                          <div style={{ fontSize: "0.875rem" }}>
                            {formatDateTime(scan.scannedAt)}
                          </div>
                        </td>
                        <td>{scan.podName || scan.podId?.slice(0, 8)}</td>
                        <td>
                          <code style={{
                            background: "#f3f4f6",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem"
                          }}>
                            {scan.shortCode}
                          </code>
                        </td>
                        <td style={{ fontSize: "0.875rem" }}>
                          {scan.productName || scan.productId?.slice(0, 8)}
                        </td>
                        <td>
                          <span title={scan.deviceType}>
                            {getDeviceIcon(scan.deviceType)}
                          </span>
                          {scan.browser && (
                            <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "0.25rem" }}>
                              {scan.browser}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {scan.city && scan.country ? (
                            `${scan.city}, ${scan.country}`
                          ) : scan.ipAddress ? (
                            scan.ipAddress
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {scan.sessionId && (
                            <code style={{
                              background: "#f3f4f6",
                              padding: "0.125rem 0.25rem",
                              borderRadius: "4px",
                              fontSize: "0.625rem"
                            }}>
                              {scan.sessionId.slice(0, 8)}...
                            </code>
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
