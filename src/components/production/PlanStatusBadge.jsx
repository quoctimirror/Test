import React from 'react';
import { getStatusConfig } from '@services/productionPlanService';
import './production.css';

/**
 * PlanStatusBadge - Status badge for production plans
 *
 * @param {Object} props
 * @param {string} props.status - The status value
 * @param {string} props.size - Badge size: 'sm', 'md' (default)
 * @param {string} props.className - Additional CSS class
 */
const PlanStatusBadge = ({ status, size = 'md', className = '' }) => {
  if (!status) return null;

  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'plan-status-badge-sm' : '';

  return (
    <span
      className={`plan-status-badge ${sizeClass} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
};

export default PlanStatusBadge;
