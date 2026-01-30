import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { qrCodeApi, POD_ENUMS } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

const getQrScanUrl = (shortCode) => {
  if (!shortCode) return null;
  return `${window.location.origin}/q/${shortCode}`;
};

export default function PodAdminQrCodes() {
  const [qrCodes, setQrCodes] = useState([]);
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
    fetchQrCodes();
  }, [pagination.page, filters]);

  const fetchQrCodes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      const response = await qrCodeApi.getAll(params);
      setQrCodes(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching QR codes:", err);
      setError("Failed to load QR codes");
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
      ACTIVE: "active",
      INACTIVE: "inactive",
      EXPIRED: "inactive",
    };
    return classes[status] || "";
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  // Download QR code as PNG
  const handleDownloadQr = (shortCode, fullUrl) => {
    const canvas = document.createElement("canvas");
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvas, fullUrl, { width: size, margin: 2, errorCorrectionLevel: "H" }, (error) => {
        if (error) {
          console.error("Error generating QR:", error);
          return;
        }
        const link = document.createElement("a");
        link.download = `qr-${shortCode}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">QR Codes ({pagination.totalElements})</h1>
      </div>

      {/* Filters */}
      <div className="pod-filters">
        <input
          type="text"
          className="pod-form-input pod-search"
          placeholder="Search by short code, POD..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
        />
        <select
          className="pod-form-select pod-filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          {POD_ENUMS.qrCodeStatus.map((status) => (
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
          <p>Loading QR codes...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchQrCodes}>
            Retry
          </button>
        </div>
      )}

      {/* QR Codes Table */}
      {!loading && !error && (
        <div className="pod-card">
          {qrCodes.length === 0 ? (
            <div className="pod-empty">
              <p>No QR codes found</p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                QR codes are generated when you add products to a POD
              </p>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>QR Code</th>
                      <th>Short Code</th>
                      <th>POD</th>
                      <th>Product</th>
                      <th>Status</th>
                      <th>Scans</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.map((qr) => (
                      <tr key={qr.id}>
                        <td>
                          {qr.shortCode ? (
                            <QRCodeSVG
                              value={getQrScanUrl(qr.shortCode)}
                              size={48}
                              level="H"
                              style={{ borderRadius: "4px" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                background: "#e5e7eb",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                color: "#6b7280",
                              }}
                            >
                              N/A
                            </div>
                          )}
                        </td>
                        <td>
                          <code style={{ background: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                            {qr.shortCode}
                          </code>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                            {qr.id}
                          </div>
                        </td>
                        <td>{qr.podName || qr.podId}</td>
                        <td>{qr.productName || qr.productId}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(qr.status)}`}>
                            {qr.status}
                          </span>
                        </td>
                        <td>{formatNumber(qr.scanCount)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {qr.shortCode && (
                              <>
                                <a
                                  href={getQrScanUrl(qr.shortCode)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pod-btn pod-btn-secondary pod-btn-sm"
                                >
                                  Test
                                </a>
                                <button
                                  className="pod-btn pod-btn-primary pod-btn-sm"
                                  onClick={() => handleDownloadQr(qr.shortCode, getQrScanUrl(qr.shortCode))}
                                >
                                  Download
                                </button>
                              </>
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
