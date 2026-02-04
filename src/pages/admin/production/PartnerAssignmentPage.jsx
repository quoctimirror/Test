import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  productionOrderAPI,
  stageAPI,
  partnerAPI,
  STAGE_STATUS,
  getOrderStatusConfig,
  getStageStatusConfig,
  getCapabilityConfig,
  canAssignVendor,
  formatCurrency,
  formatDate,
} from '@services/productionOrderService';
import { SkeletonTable } from '@components/admin-dashboard/Skeleton';
import '@components/production/production.css';

/**
 * PartnerAssignmentPage - Assign vendors/partners to production order stages
 * Features: Stage list, vendor selection by capability, bulk assignment, cost estimate
 */
const PartnerAssignmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Order data
  const [order, setOrder] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);

  // Assignment state
  const [assignments, setAssignments] = useState({}); // stageId -> { vendorId, estimatedCost, notes }
  const [vendorsByCapability, setVendorsByCapability] = useState({}); // capabilityType -> vendors[]
  const [loadingVendors, setLoadingVendors] = useState({});

  // Modal state for vendor selection
  const [selectedStage, setSelectedStage] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  // Fetch order details
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await productionOrderAPI.getById(orderId);
      setOrder(response.data);

      // Initialize assignments from existing stage data
      const existingAssignments = {};
      response.data.stages?.forEach((stage) => {
        if (stage.assignedVendorId) {
          existingAssignments[stage.id] = {
            vendorId: stage.assignedVendorId,
            vendorName: stage.assignedVendorName,
            estimatedCost: stage.estimatedCost,
            notes: stage.notes,
          };
        }
      });
      setAssignments(existingAssignments);

      // Fetch cost estimate
      fetchCostEstimate();
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load production order');
    } finally {
      setLoading(false);
    }
  };

  const fetchCostEstimate = async () => {
    try {
      const response = await productionOrderAPI.getCostEstimate(orderId);
      setCostEstimate(response.data);
    } catch (err) {
      console.error('Error fetching cost estimate:', err);
    }
  };

  // Fetch vendors for a capability type
  const fetchVendorsForCapability = useCallback(async (capabilityType) => {
    if (vendorsByCapability[capabilityType]) return;

    setLoadingVendors((prev) => ({ ...prev, [capabilityType]: true }));
    try {
      const response = await partnerAPI.getByCapability(capabilityType);
      setVendorsByCapability((prev) => ({
        ...prev,
        [capabilityType]: response.data || [],
      }));
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoadingVendors((prev) => ({ ...prev, [capabilityType]: false }));
    }
  }, [vendorsByCapability]);

  // Open vendor selection modal
  const handleSelectVendor = (stage) => {
    setSelectedStage(stage);
    setShowVendorModal(true);
    if (stage.requiredCapability) {
      fetchVendorsForCapability(stage.requiredCapability);
    }
  };

  // Assign vendor to stage
  const handleAssignVendor = (stage, vendor) => {
    setAssignments((prev) => ({
      ...prev,
      [stage.id]: {
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        estimatedCost: vendor.costPerPiece || null,
        notes: '',
      },
    }));
    setShowVendorModal(false);
    setSelectedStage(null);
  };

  // Remove vendor assignment
  const handleRemoveAssignment = (stageId) => {
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[stageId];
      return newAssignments;
    });
  };

  // Save all assignments (bulk assign)
  const handleSaveAssignments = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Build assignments array for stages that have new/changed assignments
      const assignmentsToSave = Object.entries(assignments)
        .filter(([stageId, assignment]) => {
          const stage = order.stages.find((s) => s.id === stageId);
          // Only include if changed from existing
          return stage && stage.assignedVendorId !== assignment.vendorId;
        })
        .map(([stageId, assignment]) => ({
          stageId,
          vendorId: assignment.vendorId,
          estimatedCost: assignment.estimatedCost,
          notes: assignment.notes,
        }));

      if (assignmentsToSave.length === 0) {
        setSuccessMessage('No changes to save');
        setSaving(false);
        return;
      }

      const response = await stageAPI.bulkAssign(orderId, assignmentsToSave);

      if (response.data.failedCount > 0) {
        setError(
          `${response.data.successCount} assignments saved, ${response.data.failedCount} failed`
        );
      } else {
        setSuccessMessage(`Successfully assigned ${response.data.successCount} vendors`);
      }

      // Refresh order data
      fetchOrder();
    } catch (err) {
      console.error('Error saving assignments:', err);
      setError('Failed to save assignments. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Navigate back
  const handleBack = () => {
    navigate('/dashboard/admin?tab=production-orders');
  };

  // Stage row component
  const StageRow = ({ stage, index }) => {
    const statusConfig = getStageStatusConfig(stage.status);
    const capabilityConfig = stage.requiredCapability
      ? getCapabilityConfig(stage.requiredCapability)
      : null;
    const assignment = assignments[stage.id];
    const isAssignable = canAssignVendor(stage);

    return (
      <tr className={!isAssignable ? 'stage-row-disabled' : ''}>
        <td>
          <div className="stage-order-badge">{stage.stageOrder}</div>
        </td>
        <td>
          <strong>{stage.stageName}</strong>
        </td>
        <td>
          {capabilityConfig ? (
            <span className="capability-badge">
              <span className="capability-icon">{capabilityConfig.icon}</span>
              {capabilityConfig.label}
            </span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td>
          <span
            className="stage-status-badge"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            {statusConfig.icon} {statusConfig.label}
          </span>
        </td>
        <td>
          {assignment ? (
            <div className="assigned-vendor">
              <span className="vendor-name">{assignment.vendorName}</span>
              {isAssignable && (
                <button
                  className="remove-assignment-btn"
                  onClick={() => handleRemoveAssignment(stage.id)}
                  title="Remove assignment"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <span className="text-muted">Not assigned</span>
          )}
        </td>
        <td>{assignment?.estimatedCost ? formatCurrency(assignment.estimatedCost) : '-'}</td>
        <td>
          {isAssignable && (
            <button
              className="admin-button admin-button-sm admin-button-secondary"
              onClick={() => handleSelectVendor(stage)}
            >
              {assignment ? 'Change' : 'Assign'}
            </button>
          )}
        </td>
      </tr>
    );
  };

  // Vendor selection modal
  const VendorSelectionModal = () => {
    if (!showVendorModal || !selectedStage) return null;

    const vendors = vendorsByCapability[selectedStage.requiredCapability] || [];
    const isLoading = loadingVendors[selectedStage.requiredCapability];
    const capabilityConfig = getCapabilityConfig(selectedStage.requiredCapability);

    return (
      <div className="modal-overlay" onClick={() => setShowVendorModal(false)}>
        <div className="modal-content vendor-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Select Vendor for Stage {selectedStage.stageOrder}</h2>
            <button className="modal-close" onClick={() => setShowVendorModal(false)}>
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="vendor-modal-info">
              <strong>Stage:</strong> {selectedStage.stageName}
              <br />
              <strong>Required Capability:</strong>{' '}
              <span className="capability-badge">
                {capabilityConfig?.icon} {capabilityConfig?.label}
              </span>
            </div>

            {isLoading ? (
              <div className="loading-vendors">Loading available vendors...</div>
            ) : vendors.length === 0 ? (
              <div className="no-vendors">
                No vendors found with the required capability.
              </div>
            ) : (
              <div className="vendor-list">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.vendorId}
                    className="vendor-card"
                    onClick={() => handleAssignVendor(selectedStage, vendor)}
                  >
                    <div className="vendor-card-header">
                      <strong>{vendor.vendorName}</strong>
                      {vendor.qualityRating && (
                        <span className="quality-rating">
                          {'★'.repeat(Math.round(vendor.qualityRating))}
                        </span>
                      )}
                    </div>
                    <div className="vendor-card-details">
                      {vendor.leadTimeDays && (
                        <span>Lead time: {vendor.leadTimeDays} days</span>
                      )}
                      {vendor.costPerPiece && (
                        <span>Cost: {formatCurrency(vendor.costPerPiece)}/pc</span>
                      )}
                      {vendor.costPerGram && (
                        <span>Cost: {formatCurrency(vendor.costPerGram)}/g</span>
                      )}
                    </div>
                    {vendor.country && (
                      <div className="vendor-card-location">{vendor.country}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="partner-assignment-page">
        <div className="admin-card admin-p-lg">
          <SkeletonTable rows={8} columns={7} />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="partner-assignment-page">
        <div className="admin-error-state">Order not found</div>
      </div>
    );
  }

  const orderStatusConfig = getOrderStatusConfig(order.status);
  const assignedCount = Object.keys(assignments).length;
  const totalStages = order.stages?.length || 0;

  return (
    <div className="partner-assignment-page">
      {/* Header */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <div className="assignment-header">
          <div className="assignment-header-left">
            <button onClick={handleBack} className="production-back-link">
              Back to Production Orders
            </button>
            <h1>Partner Assignment</h1>
            <div className="order-info">
              <span className="order-number">{order.orderNumber}</span>
              <span
                className="order-status"
                style={{ backgroundColor: orderStatusConfig.bg, color: orderStatusConfig.color }}
              >
                {orderStatusConfig.label}
              </span>
            </div>
          </div>
          <div className="assignment-header-right">
            <div className="assignment-progress-summary">
              <span className="progress-label">Assignment Progress:</span>
              <span className="progress-value">
                {assignedCount} / {totalStages} stages
              </span>
              <div className="progress-bar-small" style={{ width: '120px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${totalStages > 0 ? (assignedCount / totalStages) * 100 : 0}%`,
                    backgroundColor: assignedCount === totalStages ? '#10b981' : '#4f8cff',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="admin-error-state admin-mb-lg">{error}</div>}
      {successMessage && (
        <div className="admin-success-state admin-mb-lg">{successMessage}</div>
      )}

      {/* Cost Estimate Summary */}
      {costEstimate && (
        <div className="admin-card admin-p-lg admin-mb-lg">
          <h3 className="production-section-title">Cost Estimate</h3>
          <div className="cost-estimate-summary">
            <div className="cost-stat">
              <span className="cost-label">Total Estimated</span>
              <span className="cost-value">
                {formatCurrency(costEstimate.totalEstimatedCost)}
              </span>
            </div>
            <div className="cost-stat">
              <span className="cost-label">Stages with Estimate</span>
              <span className="cost-value">
                {costEstimate.stagesWithEstimate} / {costEstimate.totalStages}
              </span>
            </div>
            {costEstimate.totalActualCost && (
              <div className="cost-stat">
                <span className="cost-label">Total Actual</span>
                <span className="cost-value">
                  {formatCurrency(costEstimate.totalActualCost)}
                </span>
              </div>
            )}
          </div>
          {costEstimate.notes && (
            <p className="cost-notes">{costEstimate.notes}</p>
          )}
        </div>
      )}

      {/* Stages Table */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <h3 className="production-section-title">Production Stages</h3>
        <p className="production-section-subtitle">
          Assign vendors to each stage based on their capabilities. Vendors must have the required
          capability to be assigned.
        </p>

        <div className="admin-table-wrapper">
          <table className="admin-table stages-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Stage Name</th>
                <th>Required Capability</th>
                <th>Status</th>
                <th>Assigned Vendor</th>
                <th>Est. Cost</th>
                <th style={{ width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {order.stages?.map((stage, index) => (
                <StageRow key={stage.id} stage={stage} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="admin-card admin-p-lg">
        <div className="assignment-footer">
          <button
            className="admin-button admin-button-secondary"
            onClick={handleBack}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="admin-button admin-button-primary"
            onClick={handleSaveAssignments}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>

      {/* Vendor Selection Modal */}
      <VendorSelectionModal />
    </div>
  );
};

export default PartnerAssignmentPage;
