import { useState, useEffect } from "react";
import { partnerPortalApi } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PartnerPortalDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await partnerPortalApi.getDashboard();
      setDashboard(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pod-page">
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Partner Dashboard</h1>
      </div>

      {/* Partner Info */}
      {dashboard?.partner && (
        <div className="pod-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#4f8cff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {dashboard.partner.businessName?.charAt(0) || "P"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                {dashboard.partner.businessName}
              </h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
                {dashboard.partner.contactEmail}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <span
                  className={`status-badge ${
                    dashboard.partner.status === "ACTIVE" ? "active" : "inactive"
                  }`}
                >
                  {dashboard.partner.status}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  Tier: {dashboard.partner.tier}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="pod-stats-grid">
        <div className="pod-stat-card">
          <div className="stat-icon" style={{ background: "#eff6ff" }}>
            <span>📦</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(dashboard?.totalPods)}</div>
            <div className="stat-label">Active PODs</div>
          </div>
        </div>

        <div className="pod-stat-card">
          <div className="stat-icon" style={{ background: "#f0fdf4" }}>
            <span>📱</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(dashboard?.totalQrCodes)}</div>
            <div className="stat-label">QR Codes</div>
          </div>
        </div>

        <div className="pod-stat-card">
          <div className="stat-icon" style={{ background: "#fefce8" }}>
            <span>👁</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(dashboard?.totalScans)}</div>
            <div className="stat-label">Total Scans</div>
          </div>
        </div>

      </div>

      {/* Commission Summary */}
      <div className="pod-card" style={{ marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Commission Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Pending</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#f59e0b" }}>
              {formatCurrency(dashboard?.pendingCommission)}
            </div>
          </div>
          <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Approved</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#3b82f6" }}>
              {formatCurrency(dashboard?.approvedCommission)}
            </div>
          </div>
          <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Paid</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#10b981" }}>
              {formatCurrency(dashboard?.paidCommission)}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing PODs */}
      {dashboard?.topPods && dashboard.topPods.length > 0 && (
        <div className="pod-card" style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Top Performing PODs</h3>
          <div className="pod-table-container">
            <table className="pod-table">
              <thead>
                <tr>
                  <th>POD Name</th>
                  <th>Location</th>
                  <th>Scans</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topPods.map((pod, index) => (
                  <tr key={pod.podId || index}>
                    <td>{pod.podName}</td>
                    <td style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {pod.location}
                    </td>
                    <td>{formatNumber(pod.totalScans)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
