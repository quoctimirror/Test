import { useState, useEffect } from "react";
import { productsAPI, handleAPIError } from "@services/api";
import { ROUTES } from "@/constants/routes";
import LineChart from "@components/charts/LineChart";
import BarChart from "@components/charts/BarChart";
import PieChart from "@components/charts/PieChart";
import AreaChart from "@components/charts/AreaChart";

const VendorStatistics = ({ vendorInfo }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    // Analytics data
    monthlyRevenue: [
      { month: 'Jan', revenue: 45000000, orders: 35, customers: 28 },
      { month: 'Feb', revenue: 52000000, orders: 42, customers: 35 },
      { month: 'Mar', revenue: 68000000, orders: 55, customers: 48 },
      { month: 'Apr', revenue: 58000000, orders: 48, customers: 40 },
      { month: 'May', revenue: 75000000, orders: 62, customers: 52 },
      { month: 'Jun', revenue: 85000000, orders: 70, customers: 58 }
    ],
    productCategories: [
      { name: 'Diamonds', value: 120000000, quantity: 450 },
      { name: 'Gold', value: 85000000, quantity: 320 },
      { name: 'Gemstones', value: 65000000, quantity: 280 },
      { name: 'Pearls', value: 45000000, quantity: 180 },
      { name: 'Silver', value: 30000000, quantity: 150 }
    ],
    topProducts: [
      { name: 'Diamond 1ct D-VVS1', sales: 35000000, quantity: 25 },
      { name: 'Gold 24K Bar', sales: 28000000, quantity: 15 },
      { name: 'Ruby Premium', sales: 22000000, quantity: 18 },
      { name: 'Tahitian Pearl', sales: 18000000, quantity: 30 },
      { name: 'Sapphire Blue', sales: 15000000, quantity: 20 }
    ],
    orderStatus: [
      { name: 'Completed', value: 245 },
      { name: 'Pending', value: 42 },
      { name: 'Processing', value: 28 },
      { name: 'Cancelled', value: 12 }
    ],
    inventoryHealth: [
      { status: 'In Stock', count: 450 },
      { status: 'Low Stock', count: 85 },
      { status: 'Out of Stock', count: 22 },
      { status: 'Reordering', count: 15 }
    ]
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

      setStats(prevStats => ({
        ...prevStats, // Keep the existing chart data
        totalProducts: data.totalActiveProducts || 0,
        activeProducts: data.totalActiveProducts || 0,
        featuredProducts: data.totalFeaturedProducts || 0,
        totalOrders: Math.floor(Math.random() * 50) + 10, // Mock data
        totalRevenue: Math.floor(Math.random() * 100000) + 50000, // Mock data
        lowStockProducts: data.lowStockProducts || 0,
      }));
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
          <h3 className="heading-3--no-margin">No Vendor Data</h3>
          <p className="bodytext-4--no-margin">Unable to load statistics without vendor information.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-body bodytext-4--no-margin" style={{ textAlign: "center", padding: "3rem" }}>
          Loading statistics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-body bodytext-4--no-margin" style={{ textAlign: "center", padding: "3rem", color: "#dc3545" }}>
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
                <h2 className="heading-3--no-margin">
                  {vendorInfo.name}
                </h2>
                <p className="bodytext-5--no-margin" style={{ color: "#666" }}>
                  {vendorInfo.code} • {vendorInfo.country}
                  {vendorInfo.vendorType && (
                    <span className="bodytext-6--no-margin" style={{ marginLeft: "0.5rem",
                      padding: "2px 8px",
                      background: "#e7f3ff",
                      color: "#0066cc",
                      borderRadius: "8px"
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
          <div className="vendor-stat-value">{stats.totalProducts}</div>
          <div className="vendor-stat-label">Total Products</div>
        </div>

        <div className="vendor-stat-card">
          <div className="vendor-stat-value">{stats.activeProducts}</div>
          <div className="vendor-stat-label">Active Products</div>
        </div>

        <div className="vendor-stat-card">
          <div className="vendor-stat-value">{stats.featuredProducts}</div>
          <div className="vendor-stat-label">Featured Products</div>
        </div>

        <div className="vendor-stat-card">
          <div className="vendor-stat-value">{stats.totalOrders}</div>
          <div className="vendor-stat-label">Total Orders</div>
        </div>

        <div className="vendor-stat-card">
          <div className="vendor-stat-value" style={{ fontSize: "1.5rem" }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="vendor-stat-label">Total Revenue</div>
        </div>

        <div className="vendor-stat-card">
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
              onClick={() => window.location.href = ROUTES.ADMIN_DASHBOARD}
            >
              View Admin Dashboard
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
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <div className="vendor-card">
        <div className="vendor-card-header">
          <h3 className="vendor-card-title">Recent Activity</h3>
        </div>
        <div className="vendor-card-body">
          <div className="bodytext-4--no-margin" style={{ color: "#666", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
            No recent activity to display
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="analytics-section" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '1.5rem', color: '#333' }}>
          Business Analytics
        </h2>

        {/* Revenue Trend */}
        <div className="vendor-card" style={{ marginBottom: '1.5rem' }}>
          <div className="vendor-card-header">
            <h3 className="vendor-card-title">Revenue & Order Trend</h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '14px' }}>
              Monthly performance overview
            </p>
          </div>
          <div className="vendor-card-body">
            <AreaChart
              data={stats.monthlyRevenue}
              areas={[
                { dataKey: 'revenue', name: 'Revenue (VND)', color: '#667eea' },
                { dataKey: 'orders', name: 'Orders', color: '#82ca9d' }
              ]}
              xDataKey="month"
              height={350}
            />
          </div>
        </div>

        {/* Product Categories & Order Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="vendor-card">
            <div className="vendor-card-header">
              <h3 className="vendor-card-title">Product Categories</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '14px' }}>
                Revenue by category
              </p>
            </div>
            <div className="vendor-card-body">
              <PieChart
                data={stats.productCategories}
                dataKey="value"
                nameKey="name"
                height={300}
                innerRadius={60}
              />
            </div>
          </div>

          <div className="vendor-card">
            <div className="vendor-card-header">
              <h3 className="vendor-card-title">Order Status</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '14px' }}>
                Current order distribution
              </p>
            </div>
            <div className="vendor-card-body">
              <PieChart
                data={stats.orderStatus}
                dataKey="value"
                nameKey="name"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Top Products Performance */}
        <div className="vendor-card" style={{ marginBottom: '1.5rem' }}>
          <div className="vendor-card-header">
            <h3 className="vendor-card-title">Top Products Performance</h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '14px' }}>
              Best selling products by revenue
            </p>
          </div>
          <div className="vendor-card-body">
            <BarChart
              data={stats.topProducts}
              bars={[
                { dataKey: 'sales', name: 'Sales (VND)', color: '#667eea' },
                { dataKey: 'quantity', name: 'Quantity Sold', color: '#ffc658' }
              ]}
              xDataKey="name"
              layout="vertical"
              height={300}
            />
          </div>
        </div>

        {/* Inventory Health & Customer Growth */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          <div className="vendor-card">
            <div className="vendor-card-header">
              <h3 className="vendor-card-title">Inventory Health</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '14px' }}>
                Stock status distribution
              </p>
            </div>
            <div className="vendor-card-body">
              <BarChart
                data={stats.inventoryHealth}
                bars={[
                  { dataKey: 'count', name: 'Product Count', color: '#82ca9d' }
                ]}
                xDataKey="status"
                layout="horizontal"
                height={280}
              />
            </div>
          </div>

          <div className="vendor-card">
            <div className="vendor-card-header">
              <h3 className="vendor-card-title">Customer Growth</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '14px' }}>
                Monthly customer acquisition
              </p>
            </div>
            <div className="vendor-card-body">
              <LineChart
                data={stats.monthlyRevenue}
                lines={[
                  { dataKey: 'customers', name: 'New Customers', color: '#ff7c7c' }
                ]}
                xDataKey="month"
                height={280}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorStatistics;