import { useState, useEffect } from "react";
import { adminDashboardApi } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardApi.getDashboard();
      setDashboard(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading dashboard...</p>
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
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
        <h1 className="pod-page-title">POD Dashboard</h1>
        <button className="pod-btn pod-btn-secondary" onClick={fetchDashboard}>
          Refresh
        </button>
      </div>

      {/* Partner Stats */}
      <h3 style={{ marginBottom: "1rem", color: "#6b7280" }}>Partners</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Partners</div>
          <div className="stat-value">{formatNumber(dashboard?.totalPartners)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Partners</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {formatNumber(dashboard?.activePartners)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Partners</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>
            {formatNumber(dashboard?.pendingPartners)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Suspended Partners</div>
          <div className="stat-value" style={{ color: "#ef4444" }}>
            {formatNumber(dashboard?.suspendedPartners)}
          </div>
        </div>
      </div>

      {/* POD Stats */}
      <h3 style={{ marginBottom: "1rem", color: "#6b7280" }}>PODs</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total PODs</div>
          <div className="stat-value">{formatNumber(dashboard?.totalPods)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active PODs</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {formatNumber(dashboard?.activePods)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total QR Codes</div>
          <div className="stat-value">{formatNumber(dashboard?.totalQrCodes)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active QR Codes</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {formatNumber(dashboard?.activeQrCodes)}
          </div>
        </div>
      </div>

      {/* Scan Stats */}
      <h3 style={{ marginBottom: "1rem", color: "#6b7280" }}>Scans</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Scans</div>
          <div className="stat-value">{formatNumber(dashboard?.totalScans)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Scans Today</div>
          <div className="stat-value">{formatNumber(dashboard?.scansToday)}</div>
          {dashboard?.scanGrowthPercent !== undefined && (
            <div className={`stat-change ${dashboard.scanGrowthPercent >= 0 ? "positive" : "negative"}`}>
              {dashboard.scanGrowthPercent >= 0 ? "+" : ""}
              {dashboard.scanGrowthPercent?.toFixed(1)}% vs last month
            </div>
          )}
        </div>
      </div>

      {/* Revenue Stats */}
      <h3 style={{ marginBottom: "1rem", color: "#6b7280" }}>Revenue & Commission</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pending Commission</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>
            {formatCurrency(dashboard?.pendingCommissionAmount)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid Commission</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {formatCurrency(dashboard?.paidCommissionAmount)}
          </div>
        </div>
      </div>

      {/* Top Partners */}
      {dashboard?.topPartners?.length > 0 && (
        <div className="pod-card">
          <div className="pod-card-header">
            <h3 className="pod-card-title">Top Partners</h3>
          </div>
          <div className="pod-table-container">
            <table className="pod-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Tier</th>
                  <th>PODs</th>
                  <th>Scans</th>
                  <th>Revenue</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topPartners.slice(0, 5).map((partner) => (
                  <tr key={partner.partnerId}>
                    <td>{partner.businessName}</td>
                    <td>
                      <span className={`status-badge ${partner.tier?.toLowerCase()}`}>
                        {partner.tier}
                      </span>
                    </td>
                    <td>{partner.podCount}</td>
                    <td>{formatNumber(partner.scanCount)}</td>
                    <td>{formatCurrency(partner.totalRevenue)}</td>
                    <td>{formatCurrency(partner.commissionEarned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top PODs */}
      {dashboard?.topPods?.length > 0 && (
        <div className="pod-card">
          <div className="pod-card-header">
            <h3 className="pod-card-title">Top PODs</h3>
          </div>
          <div className="pod-table-container">
            <table className="pod-table">
              <thead>
                <tr>
                  <th>POD Name</th>
                  <th>Partner</th>
                  <th>City</th>
                  <th>Scans</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topPods.slice(0, 5).map((pod) => (
                  <tr key={pod.podId}>
                    <td>{pod.podName}</td>
                    <td>{pod.partnerName}</td>
                    <td>{pod.city}</td>
                    <td>{formatNumber(pod.scanCount)}</td>
                    <td>{formatCurrency(pod.revenue)}</td>
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
