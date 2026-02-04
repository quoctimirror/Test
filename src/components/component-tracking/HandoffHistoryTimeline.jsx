import React, { useState, useEffect } from 'react';
import {
  componentOwnershipAPI,
  formatHandoffForTimeline,
  groupHandoffsByDate,
  getHandoffStatusConfig,
  getHandoffTypeConfig,
  formatDateTime,
  formatDate,
  getArrivalStatusLabel,
} from '@services/componentOwnershipService';
import './handoff-timeline.css';

/**
 * HandoffHistoryTimeline - Visual timeline of component transfers for a production order
 * Features:
 * - Chronological display of handoffs
 * - Status indicators with color coding
 * - Expandable details for each handoff
 * - From/To vendor information
 */
const HandoffHistoryTimeline = ({ productionOrderId, onHandoffClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [handoffs, setHandoffs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (productionOrderId) {
      fetchHandoffHistory();
    }
  }, [productionOrderId]);

  const fetchHandoffHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await componentOwnershipAPI.getOrderHistory(productionOrderId);
      const formattedHandoffs = (response.data || []).map(formatHandoffForTimeline);
      setHandoffs(formattedHandoffs);
    } catch (err) {
      console.error('Error fetching handoff history:', err);
      setError('Failed to load handoff history');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Status Badge
  const StatusBadge = ({ status }) => {
    const config = getHandoffStatusConfig(status);
    return (
      <span
        className="timeline-status-badge"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  // Type Badge
  const TypeBadge = ({ handoffType }) => {
    const config = getHandoffTypeConfig(handoffType);
    return (
      <span className="timeline-type-badge" title={config.description}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Timeline Node
  const TimelineNode = ({ handoff, isLast }) => {
    const isExpanded = expandedId === handoff.id;
    const statusConfig = getHandoffStatusConfig(handoff.status);

    return (
      <div className={`timeline-node ${isLast ? 'last' : ''}`}>
        <div className="timeline-line">
          <div
            className="timeline-dot"
            style={{ backgroundColor: statusConfig.color }}
          />
        </div>

        <div
          className={`timeline-card ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleExpand(handoff.id)}
        >
          <div className="timeline-card-header">
            <div className="timeline-transfer">
              <span className="transfer-from">{handoff.fromLabel}</span>
              <span className="transfer-arrow">→</span>
              <span className="transfer-to">{handoff.toLabel}</span>
            </div>
            <StatusBadge status={handoff.status} />
          </div>

          <div className="timeline-card-meta">
            <TypeBadge handoffType={handoff.handoffType} />
            <span className="timeline-date">
              {formatDateTime(handoff.initiatedAt)}
            </span>
          </div>

          {isExpanded && (
            <div className="timeline-card-details">
              {handoff.stageName && (
                <div className="detail-item">
                  <span className="detail-label">Stage:</span>
                  <span className="detail-value">{handoff.stageName}</span>
                </div>
              )}

              {handoff.reason && (
                <div className="detail-item">
                  <span className="detail-label">Reason:</span>
                  <span className="detail-value">{handoff.reason}</span>
                </div>
              )}

              {handoff.trackingNumber && (
                <div className="detail-item">
                  <span className="detail-label">Tracking:</span>
                  <span className="detail-value">
                    {handoff.shippingCarrier && `${handoff.shippingCarrier}: `}
                    {handoff.trackingNumber}
                  </span>
                </div>
              )}

              {handoff.expectedArrivalDate && (
                <div className="detail-item">
                  <span className="detail-label">Expected:</span>
                  <span className="detail-value">
                    {formatDate(handoff.expectedArrivalDate)}
                    {handoff.isOverdue && (
                      <span className="overdue-tag">Overdue</span>
                    )}
                  </span>
                </div>
              )}

              {handoff.shippedAt && (
                <div className="detail-item">
                  <span className="detail-label">Shipped:</span>
                  <span className="detail-value">{formatDateTime(handoff.shippedAt)}</span>
                </div>
              )}

              {handoff.receivedAt && (
                <div className="detail-item">
                  <span className="detail-label">Received:</span>
                  <span className="detail-value">{formatDateTime(handoff.receivedAt)}</span>
                </div>
              )}

              {handoff.receivedByName && (
                <div className="detail-item">
                  <span className="detail-label">Received By:</span>
                  <span className="detail-value">{handoff.receivedByName}</span>
                </div>
              )}

              {handoff.notes && (
                <div className="detail-item full-width">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{handoff.notes}</span>
                </div>
              )}

              {handoff.rejectionReason && (
                <div className="detail-item full-width rejection">
                  <span className="detail-label">Rejection Reason:</span>
                  <span className="detail-value">{handoff.rejectionReason}</span>
                </div>
              )}

              {onHandoffClick && (
                <button
                  className="view-details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHandoffClick(handoff);
                  }}
                >
                  View Full Details
                </button>
              )}
            </div>
          )}

          <div className="expand-indicator">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="handoff-timeline">
        <div className="timeline-loading">
          <div className="loading-spinner"></div>
          <p>Loading handoff history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="handoff-timeline">
        <div className="timeline-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchHandoffHistory}>Retry</button>
        </div>
      </div>
    );
  }

  if (handoffs.length === 0) {
    return (
      <div className="handoff-timeline">
        <div className="timeline-empty">
          <span className="empty-icon">📋</span>
          <p>No handoff history yet</p>
          <span className="empty-subtitle">
            Handoffs will appear here once components are transferred
          </span>
        </div>
      </div>
    );
  }

  // Group handoffs by date
  const groupedHandoffs = groupHandoffsByDate(handoffs);

  return (
    <div className="handoff-timeline">
      <div className="timeline-header">
        <h3>Component Handoff History</h3>
        <span className="handoff-count">{handoffs.length} transfers</span>
      </div>

      <div className="timeline-content">
        {Object.entries(groupedHandoffs).map(([date, dateHandoffs]) => (
          <div key={date} className="timeline-date-group">
            <div className="date-label">{date}</div>
            {dateHandoffs.map((handoff, index) => (
              <TimelineNode
                key={handoff.id}
                handoff={handoff}
                isLast={
                  index === dateHandoffs.length - 1 &&
                  date === Object.keys(groupedHandoffs).pop()
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* Current Location Summary */}
      {handoffs.length > 0 && (
        <div className="current-location-summary">
          <span className="summary-label">Current Location:</span>
          <span className="summary-value">
            {handoffs[0].status === 'RECEIVED'
              ? handoffs[0].toLabel
              : handoffs[0].status === 'IN_TRANSIT'
              ? `In transit to ${handoffs[0].toLabel}`
              : handoffs[0].fromLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default HandoffHistoryTimeline;
