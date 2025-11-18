import { useState, useEffect } from "react";
import { designersAPI } from "@/services/api";
import LineChart from "@components/charts/LineChart";
import BarChart from "@components/charts/BarChart";
import PieChart from "@components/charts/PieChart";
import AreaChart from "@components/charts/AreaChart";

const DesignerStatistics = ({ designerInfo }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!designerInfo?.id) return;

      try {
        setLoading(true);
        const response = await designersAPI.getCurrentUserDashboard();

        // Add mock data for demonstration
        const mockData = {
          ...response.data,
          totalSalesAmount: 125000000, // 125M VND
          totalSalesCount: 28,
          totalEarnings: 18750000, // 18.75M VND
          currentMonthSales: 15000000, // 15M VND
          currentMonthEarnings: 2250000, // 2.25M VND
          activeDesignsCount: 12,
          averageRating: 4.8,
          totalReviewsCount: 45,
          averageOrderValue: 4464285, // ~4.5M VND
          totalDesignsCreated: 18,
          // Monthly sales trend data
          monthlySalesTrend: [
            { month: 'Jan', sales: 12000000, earnings: 1800000, orders: 8 },
            { month: 'Feb', sales: 18000000, earnings: 2700000, orders: 12 },
            { month: 'Mar', sales: 22000000, earnings: 3300000, orders: 15 },
            { month: 'Apr', sales: 16000000, earnings: 2400000, orders: 10 },
            { month: 'May', sales: 25000000, earnings: 3750000, orders: 18 },
            { month: 'Jun', sales: 32000000, earnings: 4800000, orders: 22 }
          ],
          // Design category performance
          designCategories: [
            { name: 'Rings', value: 45000000, count: 10 },
            { name: 'Necklaces', value: 35000000, count: 8 },
            { name: 'Bracelets', value: 25000000, count: 6 },
            { name: 'Earrings', value: 20000000, count: 4 }
          ],
          // Commission breakdown
          earningsBreakdown: [
            { name: 'Commission', value: 12500000 },
            { name: 'Loyalty Bonus', value: 4250000 },
            { name: 'Performance Bonus', value: 2000000 }
          ],
          recentSales: [
            {
              id: '1',
              designName: 'Eternal Elegance Ring',
              productName: 'Diamond Solitaire Ring',
              saleAmount: 8500000,
              commissionEarned: 1275000,
              saleDate: new Date().toISOString()
            },
            {
              id: '2',
              designName: 'Royal Crown Necklace',
              productName: 'Gold Diamond Necklace',
              saleAmount: 12000000,
              commissionEarned: 1800000,
              saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              designName: 'Classic Pearl Earrings',
              productName: 'Tahitian Pearl Earrings',
              saleAmount: 6750000,
              commissionEarned: 1012500,
              saleDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          topDesigns: [
            {
              id: '1',
              designName: 'Eternal Elegance Ring',
              totalSalesCount: 10,
              totalSalesAmount: 45000000,
              totalCommissionEarned: 6750000,
              totalLoyaltyEarned: 2250000
            },
            {
              id: '2',
              designName: 'Royal Crown Necklace',
              totalSalesCount: 8,
              totalSalesAmount: 35000000,
              totalCommissionEarned: 5250000,
              totalLoyaltyEarned: 1750000
            },
            {
              id: '3',
              designName: 'Vintage Rose Bracelet',
              totalSalesCount: 6,
              totalSalesAmount: 30000000,
              totalCommissionEarned: 4500000,
              totalLoyaltyEarned: 1500000
            }
          ]
        };

        setDashboardData(mockData);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [designerInfo]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="designer-statistics-loading">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="designer-statistics-error">
        <h3>Error Loading Statistics</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="designer-statistics">
      {/* Designer Profile Header */}
      <div className="designer-profile-header">
        <div className="profile-avatar">
          {designerInfo?.name ? designerInfo.name.charAt(0).toUpperCase() : "D"}
        </div>
        <div className="profile-info">
          <h2>{designerInfo?.name}</h2>
          <p className="profile-code">{designerInfo?.code}</p>
          <p className="profile-brand">{designerInfo?.brandName}</p>
          <div className="profile-details">
            <span className="detail-item">Specialty: {designerInfo?.specialty || 'Not specified'}</span>
            <span className="detail-item">Experience: {designerInfo?.yearsExperience || 0} years</span>
            <span className="detail-item">Style: {designerInfo?.designStyle || 'Not specified'}</span>
          </div>
        </div>
        <div className="profile-status">
          <span className={`status-badge ${designerInfo?.verified ? 'verified' : 'unverified'}`}>
            {designerInfo?.verified ? 'Verified' : 'Unverified'}
          </span>
          {designerInfo?.featured && (
            <span className="status-badge featured">Featured</span>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Sales</h3>
            <p className="stat-value">{formatCurrency(dashboardData?.totalSalesAmount || 0)}</p>
            <small>{dashboardData?.totalSalesCount || 0} orders</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">{formatCurrency(dashboardData?.totalEarnings || 0)}</p>
            <small>Commission + Loyalty</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>This Month</h3>
            <p className="stat-value">{formatCurrency(dashboardData?.currentMonthSales || 0)}</p>
            <small>Earnings: {formatCurrency(dashboardData?.currentMonthEarnings || 0)}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Active Designs</h3>
            <p className="stat-value">{dashboardData?.activeDesignsCount || 0}</p>
            <small>Designs with commissions</small>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="activity-section">
          <h3>Recent Sales Activity</h3>
          <div className="sales-list">
            {dashboardData?.recentSales?.slice(0, 5).map(sale => (
              <div key={sale.id} className="sale-item">
                <div className="sale-info">
                  <strong>Design: {sale.designName || sale.designId}</strong>
                  <p>Product: {sale.productName || sale.productId}</p>
                  <small>{formatDate(sale.saleDate)}</small>
                </div>
                <div className="sale-amount">
                  <span className="amount">{formatCurrency(sale.saleAmount)}</span>
                  <small>Earned: {formatCurrency(sale.commissionEarned || 0)}</small>
                </div>
              </div>
            )) || <p>No recent sales found.</p>}
          </div>
        </div>

        <div className="activity-section">
          <h3>Top Performing Designs</h3>
          <div className="designs-list">
            {dashboardData?.topDesigns?.slice(0, 5).map(design => (
              <div key={design.id} className="design-item">
                <div className="design-info">
                  <strong>{design.designName || `Design ${design.id}`}</strong>
                  <p>Sales: {design.totalSalesCount || 0}</p>
                </div>
                <div className="design-earnings">
                  <span className="amount">{formatCurrency(design.totalSalesAmount || 0)}</span>
                  <small>Earned: {formatCurrency(design.totalCommissionEarned + design.totalLoyaltyEarned || 0)}</small>
                </div>
              </div>
            )) || <p>No design performance data available.</p>}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-metrics">
        <div className="metric-card">
          <h4>Average Rating</h4>
          <div className="metric-value">
            {dashboardData?.averageRating ?
              <span className="rating">{parseFloat(dashboardData.averageRating).toFixed(1)}/5</span> :
              <span className="no-data">No ratings yet</span>
            }
          </div>
          <small>{dashboardData?.totalReviewsCount || 0} reviews</small>
        </div>

        <div className="metric-card">
          <h4>Average Order Value</h4>
          <div className="metric-value">
            {formatCurrency(dashboardData?.averageOrderValue || 0)}
          </div>
          <small>Per transaction</small>
        </div>

        <div className="metric-card">
          <h4>Total Designs Created</h4>
          <div className="metric-value">
            {dashboardData?.totalDesignsCreated || 0}
          </div>
          <small>Design portfolio</small>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="analytics-section">
        <h2 className="section-title">Performance Analytics</h2>

        {/* Sales & Earnings Trend */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Sales & Earnings Trend</h3>
            <p className="chart-description">Monthly performance over the last 6 months</p>
          </div>
          <div className="chart-body">
            {dashboardData?.monthlySalesTrend && (
              <AreaChart
                data={dashboardData.monthlySalesTrend}
                areas={[
                  { dataKey: 'sales', name: 'Sales (VND)', color: '#8884d8' },
                  { dataKey: 'earnings', name: 'Earnings (VND)', color: '#82ca9d' }
                ]}
                xDataKey="month"
                height={350}
              />
            )}
          </div>
        </div>

        {/* Design Categories & Earnings Breakdown */}
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Design Category Performance</h3>
              <p className="chart-description">Sales distribution by product category</p>
            </div>
            <div className="chart-body">
              {dashboardData?.designCategories && (
                <PieChart
                  data={dashboardData.designCategories}
                  dataKey="value"
                  nameKey="name"
                  height={300}
                  innerRadius={60}
                />
              )}
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Earnings Breakdown</h3>
              <p className="chart-description">Revenue sources composition</p>
            </div>
            <div className="chart-body">
              {dashboardData?.earningsBreakdown && (
                <PieChart
                  data={dashboardData.earningsBreakdown}
                  dataKey="value"
                  nameKey="name"
                  height={300}
                />
              )}
            </div>
          </div>
        </div>

        {/* Top Designs Performance */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Top Designs Performance</h3>
            <p className="chart-description">Best performing designs by sales volume</p>
          </div>
          <div className="chart-body">
            {dashboardData?.topDesigns && (
              <BarChart
                data={dashboardData.topDesigns.map(design => ({
                  name: design.designName,
                  sales: design.totalSalesAmount,
                  earnings: design.totalCommissionEarned + design.totalLoyaltyEarned
                }))}
                bars={[
                  { dataKey: 'sales', name: 'Total Sales (VND)', color: '#8884d8' },
                  { dataKey: 'earnings', name: 'Total Earnings (VND)', color: '#82ca9d' }
                ]}
                xDataKey="name"
                layout="vertical"
                height={300}
              />
            )}
          </div>
        </div>

        {/* Monthly Order Volume */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Order Volume Trend</h3>
            <p className="chart-description">Number of orders per month</p>
          </div>
          <div className="chart-body">
            {dashboardData?.monthlySalesTrend && (
              <LineChart
                data={dashboardData.monthlySalesTrend}
                lines={[
                  { dataKey: 'orders', name: 'Orders', color: '#ffc658' }
                ]}
                xDataKey="month"
                height={300}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerStatistics;