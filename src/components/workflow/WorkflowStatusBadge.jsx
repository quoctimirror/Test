import React from 'react';
import { getStatusConfig } from '@services/workflowTemplateService';
import './workflow.css';

/**
 * WorkflowStatusBadge - Status badge for workflow templates
 *
 * @param {Object} props
 * @param {string} props.status - The status value (DRAFT, ACTIVE, ARCHIVED)
 * @param {string} props.size - Badge size: 'sm', 'md' (default)
 * @param {string} props.className - Additional CSS class
 */
const WorkflowStatusBadge = ({ status, size = 'md', className = '' }) => {
  if (!status) return null;

  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'workflow-status-badge-sm' : '';

  return (
    <span
      className={`workflow-status-badge ${sizeClass} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
};

export default WorkflowStatusBadge;
