import React from 'react';

/**
 * ProductWorkflowTracker - Reusable 7-step product workflow checklist component
 *
 * Displays visual progress through product lifecycle:
 * 1. Generate Internal SKU
 * 2. Create Draft Product
 * 3. Fill Assets & Product Data
 * 4. Request MISA SKU Creation
 * 5. MISA SKU Synced
 * 6. Mark Product Ready
 * 7. Publish to Website
 */

const WORKFLOW_STEPS = [
  {
    id: 1,
    name: 'Generate Internal SKU',
    description: 'Auto-generate unique Mirror internal SKU',
    icon: '🔢'
  },
  {
    id: 2,
    name: 'Create Draft Product',
    description: 'Initialize product record in database',
    icon: '📝'
  },
  {
    id: 3,
    name: 'Fill Assets & Product Data',
    description: 'Upload images, videos, and write descriptions',
    icon: '📸'
  },
  {
    id: 4,
    name: 'Request MISA SKU Creation',
    description: 'Send product data to MISA ERP system',
    icon: '🔗'
  },
  {
    id: 5,
    name: 'MISA SKU Synced',
    description: 'Receive and validate MISA SKU',
    icon: '✓'
  },
  {
    id: 6,
    name: 'Mark Product Ready',
    description: 'Final review and approval',
    icon: '✓'
  },
  {
    id: 7,
    name: 'Publish to Website',
    description: 'Make product live on customer-facing website',
    icon: '🚀'
  }
];

