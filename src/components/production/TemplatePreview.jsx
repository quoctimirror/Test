import React from 'react';
import { CapabilityBadge } from '@components/workflow';
import { calculateTotalDuration, formatCategory } from '@services/workflowTemplateService';
import './production.css';

/**
 * TemplatePreview - Preview of workflow template stages for production plan form
 *
 * @param {Object} props
 * @param {Object} props.template - Workflow template data
 * @param {string} props.className - Additional CSS class
 */
const TemplatePreview = ({ template, className = '' }) => {
  if (!template) return null;

  const stages = template.stages || [];
  const totalDuration = calculateTotalDuration(stages);

  return (
    <div className={`template-preview ${className}`}>
      <h4 className="template-preview-title">
        Template Preview: {template.name}
      </h4>

      <div className="template-preview-meta">
        <span>Category: <strong>{formatCategory(template.category)}</strong></span>
        <span>Stages: <strong>{stages.length}</strong></span>
      </div>

      {stages.length > 0 && (
        <div className="template-preview-stages">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id || index}>
              {index > 0 && <span className="template-preview-arrow">-</span>}
              <div
                className={`template-preview-stage ${stage.isFinalStage ? 'is-final' : ''}`}
                title={stage.instructions || ''}
              >
                <span className="template-preview-stage-number">{index + 1}.</span>
                <span className="template-preview-stage-name">{stage.name}</span>
                <CapabilityBadge capability={stage.requiredCapability} size="sm" />
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="template-preview-total">
        Estimated Total Duration: <strong>{totalDuration} day{totalDuration !== 1 ? 's' : ''}</strong>
      </div>
    </div>
  );
};

export default TemplatePreview;
