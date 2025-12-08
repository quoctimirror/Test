/**
 * Skeleton Loading Components
 * Reusable skeleton placeholders for loading states
 */

import React from 'react';

/**
 * Base skeleton element with shimmer animation
 */
export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className = '',
  style = {}
}) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius,
      ...style
    }}
  />
);

/**
 * Text line skeleton - simulates a line of text
 */
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`skeleton-text ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
        height="0.875rem"
        style={{ marginBottom: i < lines - 1 ? '0.5rem' : 0 }}
      />
    ))}
  </div>
);

/**
 * Stat card skeleton - for dashboard stat cards
 */
export const SkeletonStatCard = ({ className = '' }) => (
  <div className={`admin-card admin-p-lg ${className}`}>
    <Skeleton width="60%" height="0.75rem" style={{ marginBottom: '0.75rem' }} />
    <Skeleton width="40%" height="1.75rem" />
  </div>
);

/**
 * Stats grid skeleton - multiple stat cards in a grid
 */
export const SkeletonStatsGrid = ({ count = 4, className = '' }) => (
  <div className={`admin-stats-grid ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStatCard key={i} />
    ))}
  </div>
);

/**
 * Table row skeleton
 */
export const SkeletonTableRow = ({ columns = 5, className = '' }) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} style={{ padding: '1rem' }}>
        <Skeleton height="1rem" width={i === 0 ? '80%' : i === columns - 1 ? '60%' : '70%'} />
      </td>
    ))}
  </tr>
);

/**
 * Table skeleton - full table with header and rows
 */
export const SkeletonTable = ({ rows = 5, columns = 5, showHeader = true, className = '' }) => (
  <div className={`admin-table-wrapper ${className}`}>
    <table className="admin-table">
      {showHeader && (
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} style={{ padding: '1rem' }}>
                <Skeleton height="0.875rem" width="70%" />
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Card skeleton - for content cards
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`admin-card ${className}`} style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <Skeleton width="60px" height="60px" borderRadius="8px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="70%" height="1rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="50%" height="0.875rem" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);

/**
 * List skeleton - for list views
 */
export const SkeletonList = ({ items = 5, className = '' }) => (
  <div className={`skeleton-list ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonCard key={i} className="admin-mb-md" />
    ))}
  </div>
);

/**
 * Form skeleton - for form loading states
 */
export const SkeletonForm = ({ fields = 4, className = '' }) => (
  <div className={`skeleton-form ${className}`}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} style={{ marginBottom: '1.25rem' }}>
        <Skeleton width="30%" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton height="2.5rem" borderRadius="6px" />
      </div>
    ))}
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
      <Skeleton width="100px" height="2.25rem" borderRadius="6px" />
      <Skeleton width="80px" height="2.25rem" borderRadius="6px" />
    </div>
  </div>
);

/**
 * Dashboard loading skeleton - complete dashboard skeleton
 */
export const SkeletonDashboard = ({ className = '' }) => (
  <div className={className}>
    {/* Header skeleton */}
    <div style={{ marginBottom: '2rem' }}>
      <Skeleton width="200px" height="1.5rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="350px" height="1rem" />
    </div>

    {/* Stats grid skeleton */}
    <SkeletonStatsGrid count={4} className="admin-mb-lg" />

    {/* Table skeleton */}
    <div className="admin-card">
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--mirror-gray-200)' }}>
        <Skeleton width="150px" height="1.25rem" />
      </div>
      <SkeletonTable rows={5} columns={6} showHeader={true} />
    </div>
  </div>
);

/**
 * Inline loading text with animation
 */
export const LoadingDots = ({ text = 'Loading', className = '' }) => (
  <span className={`loading-dots ${className}`}>
    {text}<span className="loading-dots-animation">...</span>
  </span>
);

export default Skeleton;
