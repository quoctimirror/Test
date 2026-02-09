import React from 'react';
import { JTRC_STATUS_CONFIG } from '@services/jtrcService';

/**
 * JTRCStatusBadge - Status indicator badge for JTRC records
 *
 * @param {Object} props
 * @param {string} props.status - JTRC status (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ARCHIVED)
 * @param {string} props.size - Badge size: 'sm', 'md' (default), 'lg'
 * @param {boolean} props.showIcon - Whether to show status icon
 */
const JTRCStatusBadge = ({ status, size = 'md', showIcon = false }) => {
  const config = JTRC_STATUS_CONFIG[status] || {
    bg: '#f1f5f9',
    color: '#475569',
    label: status || 'Unknown',
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.6875rem' },
    md: { padding: '4px 10px', fontSize: '0.75rem' },
    lg: { padding: '6px 14px', fontSize: '0.8125rem' },
  };

  const getIcon = () => {
    switch (status) {
      case 'DRAFT':
        return '📝';
      case 'PENDING_APPROVAL':
        return '⏳';
      case 'APPROVED':
        return '✓';
      case 'REJECTED':
        return '✗';
      case 'ARCHIVED':
        return '📦';
      default:
        return '';
    }
  };

  return (
    <span
      className="jtrc-status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: config.bg,
        color: config.color,
        ...sizeStyles[size],
        borderRadius: '4px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        border: `1px solid ${config.color}20`,
      }}
    >
      {showIcon && <span>{getIcon()}</span>}
      {config.label}
    </span>
  );
};

export default JTRCStatusBadge;
