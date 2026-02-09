import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  componentOwnershipAPI,
  HANDOFF_STATUS,
  getHandoffStatusConfig,
  getHandoffTypeConfig,
  formatDateTime,
  formatDate,
  getArrivalStatusLabel,
  getHandoffStats,
} from '@services/componentOwnershipService';
import { productionOrderAPI } from '@services/productionOrderService';
import { SkeletonTable } from '@components/admin-dashboard/Skeleton';
import './component-tracking.css';

/**
 * ComponentTrackingDashboard - Visual pipeline showing component locations across partners
 * Features:
 * - Summary stats (pending, overdue, received)
 * - Filter by status, vendor
 * - Overdue items highlighted
 * - Drill-down to order details
 */
const ComponentTrackingDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('view') || 'overview');

  // Data
  const [overdueHandoffs, setOverdueHandoffs] = useState([]);
  const [pendingByStatus, setPendingByStatus] = useState({});
  const [stats, setStats] = useState({
    totalPending: 0,
    totalOverdue: 0,
    totalInTransit: 0,
    totalReceived: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    vendorId: searchParams.get('vendorId') || '',
    status: searchParams.get('status') || '',
  });

  // Fetch data on load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch overdue handoffs
      const overdueResponse = await componentOwnershipAPI.getOverdueHandoffs();
      setOverdueHandoffs(overdueResponse.data || []);

      // Fetch by status for stats
      const [initiatedRes, inTransitRes] = await Promise.all([
        componentOwnershipAPI.getByStatus(HANDOFF_STATUS.INITIATED, { size: 100 }),
        componentOwnershipAPI.getByStatus(HANDOFF_STATUS.IN_TRANSIT, { size: 100 }),
      ]);

      const initiated = initiatedRes.data?.content || [];
      const inTransit = inTransitRes.data?.content || [];

      setPendingByStatus({
        [HANDOFF_STATUS.INITIATED]: initiated,
        [HANDOFF_STATUS.IN_TRANSIT]: inTransit,
      });

      // Calculate stats
      setStats({
        totalPending: initiated.length + inTransit.length,
        totalOverdue: overdueResponse.data?.length || 0,
        totalInTransit: inTransit.length,
        totalInitiated: initiated.length,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load component tracking data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dashboard/admin?tab=production-order-detail&id=${orderId}`);
  };

  const handleViewHandoff = (handoffId) => {
    navigate(`/dashboard/admin?tab=handoff-detail&id=${handoffId}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', tab);
    setSearchParams(newParams);
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const config = getHandoffStatusConfig(status);
    return (
      <span
        className="tracking-status-badge"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  // Overdue Badge Component
  const OverdueBadge = ({ expectedArrivalDate }) => {
    const arrivalStatus = getArrivalStatusLabel(expectedArrivalDate);
    if (!arrivalStatus) return null;
    return (
      <span className="arrival-status-badge" style={{ color: arrivalStatus.color }}>
        {arrivalStatus.label}
      </span>
    );
  };

  // Stats Cards Component
  const StatsCards = () => (
    <div className="tracking-stats-grid">
      <div className="tracking-stat-card">
        <div className="stat-icon pending">
          <span>📤</span>
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalInitiated || 0}</div>
          <div className="stat-label">Awaiting Shipment</div>
        </div>
      </div>

      <div className="tracking-stat-card">
        <div className="stat-icon transit">
          <span>🚚</span>
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalInTransit || 0}</div>
          <div className="stat-label">In Transit</div>
        </div>
      </div>

      <div className="tracking-stat-card warning">
        <div className="stat-icon overdue">
          <span>⚠️</span>
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalOverdue || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="tracking-stat-card">
        <div className="stat-icon total">
          <span>📦</span>
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalPending || 0}</div>
          <div className="stat-label">Total Pending</div>
        </div>
      </div>
    </div>
  );

  // Overdue Items Table
  const OverdueItemsTable = () => {
    if (overdueHandoffs.length === 0) {
      return (
        <div className="empty-state">
          <span className="empty-icon">✅</span>
          <p>No overdue handoffs</p>
        </div>
      );
    }

    return (
      <div className="tracking-table-container">
        <table className="tracking-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>From</th>
              <th>To</th>
              <th>Type</th>
              <th>Status</th>
              <th>Expected</th>
              <th>Overdue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {overdueHandoffs.map((handoff) => {
              const typeConfig = getHandoffTypeConfig(handoff.handoffType);
              return (
                <tr key={handoff.id} className="overdue-row">
                  <td>
                    <button
                      className="link-button"
                      onClick={() => handleViewOrder(handoff.productionOrderId)}
                    >
                      {handoff.productionOrderNumber || handoff.productionOrderId}
                    </button>
                  </td>
                  <td>{handoff.fromVendorName || 'MIRROR'}</td>
                  <td>{handoff.toVendorName || 'MIRROR'}</td>
                  <td>
                    <span title={typeConfig.description}>
                      {typeConfig.icon} {typeConfig.label}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={handoff.status} />
                  </td>
                  <td>{formatDate(handoff.expectedArrivalDate)}</td>
                  <td>
                    <OverdueBadge expectedArrivalDate={handoff.expectedArrivalDate} />
                  </td>
                  <td>
                    <button
                      className="action-btn small"
                      onClick={() => handleViewHandoff(handoff.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Pending Items by Status
  const PendingItemsList = ({ status }) => {
    const items = pendingByStatus[status] || [];
    const statusConfig = getHandoffStatusConfig(status);

    if (items.length === 0) {
      return (
        <div className="empty-state small">
          <p>No items {statusConfig.label.toLowerCase()}</p>
        </div>
      );
    }

    return (
      <div className="pending-items-list">
        {items.slice(0, 10).map((handoff) => (
          <div key={handoff.id} className="pending-item-card">
            <div className="pending-item-header">
              <button
                className="link-button"
                onClick={() => handleViewOrder(handoff.productionOrderId)}
              >
                {handoff.productionOrderNumber || 'Order'}
              </button>
              <StatusBadge status={handoff.status} />
            </div>
            <div className="pending-item-details">
              <span className="transfer-arrow">
                {handoff.fromVendorName || 'MIRROR'} → {handoff.toVendorName || 'MIRROR'}
              </span>
              {handoff.expectedArrivalDate && (
                <OverdueBadge expectedArrivalDate={handoff.expectedArrivalDate} />
              )}
            </div>
            <div className="pending-item-time">
              Initiated: {formatDateTime(handoff.initiatedAt)}
            </div>
          </div>
        ))}
        {items.length > 10 && (
          <div className="more-items">
            +{items.length - 10} more items
          </div>
        )}
      </div>
    );
  };

  // Pipeline View
  const PipelineView = () => (
    <div className="pipeline-container">
      <div className="pipeline-stage">
        <div className="pipeline-stage-header">
          <span className="stage-icon">📤</span>
          <h3>Initiated</h3>
          <span className="stage-count">{pendingByStatus[HANDOFF_STATUS.INITIATED]?.length || 0}</span>
        </div>
        <PendingItemsList status={HANDOFF_STATUS.INITIATED} />
      </div>

      <div className="pipeline-arrow">→</div>

      <div className="pipeline-stage">
        <div className="pipeline-stage-header">
          <span className="stage-icon">🚚</span>
          <h3>In Transit</h3>
          <span className="stage-count">{pendingByStatus[HANDOFF_STATUS.IN_TRANSIT]?.length || 0}</span>
        </div>
        <PendingItemsList status={HANDOFF_STATUS.IN_TRANSIT} />
      </div>

      <div className="pipeline-arrow">→</div>

      <div className="pipeline-stage completed">
        <div className="pipeline-stage-header">
          <span className="stage-icon">✅</span>
          <h3>Received</h3>
          <span className="stage-count">-</span>
        </div>
        <div className="empty-state small">
          <p>Completed handoffs archived</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="tracking-dashboard">
        <div className="page-header">
          <h1>Component Tracking</h1>
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracking-dashboard">
        <div className="page-header">
          <h1>Component Tracking</h1>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-dashboard">
      <div className="page-header">
        <div className="header-content">
          <h1>Component Tracking</h1>
          <p className="header-subtitle">Track component locations across production partners</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchDashboardData}>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Tab Navigation */}
      <div className="tracking-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Pipeline View
        </button>
        <button
          className={`tab-btn ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => handleTabChange('overdue')}
        >
          Overdue Items
          {stats.totalOverdue > 0 && (
            <span className="tab-badge danger">{stats.totalOverdue}</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tracking-content">
        {activeTab === 'overview' && <PipelineView />}
        {activeTab === 'overdue' && (
          <div className="overdue-section">
            <h2>Overdue Handoffs</h2>
            <p className="section-subtitle">
              Items that have passed their expected arrival date
            </p>
            <OverdueItemsTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentTrackingDashboard;
