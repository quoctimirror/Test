import { useState, useEffect } from "react";
import { productsAPI, handleAPIError } from "@services/api";

const VendorStatistics = ({ vendorInfo }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vendorInfo) {
      fetchStatistics();
    }
  }, [vendorInfo]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Get current user's vendor statistics (filtered by backend via JWT)
      const response = await productsAPI.getStatistics();
      const data = response.data;
      
      setStats({
        totalProducts: data.totalActiveProducts || 0,
        activeProducts: data.totalActiveProducts || 0,
        featuredProducts: data.totalFeaturedProducts || 0,
        totalOrders: Math.floor(Math.random() * 50) + 10, // Mock data
        totalRevenue: Math.floor(Math.random() * 100000) + 50000, // Mock data
        lowStockProducts: data.lowStockProducts || 0,
      });
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to load statistics");
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!vendorInfo) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-body" style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <div style={{ fontSize: "48px", marginBottom: "1rem" }}></div>
          <h3>No Vendor Data</h3>
          <p>Unable to load statistics without vendor information.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-body" style={{ textAlign: "center", padding: "3rem" }}>
          Loading statistics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-body" style={{ textAlign: "center", padding: "3rem", color: "#dc3545" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Vendor Info Header */}
      {vendorInfo && (
        <div className="vendor-card" style={{ marginBottom: "1.5rem" }}>
          <div className="vendor-card-body">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "600"
              }}>
                {vendorInfo.name ? vendorInfo.name.charAt(0).toUpperCase() : "V"}
              </div>
              <div>
                <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "20px", fontWeight: "600" }}>
                  {vendorInfo.name}
                </h2>
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                  {vendorInfo.code} • {vendorInfo.country}
                  {vendorInfo.vendorType && (
                    <span style={{ marginLeft: "0.5rem", 
                      padding: "2px 8px", 
                      background: "#e7f3ff", 
                      color: "#0066cc", 
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}>
                      {vendorInfo.vendorType}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="vendor-stats-grid">
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon"></span>
          <div className="vendor-stat-value">{stats.totalProducts}</div>
          <div className="vendor-stat-label">Total Products</div>
        </div>

        <div className="vendor-stat-card">
          <span className="vendor-stat-icon">✅</span>
          <div className="vendor-stat-value">{stats.activeProducts}</div>
          <div className="vendor-stat-label">Active Products</div>
        </div>

        <div className="vendor-stat-card">
          <span className="vendor-stat-icon"></span>
          <div className="vendor-stat-value">{stats.featuredProducts}</div>
          <div className="vendor-stat-label">Featured Products</div>
        </div>

        <div className="vendor-stat-card">
          <span className="vendor-stat-icon"></span>
          <div className="vendor-stat-value">{stats.totalOrders}</div>
          <div className="vendor-stat-label">Total Orders</div>
        </div>

        <div className="vendor-stat-card">
          <span className="vendor-stat-icon"></span>
          <div className="vendor-stat-value" style={{ fontSize: "1.5rem" }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="vendor-stat-label">Total Revenue</div>
        </div>

        <div className="vendor-stat-card">
          <span className="vendor-stat-icon">⚠️</span>
          <div className="vendor-stat-value" style={{ color: stats.lowStockProducts > 0 ? "#dc3545" : "#28a745" }}>
            {stats.lowStockProducts}
          </div>
          <div className="vendor-stat-label">Low Stock Alerts</div>
        </div>
      </div>

      <div className="vendor-card">
        <div className="vendor-card-header">
          <h3 className="vendor-card-title">Quick Actions</h3>
        </div>
        <div className="vendor-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <button 
              className="admin-button admin-button-primary"
              style={{ padding: "1rem", fontSize: "16px" }}
              onClick={() => window.location.href = "/dashboard/admin"}
            >
              🏢 View Admin Dashboard
            </button>
            <button 
              className="admin-button admin-button-outline"
              style={{ padding: "1rem", fontSize: "16px" }}
            >
               View Reports
            </button>
            <button 
              className="admin-button admin-button-outline"
              style={{ padding: "1rem", fontSize: "16px" }}
            >
              📞 Contact Support
            </button>
          </div>
        </div>
      </div>

      <div className="vendor-card">
        <div className="vendor-card-header">
          <h3 className="vendor-card-title">Recent Activity</h3>
        </div>
        <div className="vendor-card-body">
          <div style={{ color: "#666", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
            No recent activity to display
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorStatistics;