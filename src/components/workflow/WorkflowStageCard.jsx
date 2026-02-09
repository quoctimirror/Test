import React from 'react';
import CapabilityBadge from './CapabilityBadge';
import './workflow.css';

/**
 * WorkflowStageCard - Draggable/moveable stage card for the stage builder
 *
 * @param {Object} props
 * @param {Object} props.stage - Stage data object
 * @param {number} props.index - Index in the stages array (0-based)
 * @param {number} props.totalStages - Total number of stages
 * @param {Function} props.onMoveUp - Handler for moving stage up
 * @param {Function} props.onMoveDown - Handler for moving stage down
 * @param {Function} props.onEdit - Handler for editing stage
 * @param {Function} props.onDelete - Handler for deleting stage
 * @param {boolean} props.disabled - Whether actions are disabled
 */
const WorkflowStageCard = ({
  stage,
  index,
  totalStages,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  disabled = false,
}) => {
  const stageNumber = index + 1;
  const isFirst = index === 0;
  const isLast = index === totalStages - 1;

  return (
    <div
      className={`workflow-stage-card ${stage.isFinalStage ? 'is-final' : ''}`}
      data-stage-id={stage.id}
    >
      {/* Order Handle with Up/Down Buttons */}
      <div className="stage-order-handle">
        <span className="stage-order-number">{stageNumber}</span>
        <div className="stage-order-buttons">
          <button
            type="button"
            className="stage-order-btn"
            onClick={() => onMoveUp(index)}
            disabled={disabled || isFirst}
            title="Move up"
            aria-label="Move stage up"
          >
            ^
          </button>
          <button
            type="button"
            className="stage-order-btn"
            onClick={() => onMoveDown(index)}
            disabled={disabled || isLast}
            title="Move down"
            aria-label="Move stage down"
          >
            v
          </button>
        </div>
      </div>

      {/* Stage Content */}
      <div className="stage-content">
        <div className="stage-header">
          <h4 className="stage-name">{stage.name || 'Unnamed Stage'}</h4>
          <div className="stage-badges">
            {stage.isFinalStage && (
              <span className="stage-final-badge">Final Stage</span>
            )}
          </div>
        </div>

        <div className="stage-meta">
          <div className="stage-meta-item">
            <span className="stage-meta-label">Capability:</span>
            <CapabilityBadge capability={stage.requiredCapability} size="sm" />
          </div>
          <div className="stage-meta-item">
            <span className="stage-meta-label">Duration:</span>
            <span className="stage-meta-value">
              {stage.estimatedDurationDays || 0} day{stage.estimatedDurationDays !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {stage.instructions && (
          <div className="stage-instructions">
            <div className="stage-instructions-label">Instructions:</div>
            {stage.instructions.length > 150
              ? `${stage.instructions.substring(0, 150)}...`
              : stage.instructions}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="stage-actions">
        <button
          type="button"
          className="admin-button admin-button-secondary admin-button-sm"
          onClick={() => onEdit(index)}
          disabled={disabled}
          title="Edit stage"
        >
          Edit
        </button>
        <button
          type="button"
          className="admin-button admin-button-danger admin-button-sm"
          onClick={() => onDelete(index)}
          disabled={disabled}
          title="Delete stage"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default WorkflowStageCard;
