import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { podApi_pods, qrCodeApi } from "@/services/podApi";
import { ROUTES, getPodPartnerDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminPodDetail() {
  const { podId } = useParams();
  const navigate = useNavigate();
  const [pod, setPod] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPodDetail();
    fetchQrCodes();
  }, [podId]);

  const fetchPodDetail = async () => {
    try {
      setLoading(true);
      const response = await podApi_pods.getDetail(podId);
      setPod(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching POD:", err);
      setError("Failed to load POD details");
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCodes = async () => {
    try {
      const response = await qrCodeApi.getByPodId(podId);
      setQrCodes(response.data.content || response.data || []);
    } catch (err) {
      console.error("Error fetching QR codes:", err);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }
    try {
      await podApi_pods.updateStatus(podId, newStatus);
      fetchPodDetail();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this POD? This action cannot be undone.")) {
      return;
    }
    try {
      await podApi_pods.delete(podId);
      navigate(ROUTES.POD_ADMIN_PODS);
    } catch (err) {
      console.error("Error deleting POD:", err);
      alert("Failed to delete POD: " + (err.response?.data?.message || err.message));
    }
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

  const getQrStatusBadgeClass = (status) => {
    const classes = {
      ACTIVE: "active",
      INACTIVE: "inactive",
      EXPIRED: "expired",
    };
    return classes[status] || "";
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
          <p>Loading POD details...</p>
        </div>
      </div>
    );
  }

  if (error || !pod) {
    return (
      <div className="pod-page">
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error || "POD not found"}</p>
          <Link to={ROUTES.POD_ADMIN_PODS} className="pod-btn pod-btn-primary">
            Back to PODs
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
          <Link to={ROUTES.POD_ADMIN_PODS} style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to PODs
          </Link>
          <h1 className="pod-page-title" style={{ marginTop: "0.5rem" }}>
            {pod.name}
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>{pod.id}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {pod.status === "DRAFT" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("ACTIVE")}>
              Activate
            </button>
          )}
          {pod.status === "ACTIVE" && (
            <>
              <button className="pod-btn pod-btn-warning" onClick={() => handleStatusUpdate("MAINTENANCE")}>
                Maintenance
              </button>
              <button className="pod-btn pod-btn-danger" onClick={() => handleStatusUpdate("INACTIVE")}>
                Deactivate
              </button>
            </>
          )}
          {pod.status === "MAINTENANCE" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("ACTIVE")}>
              Back to Active
            </button>
          )}
          {pod.status === "INACTIVE" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("ACTIVE")}>
              Reactivate
            </button>
          )}
          <button className="pod-btn pod-btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="pod-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span className={`status-badge ${getStatusBadgeClass(pod.status)}`}>
            {pod.status}
          </span>
          <span style={{ color: "#6b7280" }}>
            Display Capacity: <strong>{pod.displayCapacity} products</strong>
          </span>
        </div>
      </div>

      {/* Statistics */}
      {(pod.totalScans !== undefined || pod.totalQrCodes !== undefined) && (
        <div className="pod-stats-grid" style={{ marginBottom: "1rem" }}>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.totalQrCodes || 0}</div>
            <div className="pod-stat-label">QR Codes</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.activeQrCodes || 0}</div>
            <div className="pod-stat-label">Active QR Codes</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.totalScans || 0}</div>
            <div className="pod-stat-label">Total Scans</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.uniqueScans || 0}</div>
            <div className="pod-stat-label">Unique Scans</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.totalAttributions || 0}</div>
            <div className="pod-stat-label">Attributions</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.productsDisplayed || 0}</div>
            <div className="pod-stat-label">Products</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* POD Information */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            POD Information
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">POD Name</span>
              <span className="pod-detail-value">{pod.name}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Location Name</span>
              <span className="pod-detail-value">{pod.locationName}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Partner</span>
              <span className="pod-detail-value">
                {pod.partnerId && (
                  <Link to={getPodPartnerDetailRoute(pod.partnerId)} style={{ color: "#4f8cff" }}>
                    {pod.partnerBusinessName || pod.partnerId}
                  </Link>
                )}
              </span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Display Capacity</span>
              <span className="pod-detail-value">{pod.displayCapacity} products</span>
            </div>
          </div>
        </div>

        {/* Location Address */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Location Address
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item" style={{ gridColumn: "span 2" }}>
              <span className="pod-detail-label">Address</span>
              <span className="pod-detail-value">
                {[pod.addressLine1, pod.addressLine2].filter(Boolean).join(", ") || "-"}
              </span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">City</span>
              <span className="pod-detail-value">{pod.city || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">State/Province</span>
              <span className="pod-detail-value">{pod.state || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Postal Code</span>
              <span className="pod-detail-value">{pod.postalCode || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Country</span>
              <span className="pod-detail-value">{pod.country || "-"}</span>
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
              <span className="pod-detail-value">{formatDate(pod.createdAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Updated At</span>
              <span className="pod-detail-value">{formatDate(pod.updatedAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Activated At</span>
              <span className="pod-detail-value">{formatDate(pod.activatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Notes
          </h2>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", color: pod.notes ? "#111827" : "#9ca3af" }}>
            {pod.notes || "No notes"}
          </p>
        </div>
      </div>

      {/* QR Codes Section */}
      <div className="pod-card" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
            QR Codes ({qrCodes.length})
          </h2>
          <Link to={ROUTES.POD_ADMIN_QRCODES} className="pod-btn pod-btn-primary pod-btn-sm">
            Manage QR Codes
          </Link>
        </div>

        {qrCodes.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No QR codes generated for this POD yet.</p>
        ) : (
          <div className="pod-table-container">
            <table className="pod-table">
              <thead>
                <tr>
                  <th>Short Code</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Scans</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.slice(0, 10).map((qr) => (
                  <tr key={qr.id}>
                    <td>
                      <code style={{ background: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                        {qr.shortCode}
                      </code>
                    </td>
                    <td>{qr.productName || qr.productId}</td>
                    <td>
                      <span className={`status-badge ${getQrStatusBadgeClass(qr.status)}`}>
                        {qr.status}
                      </span>
                    </td>
                    <td>{qr.scanCount || 0}</td>
                    <td>{formatDate(qr.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {qrCodes.length > 10 && (
              <p style={{ textAlign: "center", color: "#6b7280", marginTop: "1rem" }}>
                Showing 10 of {qrCodes.length} QR codes.{" "}
                <Link to={ROUTES.POD_ADMIN_QRCODES} style={{ color: "#4f8cff" }}>
                  View all
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