const ProductWorkflowTracker = ({
  productId,
  productName,
  steps = [],
  currentStep = 1,
  onStepAction,
  compact = false
}) => {
  /**
   * Get step status from props
   * @param {number} stepId - Step ID (1-7)
   * @returns {object} Step data with status
   */
  const getStepData = (stepId) => {
    const stepConfig = WORKFLOW_STEPS.find(s => s.id === stepId);
    const stepData = steps.find(s => s.id === stepId) || {};

    return {
      ...stepConfig,
      ...stepData,
      isComplete: stepData.status === 'complete',
      isPending: stepData.status === 'pending' || (!stepData.status && stepId > currentStep),
      isCurrent: stepId === currentStep,
      isBlocked: stepData.status === 'blocked'
    };
  };

  /**
   * Calculate progress percentage
   */
  const calculateProgress = () => {
    const completedSteps = steps.filter(s => s.status === 'complete').length;
    return Math.round((completedSteps / 7) * 100);
  };

  /**
   * Format timestamp
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(timestamp);
  };

  const progress = calculateProgress();

  // Compact view (for cards/lists)
  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            flex: 1,
            height: '6px',
            backgroundColor: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: progress === 100 ? '#10b981' : '#3b82f6',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', minWidth: '45px' }}>
            {progress}%
          </span>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {WORKFLOW_STEPS.map((step) => {
            const stepData = getStepData(step.id);
            return (
              <div
                key={step.id}
                style={{
                  flex: 1,
                  height: '4px',
                  backgroundColor: stepData.isComplete ? '#10b981' : '#e2e8f0',
                  borderRadius: '2px',
                  transition: 'background-color 0.3s ease'
                }}
                title={step.name}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Full view (for detail pages)
  return (
    <div className="admin-card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
          Product Workflow {productName && `- ${productName}`}
        </h3>

        {/* Progress summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              height: '8px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: progress === 100 ? '#10b981' : '#3b82f6',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
            <span style={{ color: '#64748b' }}>
              Progress: <strong style={{ color: '#0f172a' }}>{progress}%</strong>
            </span>
            <span style={{ color: '#64748b' }}>
              Step: <strong style={{ color: '#0f172a' }}>{currentStep}/7</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Steps list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {WORKFLOW_STEPS.map((step, index) => {
          const stepData = getStepData(step.id);
          const isLast = index === WORKFLOW_STEPS.length - 1;

          return (
            <div key={step.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              {/* Step indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '32px' }}>
                {/* Icon/number circle */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  backgroundColor: stepData.isComplete ? '#10b981' : stepData.isCurrent ? '#3b82f6' : '#e2e8f0',
                  color: stepData.isComplete || stepData.isCurrent ? '#ffffff' : '#64748b',
                  transition: 'all 0.3s ease',
                  border: stepData.isCurrent ? '2px solid #93c5fd' : 'none'
                }}>
                  {stepData.isComplete ? '✓' : step.id}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '20px',
                    backgroundColor: stepData.isComplete ? '#10b981' : '#e2e8f0',
                    transition: 'background-color 0.3s ease'
                  }} />
                )}
              </div>

              {/* Step content */}
              <div style={{
                flex: 1,
                paddingBottom: isLast ? 0 : '1rem',
                opacity: stepData.isBlocked ? 0.5 : 1
              }}>
                {/* Step name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: stepData.isComplete ? '#10b981' : stepData.isCurrent ? '#3b82f6' : '#0f172a'
                  }}>
                    {step.name}
                  </h4>

                  {/* Status badge */}
                  {stepData.isComplete && (
                    <span style={{
                      fontSize: '0.6875rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '10px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      fontWeight: '500'
                    }}>
                      Complete
                    </span>
                  )}

                  {stepData.isCurrent && !stepData.isComplete && (
                    <span style={{
                      fontSize: '0.6875rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '10px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: '500'
                    }}>
                      Current Step
                    </span>
                  )}

                  {stepData.isBlocked && (
                    <span style={{
                      fontSize: '0.6875rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '10px',
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      fontWeight: '500'
                    }}>
                      Blocked
                    </span>
                  )}
                </div>

                {/* Step description */}
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  lineHeight: '1.5'
                }}>
                  {step.description}
                </p>

                {/* Step metadata */}
                {stepData.isComplete && (stepData.completedAt || stepData.completedBy) && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    padding: '0.5rem',
                    backgroundColor: '#f8fafb',
                    borderRadius: '4px',
                    borderLeft: '2px solid #10b981'
                  }}>
                    {stepData.completedAt && (
                      <div>
                        ✓ Completed: {formatDate(stepData.completedAt)} ({formatTimeAgo(stepData.completedAt)})
                      </div>
                    )}
                    {stepData.completedBy && (
                      <div>By: {stepData.completedBy}</div>
                    )}
                    {stepData.notes && (
                      <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
                        {stepData.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Action button for current/pending steps */}
                {!stepData.isComplete && stepData.isCurrent && stepData.actionButton && onStepAction && (
                  <button
                    onClick={() => onStepAction(step.id)}
                    className="admin-button admin-button-primary"
                    style={{ marginTop: '0.5rem', fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                    disabled={stepData.isBlocked}
                  >
                    {stepData.actionLabel || `Complete ${step.name}`}
                  </button>
                )}

                {/* Pending message */}
                {stepData.isPending && !stepData.isCurrent && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    padding: '0.5rem',
                    backgroundColor: '#f8fafb',
                    borderRadius: '4px'
                  }}>
                    {stepData.pendingMessage || `Waiting for previous steps to complete`}
                  </div>
                )}

                {/* Blocked message */}
                {stepData.isBlocked && stepData.blockReason && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#991b1b',
                    padding: '0.5rem',
                    backgroundColor: '#fee2e2',
                    borderRadius: '4px',
                    borderLeft: '2px solid #ef4444'
                  }}>
                    ⚠️ Blocked: {stepData.blockReason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated completion */}
      {progress < 100 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          borderLeft: '3px solid #3b82f6'
        }}>
          <div style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
            <strong>Estimated Time to Complete:</strong> {7 - Math.floor(progress / 100 * 7)} steps remaining
            {currentStep < 7 && ` • Next: ${WORKFLOW_STEPS[currentStep]?.name}`}
          </div>
        </div>
      )}

      {/* Completion message */}
      {progress === 100 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#dcfce7',
          borderRadius: '6px',
          borderLeft: '3px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎉</span>
          <div style={{ fontSize: '0.8125rem', color: '#166534' }}>
            <strong>Product workflow complete!</strong> This product is now live on the website.
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductWorkflowTracker;
