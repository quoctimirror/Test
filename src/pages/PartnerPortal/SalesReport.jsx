import { useState } from "react";
import { phygitalPartnerApi } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function SalesReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState("");

  const fetchReport = async (start, end) => {
    const s = start || startDate;
    const e = end || endDate;
    if (!s || !e) {
      setDateError("Please select both start and end dates.");
      return;
    }
    try {
      setDateError("");
      setLoading(true);
      setError(null);
      const response = await phygitalPartnerApi.getSalesReport(s, e);
      setReport(response.data);
    } catch (err) {
      console.error("Error fetching sales report:", err);
      setError("Failed to load sales report");
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

  // Quick presets - set dates AND auto-fetch
  const setPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const s = start.toISOString().split("T")[0];
    const e = end.toISOString().split("T")[0];
    setStartDate(s);
    setEndDate(e);
    fetchReport(s, e);
  };

  const setMonthPreset = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const s = start.toISOString().split("T")[0];
    const e = now.toISOString().split("T")[0];
    setStartDate(s);
    setEndDate(e);
    fetchReport(s, e);
  };

  const setLastMonthPreset = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    const s = start.toISOString().split("T")[0];
    const e = end.toISOString().split("T")[0];
    setStartDate(s);
    setEndDate(e);
    fetchReport(s, e);
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Sales Report</h1>
      </div>

      {/* Date Selection */}
      <div className="pod-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="pod-form-group" style={{ margin: 0 }}>
            <label className="pod-form-label">Start Date</label>
            <input
              type="date"
              className="pod-form-input"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setDateError(""); }}
            />
          </div>
          <div className="pod-form-group" style={{ margin: 0 }}>
            <label className="pod-form-label">End Date</label>
            <input
              type="date"
              className="pod-form-input"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setDateError(""); }}
            />
          </div>
          <button className="pod-btn pod-btn-primary" onClick={() => fetchReport()} disabled={loading}>
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
        {dateError && (
          <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0.5rem 0 0" }}>{dateError}</p>
        )}

        {/* Quick Presets */}
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.875rem", color: "#6b7280", alignSelf: "center" }}>Quick:</span>
          <button className="pod-btn pod-btn-secondary pod-btn-sm" onClick={() => setPreset(7)}>Last 7 days</button>
          <button className="pod-btn pod-btn-secondary pod-btn-sm" onClick={() => setPreset(30)}>Last 30 days</button>
          <button className="pod-btn pod-btn-secondary pod-btn-sm" onClick={setMonthPreset}>This month</button>
          <button className="pod-btn pod-btn-secondary pod-btn-sm" onClick={setLastMonthPreset}>Last month</button>
          <button className="pod-btn pod-btn-secondary pod-btn-sm" onClick={() => setPreset(90)}>Last 90 days</button>
        </div>
      </div>

      {error && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={() => fetchReport()}>Retry</button>
        </div>
      )}

      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Generating report...</p>
        </div>
      )}

      {report && !loading && (
        <>
          {/* Summary Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Sales</div>
              <div className="stat-value">{formatNumber(report.totalSales)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value" style={{ color: "#3b82f6" }}>
                {formatCurrency(report.totalRevenue)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Profit</div>
              <div className="stat-value" style={{ color: "#10b981" }}>
                {formatCurrency(report.totalProfit)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Profit Margin</div>
              <div className="stat-value">
                {report.avgMargin != null ? `${report.avgMargin.toFixed(1)}%` : "-"}
              </div>
            </div>
          </div>

          {/* Report Period */}
          {(report.startDate || report.endDate) && (
            <div className="pod-card" style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", gap: "2rem", color: "#6b7280", fontSize: "0.875rem" }}>
                <span>Period: {report.startDate} to {report.endDate}</span>
              </div>
            </div>
          )}
        </>
      )}

      {!report && !loading && !error && (
        <div className="pod-card">
          <div className="pod-empty">
            <p>Select a date range and click "Generate Report" to view sales data</p>
          </div>
        </div>
      )}
    </div>
  );
}
