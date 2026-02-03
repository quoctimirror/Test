import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { phygitalPartnerApi, phygitalInventoryApi } from "@/services/podApi";
import { ROUTES } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PhygitalDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await phygitalPartnerApi.getDashboard();
      setDashboard(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching phygital dashboard:", err);
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
    if (value === null || value === undefined) return "-";
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading phygital dashboard...</p>
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
        <h1 className="pod-page-title">Phygital Dashboard</h1>
        <button className="pod-btn pod-btn-secondary" onClick={fetchDashboard}>
          Refresh
        </button>
      </div>

      {/* Inventory Stats */}
      <h3 style={{ marginBottom: "1rem", color: "#6b7280" }}>Inventory</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{formatNumber(dashboard?.totalInventoryItems)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Inventory Value</div>
          <div className="stat-value" style={{ color: "#3b82f6" }}>
            {formatCurrency(dashboard?.totalInventoryValue)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value" style={{ color: dashboard?.lowStockCount > 0 ? "#ef4444" : "#10b981" }}>
            {formatNumber(dashboard?.lowStockCount)}
          </div>
        </div>
      </div>

      {/* This Month Sales */}
      <h3 style={{ marginBottom: "1rem", color: "#6b7280" }}>This Month Sales</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{formatNumber(dashboard?.salesCountThisMonth)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {formatCurrency(dashboard?.revenueThisMonth)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Profit</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {formatCurrency(dashboard?.profitThisMonth)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Margin</div>
          <div className="stat-value">
            {dashboard?.avgMarginThisMonth != null ? `${dashboard.avgMarginThisMonth.toFixed(1)}%` : "-"}
          </div>
        </div>
      </div>

      {/* vs Last Month */}
      <h3 style={{ marginBottom: "1rem", color: "#6b7280" }}>vs Last Month</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Revenue Growth</div>
          <div className="stat-value" style={{ color: (dashboard?.revenueGrowthPercent || 0) >= 0 ? "#10b981" : "#ef4444" }}>
            {formatPercent(dashboard?.revenueGrowthPercent)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Profit Growth</div>
          <div className="stat-value" style={{ color: (dashboard?.profitGrowthPercent || 0) >= 0 ? "#10b981" : "#ef4444" }}>
            {formatPercent(dashboard?.profitGrowthPercent)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Month Revenue</div>
          <div className="stat-value">{formatCurrency(dashboard?.revenueLastMonth)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Month Profit</div>
          <div className="stat-value">{formatCurrency(dashboard?.profitLastMonth)}</div>
        </div>
      </div>

      {/* Wholesale Orders */}
      <h3 style={{ marginBottom: "1rem", color: "#6b7280" }}>Wholesale Orders</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>
            {formatNumber(dashboard?.pendingWholesaleOrders)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Transit</div>
          <div className="stat-value" style={{ color: "#3b82f6" }}>
            {formatNumber(dashboard?.inTransitWholesaleOrders)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Purchased</div>
          <div className="stat-value">{formatCurrency(dashboard?.totalPurchased)}</div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {dashboard?.lowStockAlerts?.length > 0 && (
        <div className="pod-card" style={{ marginTop: "1.5rem" }}>
          <div className="pod-card-header">
            <h3 className="pod-card-title">Low Stock Alerts</h3>
            <button
              className="pod-btn pod-btn-secondary pod-btn-sm"
              onClick={() => navigate(ROUTES.POD_PARTNER_INVENTORY)}
            >
              View All Inventory
            </button>
          </div>
          <div className="pod-table-container">
            <table className="pod-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.lowStockAlerts.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.productName}</td>
                    <td style={{ fontWeight: "600", color: "#ef4444" }}>{item.quantityOnHand}</td>
                    <td>{item.reorderLevel}</td>
                    <td>
                      <span className="status-badge" style={{ background: "#fef2f2", color: "#ef4444" }}>
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Sales */}
      {dashboard?.recentSales?.length > 0 && (
        <div className="pod-card" style={{ marginTop: "1.5rem" }}>
          <div className="pod-card-header">
            <h3 className="pod-card-title">Recent Sales</h3>
            <button
              className="pod-btn pod-btn-secondary pod-btn-sm"
              onClick={() => navigate(ROUTES.POD_PARTNER_SALES)}
            >
              View All Sales
            </button>
          </div>
          <div className="pod-table-container">
            <table className="pod-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {sale.id?.slice(0, 8)}...
                    </td>
                    <td>{sale.customerName || "-"}</td>
                    <td>{formatCurrency(sale.totalAmount)}</td>
                    <td style={{ color: "#10b981" }}>{formatCurrency(sale.profitAmount)}</td>
                    <td>
                      <span className={`status-badge ${sale.status?.toLowerCase()}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </td>
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
