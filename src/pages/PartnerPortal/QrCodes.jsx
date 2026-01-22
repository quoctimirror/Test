import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { partnerPortalApi, POD_ENUMS } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PartnerPortalQrCodes() {
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
      const response = await partnerPortalApi.getMyQrCodes(params);
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
    const size = 300; // Higher resolution for download
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Create a temporary QR code SVG
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"></svg>`;
    document.body.appendChild(tempDiv);

    // Use qrcode library to generate
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvas, fullUrl, { width: size, margin: 2, errorCorrectionLevel: "H" }, (error) => {
        if (error) {
          console.error("Error generating QR:", error);
          return;
        }
        // Download
        const link = document.createElement("a");
        link.download = `qr-${shortCode}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });

    document.body.removeChild(tempDiv);
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">My QR Codes ({pagination.totalElements})</h1>
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

      {/* QR Codes Grid */}
      {!loading && !error && (
        <>
          {qrCodes.length === 0 ? (
            <div className="pod-card">
              <div className="pod-empty">
                <p>No QR codes found</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  QR codes are generated when products are added to your PODs
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {qrCodes.map((qr) => (
                <div key={qr.id} className="pod-card" style={{ textAlign: "center" }}>
                  {/* QR Image - Generated from URL */}
                  <div style={{ marginBottom: "1rem" }}>
                    {qr.fullUrl ? (
                      <QRCodeSVG
                        value={qr.fullUrl}
                        size={120}
                        level="H"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          padding: "8px",
                          background: "#fff",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          background: "#f3f4f6",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                        }}
                      >
                        <span style={{ fontSize: "2rem" }}>📱</span>
                      </div>
                    )}
                  </div>

                  {/* Short Code */}
                  <div style={{ marginBottom: "0.5rem" }}>
                    <code style={{
                      background: "#f3f4f6",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      fontSize: "1.125rem",
                      fontWeight: "600"
                    }}>
                      {qr.shortCode}
                    </code>
                  </div>

                  {/* Status */}
                  <span className={`status-badge ${getStatusBadgeClass(qr.status)}`}>
                    {qr.status}
                  </span>

                  {/* Info */}
                  <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#4b5563" }}>
                    <div>POD: {qr.podName || qr.podId}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      Product: {qr.productName || qr.productId}
                    </div>
                  </div>

                  {/* Scan Count */}
                  <div style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "#f9fafb",
                    borderRadius: "8px"
                  }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>
                      {formatNumber(qr.scanCount)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Total Scans</div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                    {qr.fullUrl && (
                      <>
                        <a
                          href={qr.fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pod-btn pod-btn-secondary pod-btn-sm"
                        >
                          Test Link
                        </a>
                        <button
                          className="pod-btn pod-btn-primary pod-btn-sm"
                          onClick={() => handleDownloadQr(qr.shortCode, qr.fullUrl)}
                        >
                          Download
                        </button>
                      </>
                    )}
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
