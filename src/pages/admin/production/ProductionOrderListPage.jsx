import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  productionOrderAPI,
  PRODUCTION_ORDER_STATUS,
  getOrderStatusConfig,
  calculateOrderProgress,
  formatDate,
  getAssignedStagesCount,
} from '@services/productionOrderService';
import { SkeletonTable } from '@components/admin-dashboard/Skeleton';
import '@components/production/production.css';

/**
 * ProductionOrderListPage - List and manage production orders
 * Features: List, filter by plan/status, view assignment progress
 */
const ProductionOrderListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalItems: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    planId: searchParams.get('planId') || '',
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    ready: 0,
    inProgress: 0,
    completed: 0,
  });

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.planId) params.productionPlanId = filters.planId;

      const response = await productionOrderAPI.getAll(params);
      const data = response.data;

      setOrders(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalItems: data.totalItems || 0,
      }));

      // Calculate stats from current page (for demo purposes)
      calculateStats(data.content || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load production orders');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList) => {
    const newStats = {
      total: orderList.length,
      draft: orderList.filter((o) => o.status === PRODUCTION_ORDER_STATUS.DRAFT).length,
      ready: orderList.filter((o) => o.status === PRODUCTION_ORDER_STATUS.READY).length,
      inProgress: orderList.filter((o) => o.status === PRODUCTION_ORDER_STATUS.IN_PROGRESS).length,
      completed: orderList.filter((o) => o.status === PRODUCTION_ORDER_STATUS.COMPLETED).length,
    };
    setStats(newStats);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(field, value);
    } else {
      newParams.delete(field);
    }
    setSearchParams(newParams);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dashboard/admin?tab=production-order-detail&id=${orderId}`);
  };

  const handleAssignPartners = (orderId) => {
    navigate(`/dashboard/admin?tab=partner-assignment&orderId=${orderId}`);
  };

  const OrderStatusBadge = ({ status }) => {
    const config = getOrderStatusConfig(status);
    return (
      <span
        className="production-status-badge"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const AssignmentProgress = ({ stages }) => {
    if (!stages || stages.length === 0) return <span className="text-muted">-</span>;

    const assigned = getAssignedStagesCount(stages);
    const total = stages.length;
    const percentage = Math.round((assigned / total) * 100);

    return (
      <div className="assignment-progress">
        <div className="progress-bar-small">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage === 100 ? '#10b981' : '#4f8cff',
            }}
          />
        </div>
        <span className="progress-text">
          {assigned}/{total} assigned
        </span>
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="production-order-list-page">
        <div className="admin-card admin-p-lg">
          <SkeletonTable rows={10} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="production-order-list-page">
      {/* Filters */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <div className="production-filters">
          <input
            type="text"
            className="admin-input"
            placeholder="Search by order number..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <select
            className="admin-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Statuses</option>
            {Object.entries(PRODUCTION_ORDER_STATUS).map(([key, value]) => (
              <option key={key} value={value}>
                {getOrderStatusConfig(value).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="production-stats-row admin-mb-lg">
        <div className="production-stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="production-stat-card">
          <span className="stat-label">Draft</span>
          <span className="stat-value" style={{ color: '#475569' }}>
            {stats.draft}
          </span>
        </div>
        <div className="production-stat-card">
          <span className="stat-label">Ready</span>
          <span className="stat-value" style={{ color: '#1e40af' }}>
            {stats.ready}
          </span>
        </div>
        <div className="production-stat-card">
          <span className="stat-label">In Progress</span>
          <span className="stat-value" style={{ color: '#854d0e' }}>
            {stats.inProgress}
          </span>
        </div>
        <div className="production-stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value" style={{ color: '#166534' }}>
            {stats.completed}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="admin-error-state admin-mb-lg">{error}</div>}

      {/* Orders Table */}
      <div className="admin-card admin-p-lg">
        <h3 className="production-section-title">Production Orders ({pagination.totalItems})</h3>

        {orders.length === 0 ? (
          <div className="production-empty-state">
            <p>No production orders found</p>
            <p className="text-muted">
              Generate orders from a production plan to get started.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Partner Assignment</th>
                  <th>Current Stage</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td>{order.productionPlanName || '-'}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar-small">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${order.progressPercentage || 0}%`,
                              backgroundColor:
                                order.progressPercentage === 100 ? '#10b981' : '#4f8cff',
                            }}
                          />
                        </div>
                        <span>{order.progressPercentage || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <AssignmentProgress stages={order.stages} />
                    </td>
                    <td>{order.currentStageName || '-'}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="admin-button admin-button-sm admin-button-secondary"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          View
                        </button>
                        <button
                          className="admin-button admin-button-sm admin-button-primary"
                          onClick={() => handleAssignPartners(order.id)}
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-button admin-button-secondary"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 0}
            >
              Previous
            </button>
            <span>
              Page {pagination.page + 1} of {pagination.totalPages}
            </span>
            <button
              className="admin-button admin-button-secondary"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionOrderListPage;
