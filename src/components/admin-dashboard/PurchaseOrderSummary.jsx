import React, { useState, useEffect } from 'react';
import { SkeletonStatsGrid, SkeletonTable } from './Skeleton';

const PurchaseOrderSummary = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const statuses = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // const response = await purchaseOrderAPI.getAll();
      // setOrders(response.data);

      // Load orders from localStorage (created by Vendor Selection Wizard)
      const savedOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');

      // Mock data
      const mockOrders = [
        {
          id: 'PO-001',
          vendorName: 'Gold Jewelry Manufacturer Ltd',
          totalAmount: 125000000,
          currency: 'VND',
          status: 'APPROVED',
          orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          expectedDelivery: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          itemCount: 150
        },
        {
          id: 'PO-002',
          vendorName: 'Diamond Ring Supplier Co',
          totalAmount: 85000000,
          currency: 'VND',
          status: 'IN_TRANSIT',
          orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          itemCount: 100
        },
        {
          id: 'PO-003',
          vendorName: 'Silver Bracelet Factory',
          totalAmount: 45000000,
          currency: 'VND',
          status: 'PENDING',
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expectedDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          itemCount: 75
        }
      ];

      // Combine saved orders with mock orders (saved orders first - newest at top)
      setOrders([...savedOrders, ...mockOrders]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    statusFilter === 'ALL' || order.status === statusFilter
  );

  const getStatusStyle = (status) => {
    const configs = {
      DRAFT: { backgroundColor: '#f1f5f9', color: '#475569' },
      PENDING: { backgroundColor: '#fef3c7', color: '#854d0e' },
      APPROVED: { backgroundColor: '#dcfce7', color: '#166534' },
      IN_TRANSIT: { backgroundColor: '#dbeafe', color: '#1e40af' },
      DELIVERED: { backgroundColor: '#f3e8ff', color: '#6b21a8' },
      CANCELLED: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return configs[status] || configs.PENDING;
  };

  const isNewOrder = (orderId) => {
    return orderId.startsWith('PO-' + new Date().getFullYear());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  const getTotalStats = () => {
    return {
      total: orders.length,
      totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      pending: orders.filter(o => o.status === 'PENDING').length,
      inTransit: orders.filter(o => o.status === 'IN_TRANSIT').length
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="purchase-orders-summary">
        <SkeletonStatsGrid count={4} className="admin-mb-lg" />
        <div className="admin-card">
          <div className="admin-section-header">
            <div className="skeleton" style={{ width: '180px', height: '1.25rem' }} />
          </div>
          <SkeletonTable rows={5} columns={7} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
          Purchase Orders
        </h1>
      </div>

      {/* Info Banner */}
      {orders.some(o => o.id.includes(Date.now().toString().substring(0, 8))) && (
        <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#eff6ff', borderLeft: '3px solid #3b82f6' }}>
          <h3 style={{ margin: '0 0 0.375rem 0', fontWeight: '600', fontSize: '0.875rem', color: '#1e40af' }}>Purchase Orders Created!</h3>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#1e40af' }}>
            Your vendor selections from the Vendor Selection Wizard have been converted into purchase orders below.
            Orders marked as "NEW" are ready for review and approval.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 0.375rem 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Total Orders</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{stats.total}</p>
        </div>

        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 0.375rem 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Total Value</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{formatCurrency(stats.totalAmount)}</p>
        </div>

        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 0.375rem 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Pending</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{stats.pending}</p>
        </div>

        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 0.375rem 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>In Transit</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{stats.inTransit}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label className="admin-label" style={{ margin: 0 }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
            {filteredOrders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafb', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Order ID
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Vendor
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Items
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Amount
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Order Date
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Expected Delivery
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const isNew = order.id.includes(Date.now().toString().substring(0, 8));
              return (
                <tr key={order.id} style={{
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: isNew ? '#eff6ff' : '#ffffff',
                  borderLeft: isNew ? '3px solid #3b82f6' : 'none'
                }}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {order.id}
                    {isNew && <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.6875rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '12px', fontWeight: '600' }}>NEW</span>}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {order.vendorName}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {order.itemCount} items
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(order.expectedDelivery).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '12px',
                      ...getStatusStyle(order.status)
                    }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="admin-empty-state">
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>No orders found</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Try selecting a different status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderSummary;
