import React, { useState, useMemo } from 'react';
import { SkeletonTable } from './Skeleton';
import './AdminDashboard.css';

/**
 * AdminTable - Reusable table component with sorting, pagination, and filtering
 *
 * @param {Object} props
 * @param {Array} props.columns - Column definitions: [{ key, header, render?, sortable?, width?, align? }]
 * @param {Array} props.data - Array of data objects
 * @param {boolean} props.loading - Show loading skeleton
 * @param {string} props.emptyMessage - Message when no data
 * @param {string} props.emptySubtext - Subtext when no data
 * @param {Function} props.onRowClick - Row click handler (row) => void
 * @param {string} props.rowKey - Key for row identification (default: 'id')
 * @param {boolean} props.sortable - Enable sorting (default: true)
 * @param {boolean} props.paginated - Enable pagination (default: false)
 * @param {number} props.pageSize - Items per page (default: 10)
 * @param {number} props.totalCount - Total items (for server-side pagination)
 * @param {number} props.currentPage - Current page (for server-side pagination)
 * @param {Function} props.onPageChange - Page change handler (for server-side pagination)
 * @param {Function} props.getRowClass - Function to determine additional row classes
 * @param {string} props.className - Additional wrapper class
 * @param {boolean} props.compact - Use compact row padding
 * @param {boolean} props.striped - Enable alternating row colors
 * @param {boolean} props.hoverable - Enable row hover effect (default: true)
 * @param {number} props.skeletonRows - Number of skeleton rows (default: 5)
 * @param {number} props.skeletonColumns - Number of skeleton columns (default: based on columns)
 */
const AdminTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  emptySubtext = '',
  onRowClick,
  rowKey = 'id',
  sortable = true,
  paginated = false,
  pageSize = 10,
  totalCount,
  currentPage,
  onPageChange,
  getRowClass,
  className = '',
  compact = false,
  striped = false,
  hoverable = true,
  skeletonRows = 5,
  skeletonColumns
}) => {
  // Local sorting state (for client-side sorting)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Local pagination state (for client-side pagination)
  const [localPage, setLocalPage] = useState(0);

  // Determine if using server-side pagination
  const isServerPagination = typeof onPageChange === 'function';
  const activePage = isServerPagination ? currentPage : localPage;
  const activePageSize = pageSize;

  // Handle sorting
  const handleSort = (columnKey) => {
    if (!sortable) return;

    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort data (client-side only)
  const sortedData = useMemo(() => {
    if (!sortConfig.key || isServerPagination) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bVal == null) return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle strings
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [data, sortConfig, isServerPagination]);

  // Paginate data (client-side only)
  const paginatedData = useMemo(() => {
    if (!paginated || isServerPagination) return sortedData;

    const start = localPage * activePageSize;
    return sortedData.slice(start, start + activePageSize);
  }, [sortedData, paginated, localPage, activePageSize, isServerPagination]);

  // Calculate total pages
  const totalItems = isServerPagination ? totalCount : sortedData.length;
  const totalPages = Math.ceil(totalItems / activePageSize);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (isServerPagination) {
      onPageChange(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  // Get sort indicator
  const getSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Page info text
  const pageInfo = useMemo(() => {
    if (!paginated) return '';
    const start = activePage * activePageSize + 1;
    const end = Math.min(start + paginatedData.length - 1, totalItems);
    return totalItems > 0
      ? `Showing ${start}–${end} of ${totalItems}`
      : 'No items';
  }, [paginated, activePage, activePageSize, paginatedData.length, totalItems]);

  // Loading state
  if (loading) {
    return (
      <div className={`admin-table-wrapper ${className}`}>
        <SkeletonTable
          rows={skeletonRows}
          columns={skeletonColumns || columns.length || 5}
        />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`admin-table-wrapper ${className}`}>
        <div className="admin-empty-state">
          <p className="admin-empty-title">{emptyMessage}</p>
          {emptySubtext && <p className="admin-empty-subtext">{emptySubtext}</p>}
        </div>
      </div>
    );
  }

  // Table class names
  const tableClasses = [
    'admin-table',
    compact && 'admin-table-compact',
    striped && 'admin-table-striped',
    hoverable && 'admin-table-hoverable'
  ].filter(Boolean).join(' ');

  return (
    <div className={`admin-table-wrapper ${className}`}>
      <div className="admin-table-scroll">
        <table className={tableClasses}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSortable = sortable && col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    style={{
                      width: col.width,
                      textAlign: col.align || 'left',
                      cursor: isSortable ? 'pointer' : 'default'
                    }}
                    onClick={() => isSortable && handleSort(col.key)}
                    className={isSortable ? 'sortable' : ''}
                  >
                    <span className="admin-table-header-content">
                      {col.header}
                      {isSortable && (
                        <span className={`admin-table-sort-icon ${sortConfig.key === col.key ? 'active' : ''}`}>
                          {getSortIndicator(col.key)}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const rowClasses = [
                getRowClass ? getRowClass(row, index) : '',
                onRowClick ? 'clickable' : ''
              ].filter(Boolean).join(' ');

              return (
                <tr
                  key={row[rowKey] || index}
                  className={rowClasses}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="admin-table-footer">
          <span className="admin-table-page-info">{pageInfo}</span>
          <div className="admin-table-pagination">
            <button
              className="admin-button admin-button-secondary admin-button-sm"
              onClick={() => handlePageChange(0)}
              disabled={activePage === 0}
              title="First page"
            >
              ««
            </button>
            <button
              className="admin-button admin-button-secondary admin-button-sm"
              onClick={() => handlePageChange(Math.max(activePage - 1, 0))}
              disabled={activePage === 0}
            >
              Previous
            </button>
            <span className="admin-table-page-number">
              Page {activePage + 1} of {totalPages}
            </span>
            <button
              className="admin-button admin-button-secondary admin-button-sm"
              onClick={() => handlePageChange(Math.min(activePage + 1, totalPages - 1))}
              disabled={activePage >= totalPages - 1}
            >
              Next
            </button>
            <button
              className="admin-button admin-button-secondary admin-button-sm"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={activePage >= totalPages - 1}
              title="Last page"
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * StatusPill - Reusable status badge component
 */
export const StatusPill = ({ status, config }) => {
  const defaultConfig = {
    NEW: { bg: '#f1f5f9', color: '#475569' },
    PENDING: { bg: '#fef3c7', color: '#854d0e' },
    CONFIRMED: { bg: '#dcfce7', color: '#166534' },
    APPROVED: { bg: '#dcfce7', color: '#166534' },
    IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af' },
    IN_PRODUCTION: { bg: '#dbeafe', color: '#1e40af' },
    IN_TRANSIT: { bg: '#dbeafe', color: '#1e40af' },
    READY_FOR_DELIVERY: { bg: '#f3e8ff', color: '#6b21a8' },
    DELIVERED: { bg: '#f3e8ff', color: '#6b21a8' },
    COMPLETED: { bg: '#dcfce7', color: '#166534' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
    ACTIVE: { bg: '#dcfce7', color: '#166534' },
    INACTIVE: { bg: '#fee2e2', color: '#991b1b' },
    DRAFT: { bg: '#f1f5f9', color: '#475569' },
  };

  const statusConfig = config || defaultConfig;
  const style = statusConfig[status?.toUpperCase()] || statusConfig.PENDING;

  return (
    <span
      className="admin-status-pill"
      style={{
        backgroundColor: style.bg,
        color: style.color
      }}
    >
      {status}
    </span>
  );
};

/**
 * TableActions - Reusable action buttons wrapper
 */
export const TableActions = ({ children }) => (
  <div className="admin-table-actions">
    {children}
  </div>
);

/**
 * ActionButton - Compact action button for tables
 */
export const ActionButton = ({
  onClick,
  variant = 'secondary',
  disabled = false,
  children,
  title
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick && onClick(e);
    }}
    className={`admin-button admin-button-${variant} admin-button-sm`}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
);

export default AdminTable;
