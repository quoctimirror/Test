import React from 'react';
import {
  getCapabilityLabel,
  getCapabilityColor,
} from '@services/workflowTemplateService';
import './workflow.css';

/**
 * CapabilityBadge - Colored badge for capability type display
 *
 * @param {Object} props
 * @param {string} props.capability - The capability type value
 * @param {string} props.size - Badge size: 'sm', 'md' (default), 'lg'
 * @param {string} props.className - Additional CSS class
 */
const CapabilityBadge = ({ capability, size = 'md', className = '' }) => {
  if (!capability) return null;

  const colorConfig = getCapabilityColor(capability);
  const label = getCapabilityLabel(capability);

  const sizeClass = size === 'sm' ? 'capability-badge-sm' : size === 'lg' ? 'capability-badge-lg' : '';

  return (
    <span
      className={`capability-badge ${sizeClass} ${className}`}
      style={{
        backgroundColor: colorConfig.bg,
        color: colorConfig.color,
      }}
    >
      {label}
    </span>
  );
};

export default CapabilityBadge;
