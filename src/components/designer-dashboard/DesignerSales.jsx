import { useState, useEffect } from "react";
import { designersAPI } from "@/services/api";

const DesignerSales = ({ designerInfo }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!designerInfo?.id) return;

      try {
        setLoading(true);
        const response = await designersAPI.getCurrentUserDashboard();

        // Add comprehensive mock sales data consistent with dashboard and designs
        const mockSalesData = {
          ...response.data,
          totalSalesAmount: 125000000,
          totalSalesCount: 28,
          totalEarnings: 18750000,
          currentMonthSales: 15000000,
          currentMonthEarnings: 2250000,

          // Recent sales transactions for the table
          recentSales: [
            {
              id: 'SAL001',
              designProductId: 'DPR000001',
              designName: 'Eternal Elegance Ring',
              productName: 'Diamond Solitaire Ring',
              orderId: 'ORD-2024-001',
              saleAmount: 8500000,
              commissionAmount: 1275000,
              loyaltyAmount: 425000,
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              quantity: 1,
              saleDate: '2024-10-01T14:30:00',
              processed: true,
              customerRating: 5.0,
              customerReview: 'Absolutely stunning ring! Perfect craftsmanship and beautiful design.',
              currency: 'VND'
            },
            {
              id: 'SAL002',
              designProductId: 'DPR000002',
              designName: 'Royal Crown Necklace',
              productName: 'Gold Diamond Necklace',
              orderId: 'ORD-2024-002',
              saleAmount: 12000000,
              commissionAmount: 1800000,
              loyaltyAmount: 600000,
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              quantity: 1,
              saleDate: '2024-09-30T10:15:00',
              processed: true,
              customerRating: 4.8,
              customerReview: 'Magnificent necklace, received many compliments at the gala.',
              currency: 'VND'
            },
            {
              id: 'SAL003',
              designProductId: 'DPR000004',
              designName: 'Classic Pearl Earrings',
              productName: 'Tahitian Pearl Earrings',
              orderId: 'ORD-2024-003',
              saleAmount: 6750000,
              commissionAmount: 1012500,
              loyaltyAmount: 337500,
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              quantity: 1,
              saleDate: '2024-09-28T16:45:00',
              processed: true,
              customerRating: 4.7,
              customerReview: 'Beautiful pearls with excellent luster. Very elegant design.',
              currency: 'VND'
            },
            {
              id: 'SAL004',
              designProductId: 'DPR000003',
              designName: 'Vintage Rose Bracelet',
              productName: 'Rose Gold Diamond Bracelet',
              orderId: 'ORD-2024-004',
              saleAmount: 6000000,
              commissionAmount: 900000,
              loyaltyAmount: 300000,
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              quantity: 1,
              saleDate: '2024-09-25T11:20:00',
              processed: true,
              customerRating: 4.9,
              customerReview: 'Perfect vintage style, exactly what I was looking for.',
              currency: 'VND'
            },
            {
              id: 'SAL005',
              designProductId: 'DPR000001',
              designName: 'Eternal Elegance Ring',
              productName: 'Diamond Solitaire Ring',
              orderId: 'ORD-2024-005',
              saleAmount: 8500000,
              commissionAmount: 1275000,
              loyaltyAmount: 425000,
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              quantity: 1,
              saleDate: '2024-09-22T13:10:00',
              processed: true,
              customerRating: 5.0,
              customerReview: 'Engagement ring exceeded expectations. She loves it!',
              currency: 'VND'
            },
            {
              id: 'SAL006',
              designProductId: 'DPR000002',
              designName: 'Royal Crown Necklace',
              productName: 'Gold Diamond Necklace',
              orderId: 'ORD-2024-006',
              saleAmount: 12000000,
              commissionAmount: 1800000,
              loyaltyAmount: 600000,
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              quantity: 1,
              saleDate: '2024-09-18T09:30:00',
              processed: true,
              customerRating: 4.6,
              customerReview: 'Luxurious and well-crafted. Worth the investment.',
              currency: 'VND'
            },
            {
              id: 'SAL007',
              designProductId: 'DPR000003',
              designName: 'Vintage Rose Bracelet',
              productName: 'Rose Gold Diamond Bracelet',
              orderId: 'ORD-2024-007',
              saleAmount: 6000000,
              commissionAmount: 900000,
              loyaltyAmount: 300000,
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              quantity: 1,
              saleDate: '2024-09-15T15:45:00',
              processed: false,
              customerRating: null,
              customerReview: null,
              currency: 'VND'
            }
          ],

          // Commission configurations for the table
          activeCommissions: [
            {
              id: 'DPR000001',
              designName: 'Eternal Elegance Ring',
              productName: 'Diamond Solitaire Ring',
              productId: 'PRD001',
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              isActive: true,
              createdAt: '2024-08-20T14:45:00'
            },
            {
              id: 'DPR000002',
              designName: 'Royal Crown Necklace',
              productName: 'Gold Diamond Necklace',
              productId: 'PRD002',
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              isActive: true,
              createdAt: '2024-07-25T16:20:00'
            },
            {
              id: 'DPR000003',
              designName: 'Vintage Rose Bracelet',
              productName: 'Rose Gold Diamond Bracelet',
              productId: 'PRD003',
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              isActive: true,
              createdAt: '2024-06-15T13:30:00'
            },
            {
              id: 'DPR000004',
              designName: 'Classic Pearl Earrings',
              productName: 'Tahitian Pearl Earrings',
              productId: 'PRD004',
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              isActive: true,
              createdAt: '2024-09-10T10:15:00'
            },
            {
              id: 'DPR000005',
              designName: 'Modern Geometric Pendant',
              productName: 'Not yet converted to product',
              productId: null,
              commissionPercentage: 15.00,
              loyaltyPercentage: 5.00,
              isActive: false,
              createdAt: '2024-09-25T08:30:00'
            }
          ]
        };

        setDashboardData(mockSalesData);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
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
      <div className="designer-sales-loading">
        <div className="loading-spinner"></div>
        <p>Loading sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="designer-sales-error">
        <h3>Error Loading Sales Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  const sales = dashboardData?.recentSales || [];
  const commissions = dashboardData?.activeCommissions || [];

  return (
    <div className="designer-sales">
      {/* Sales Summary */}
      <div className="sales-summary">
        <div className="summary-card">
          <h3>Total Sales</h3>
          <div className="summary-value">{formatCurrency(dashboardData?.totalSalesAmount || 0)}</div>
          <div className="summary-detail">{dashboardData?.totalSalesCount || 0} transactions</div>
        </div>
        <div className="summary-card">
          <h3>Total Earnings</h3>
          <div className="summary-value">{formatCurrency(dashboardData?.totalEarnings || 0)}</div>
          <div className="summary-detail">Commission + Loyalty</div>
        </div>
        <div className="summary-card">
          <h3>This Month</h3>
          <div className="summary-value">{formatCurrency(dashboardData?.currentMonthSales || 0)}</div>
          <div className="summary-detail">Earnings: {formatCurrency(dashboardData?.currentMonthEarnings || 0)}</div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="sales-section">
        <h3>Recent Sales</h3>
        {sales.length > 0 ? (
          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Design</th>
                  <th>Product</th>
                  <th>Sale Amount</th>
                  <th>Commission</th>
                  <th>Loyalty</th>
                  <th>Total Earnings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td>{formatDate(sale.saleDate)}</td>
                    <td>{sale.designName || sale.designId}</td>
                    <td>{sale.productName || sale.productId}</td>
                    <td>{formatCurrency(sale.saleAmount)}</td>
                    <td>{formatCurrency(sale.commissionAmount || 0)}</td>
                    <td>{formatCurrency(sale.loyaltyAmount || 0)}</td>
                    <td>{formatCurrency((sale.commissionAmount || 0) + (sale.loyaltyAmount || 0))}</td>
                    <td>
                      <span className={`status ${sale.processed ? 'processed' : 'pending'}`}>
                        {sale.processed ? 'Processed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-sales">
            <p>No sales transactions found.</p>
          </div>
        )}
      </div>

      {/* Commission Configuration */}
      <div className="commissions-section">
        <h3>Commission Configuration</h3>
        {commissions.length > 0 ? (
          <div className="commissions-table-container">
            <table className="commissions-table">
              <thead>
                <tr>
                  <th>Design</th>
                  <th>Product</th>
                  <th>Commission %</th>
                  <th>Loyalty %</th>
                  <th>Total %</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map(commission => (
                  <tr key={commission.id}>
                    <td>{commission.designName || commission.id}</td>
                    <td>{commission.productName || commission.productId}</td>
                    <td>{commission.commissionPercentage || 0}%</td>
                    <td>{commission.loyaltyPercentage || 0}%</td>
                    <td>{(commission.commissionPercentage || 0) + (commission.loyaltyPercentage || 0)}%</td>
                    <td>
                      <span className={`status ${commission.isActive ? 'active' : 'inactive'}`}>
                        {commission.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(commission.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-commissions">
            <p>No commission configurations found.</p>
            <p>Contact administrator to set up commission rates for your designs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerSales;