import React, { useState, useEffect } from 'react';
import {
  componentOwnershipAPI,
  getHandoffStatusConfig,
  getHandoffTypeConfig,
  formatDateTime,
  formatDate,
  getArrivalStatusLabel,
  canConfirmReceipt,
  canRejectHandoff,
} from '@services/componentOwnershipService';
import './pending-receipts.css';

/**
 * PendingReceiptsPanel - Shows handoffs awaiting confirmation by a vendor
 * Features:
 * - List of pending receipts
 * - Confirm/Reject actions with modals
 * - Overdue highlighting
 */
const PendingReceiptsPanel = ({ vendorId, onReceiptConfirmed }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [selectedHandoff, setSelectedHandoff] = useState(null);
  const [actionType, setActionType] = useState(null); // 'confirm' or 'reject'
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
    rejectionReason: '',
  });

  // Fetch pending receipts
  useEffect(() => {
    if (vendorId) {
      fetchPendingReceipts();
    }
  }, [vendorId]);

  const fetchPendingReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await componentOwnershipAPI.getPendingReceipts(vendorId);
      setPendingReceipts(response.data || []);
    } catch (err) {
      console.error('Error fetching pending receipts:', err);
      setError('Failed to load pending receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClick = (handoff) => {
    setSelectedHandoff(handoff);
    setActionType('confirm');
    setFormData({ notes: '', rejectionReason: '' });
  };

  const handleRejectClick = (handoff) => {
    setSelectedHandoff(handoff);
    setActionType('reject');
    setFormData({ notes: '', rejectionReason: '' });
  };

  const handleCloseModal = () => {
    setSelectedHandoff(null);
    setActionType(null);
    setFormData({ notes: '', rejectionReason: '' });
  };

  const handleConfirmReceipt = async () => {
    if (!selectedHandoff) return;

    setActionLoading(true);
    try {
      await componentOwnershipAPI.confirmReceipt(selectedHandoff.id, {
        notes: formData.notes,
      });

      // Remove from list
      setPendingReceipts((prev) => prev.filter((h) => h.id !== selectedHandoff.id));
      handleCloseModal();

      // Callback
      if (onReceiptConfirmed) {
        onReceiptConfirmed(selectedHandoff);
      }
    } catch (err) {
      console.error('Error confirming receipt:', err);
      alert('Failed to confirm receipt: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReceipt = async () => {
    if (!selectedHandoff || !formData.rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await componentOwnershipAPI.rejectHandoff(selectedHandoff.id, {
        rejectionReason: formData.rejectionReason,
        notes: formData.notes,
      });

      // Remove from list
      setPendingReceipts((prev) => prev.filter((h) => h.id !== selectedHandoff.id));
      handleCloseModal();

      // Callback
      if (onReceiptConfirmed) {
        onReceiptConfirmed(selectedHandoff);
      }
    } catch (err) {
      console.error('Error rejecting handoff:', err);
      alert('Failed to reject handoff: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Status Badge
  const StatusBadge = ({ status }) => {
    const config = getHandoffStatusConfig(status);
    return (
      <span
        className="receipt-status-badge"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  // Overdue indicator
  const OverdueIndicator = ({ expectedArrivalDate }) => {
    const arrivalStatus = getArrivalStatusLabel(expectedArrivalDate);
    if (!arrivalStatus) return null;
    return (
      <span className="overdue-indicator" style={{ color: arrivalStatus.color }}>
        {arrivalStatus.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="pending-receipts-panel">
        <div className="panel-header">
          <h3>Pending Receipts</h3>
        </div>
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-receipts-panel">
        <div className="panel-header">
          <h3>Pending Receipts</h3>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchPendingReceipts}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-receipts-panel">
      <div className="panel-header">
        <h3>Pending Receipts</h3>
        <span className="receipt-count">{pendingReceipts.length}</span>
      </div>

      {pendingReceipts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No pending receipts</p>
        </div>
      ) : (
        <div className="receipts-list">
          {pendingReceipts.map((handoff) => {
            const typeConfig = getHandoffTypeConfig(handoff.handoffType);
            const isOverdue = handoff.isOverdue ||
              (handoff.expectedArrivalDate && new Date(handoff.expectedArrivalDate) < new Date());

            return (
              <div
                key={handoff.id}
                className={`receipt-card ${isOverdue ? 'overdue' : ''}`}
              >
                <div className="receipt-header">
                  <div className="receipt-order">
                    <span className="order-number">
                      {handoff.productionOrderNumber || handoff.productionOrderId}
                    </span>
                    <StatusBadge status={handoff.status} />
                  </div>
                  {handoff.expectedArrivalDate && (
                    <OverdueIndicator expectedArrivalDate={handoff.expectedArrivalDate} />
                  )}
                </div>

                <div className="receipt-details">
                  <div className="detail-row">
                    <span className="detail-label">From:</span>
                    <span className="detail-value">{handoff.fromVendorName || 'MIRROR'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                      {typeConfig.icon} {typeConfig.label}
                    </span>
                  </div>
                  {handoff.stageName && (
                    <div className="detail-row">
                      <span className="detail-label">Stage:</span>
                      <span className="detail-value">{handoff.stageName}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Initiated:</span>
                    <span className="detail-value">{formatDateTime(handoff.initiatedAt)}</span>
                  </div>
                  {handoff.trackingNumber && (
                    <div className="detail-row">
                      <span className="detail-label">Tracking:</span>
                      <span className="detail-value">
                        {handoff.shippingCarrier ? `${handoff.shippingCarrier}: ` : ''}
                        {handoff.trackingNumber}
                      </span>
                    </div>
                  )}
                  {handoff.reason && (
                    <div className="detail-row">
                      <span className="detail-label">Reason:</span>
                      <span className="detail-value">{handoff.reason}</span>
                    </div>
                  )}
                </div>

                <div className="receipt-actions">
                  {canConfirmReceipt(handoff) && (
                    <button
                      className="action-btn confirm"
                      onClick={() => handleConfirmClick(handoff)}
                    >
                      ✓ Confirm Receipt
                    </button>
                  )}
                  {canRejectHandoff(handoff) && (
                    <button
                      className="action-btn reject"
                      onClick={() => handleRejectClick(handoff)}
                    >
                      ✗ Reject
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Modal */}
      {selectedHandoff && actionType === 'confirm' && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Receipt</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Confirm receipt of component for order{' '}
                <strong>{selectedHandoff.productionOrderNumber}</strong> from{' '}
                <strong>{selectedHandoff.fromVendorName || 'MIRROR'}</strong>?
              </p>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about the received items..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmReceipt}
                disabled={actionLoading}
              >
                {actionLoading ? 'Confirming...' : 'Confirm Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedHandoff && actionType === 'reject' && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Handoff</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Reject handoff for order{' '}
                <strong>{selectedHandoff.productionOrderNumber}</strong> from{' '}
                <strong>{selectedHandoff.fromVendorName || 'MIRROR'}</strong>?
              </p>
              <div className="form-group">
                <label>Rejection Reason <span className="required">*</span></label>
                <textarea
                  value={formData.rejectionReason}
                  onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                  placeholder="Explain why you are rejecting this handoff..."
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>Additional Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional details..."
                  rows={2}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleRejectReceipt}
                disabled={actionLoading || !formData.rejectionReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Handoff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingReceiptsPanel;
