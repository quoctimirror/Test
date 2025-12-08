import React from 'react';
import './AdminDashboard.css';

/**
 * EmptyState - Reusable empty state component
 *
 * @param {Object} props
 * @param {string} props.title - Main message (default: 'No data found')
 * @param {string} props.message - Secondary message/instructions
 * @param {React.ReactNode} props.action - Optional action button/link
 * @param {string} props.icon - Optional icon character/emoji
 * @param {string} props.variant - Style variant: 'default', 'compact', 'card' (default: 'default')
 * @param {string} props.className - Additional class names
 */
export const EmptyState = ({
  title = 'No data found',
  message,
  action,
  icon,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'admin-empty-state',
    compact: 'admin-empty-state admin-empty-state-compact',
    card: 'admin-empty-state admin-empty-state-card'
  };

  return (
    <div className={`${variantClasses[variant] || variantClasses.default} ${className}`.trim()}>
      {icon && <div className="admin-empty-icon">{icon}</div>}
      <h3 className="admin-empty-title">{title}</h3>
      {message && <p className="admin-empty-message">{message}</p>}
      {action && <div className="admin-empty-action">{action}</div>}
    </div>
  );
};

/**
 * ErrorState - Reusable error state component
 *
 * @param {Object} props
 * @param {string} props.title - Error title (default: 'Something went wrong')
 * @param {string} props.message - Error message/details
 * @param {Function} props.onRetry - Retry handler
 * @param {string} props.retryText - Retry button text (default: 'Try Again')
 * @param {string} props.variant - Style variant: 'default', 'inline', 'banner' (default: 'default')
 * @param {string} props.className - Additional class names
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'admin-error-state',
    inline: 'admin-error-state admin-error-state-inline',
    banner: 'admin-error-banner'
  };

  return (
    <div className={`${variantClasses[variant] || variantClasses.default} ${className}`.trim()}>
      <div className="admin-error-content">
        <h3 className="admin-error-title">{title}</h3>
        {message && <p className="admin-error-message">{message}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          className="admin-button admin-button-secondary admin-button-sm"
          onClick={onRetry}
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

/**
 * InfoBanner - Reusable info/warning banner
 *
 * @param {Object} props
 * @param {string} props.title - Banner title
 * @param {string} props.message - Banner message
 * @param {string} props.variant - Style variant: 'info', 'warning', 'success', 'error' (default: 'info')
 * @param {Function} props.onDismiss - Optional dismiss handler
 * @param {React.ReactNode} props.action - Optional action element
 * @param {string} props.className - Additional class names
 */
export const InfoBanner = ({
  title,
  message,
  variant = 'info',
  onDismiss,
  action,
  className = ''
}) => {
  const variantClasses = {
    info: 'admin-banner admin-banner-info',
    warning: 'admin-banner admin-banner-warning',
    success: 'admin-banner admin-banner-success',
    error: 'admin-banner admin-banner-error'
  };

  return (
    <div className={`${variantClasses[variant] || variantClasses.info} ${className}`.trim()}>
      <div className="admin-banner-content">
        {title && <h4 className="admin-banner-title">{title}</h4>}
        {message && <p className="admin-banner-message">{message}</p>}
        {action && <div className="admin-banner-action">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="admin-banner-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

/**
 * LoadingState - Reusable loading state component
 *
 * @param {Object} props
 * @param {string} props.message - Loading message (default: 'Loading...')
 * @param {string} props.variant - Style variant: 'default', 'inline', 'overlay' (default: 'default')
 * @param {string} props.className - Additional class names
 */
export const LoadingState = ({
  message = 'Loading...',
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'admin-loading-state',
    inline: 'admin-loading-state admin-loading-state-inline',
    overlay: 'admin-loading-overlay'
  };

  return (
    <div className={`${variantClasses[variant] || variantClasses.default} ${className}`.trim()}>
      <div className="admin-loading-spinner" />
      <p className="admin-loading-message">{message}</p>
    </div>
  );
};

/**
 * NoResultsState - Specialized empty state for search/filter results
 *
 * @param {Object} props
 * @param {string} props.searchTerm - The search term that returned no results
 * @param {Function} props.onClear - Clear filters handler
 * @param {string} props.clearText - Clear button text (default: 'Clear filters')
 */
export const NoResultsState = ({
  searchTerm,
  onClear,
  clearText = 'Clear filters'
}) => (
  <EmptyState
    title="No results found"
    message={
      searchTerm
        ? `No matches for "${searchTerm}". Try adjusting your search or filters.`
        : 'Try adjusting your filters to find what you\'re looking for.'
    }
    action={
      onClear && (
        <button
          type="button"
          className="admin-button admin-button-secondary admin-button-sm"
          onClick={onClear}
        >
          {clearText}
        </button>
      )
    }
    variant="compact"
  />
);

/**
 * SuccessState - Success confirmation state
 *
 * @param {Object} props
 * @param {string} props.title - Success title (default: 'Success!')
 * @param {string} props.message - Success message
 * @param {React.ReactNode} props.action - Optional action button
 */
export const SuccessState = ({
  title = 'Success!',
  message,
  action
}) => (
  <div className="admin-success-state">
    <div className="admin-success-icon">✓</div>
    <h3 className="admin-success-title">{title}</h3>
    {message && <p className="admin-success-message">{message}</p>}
    {action && <div className="admin-success-action">{action}</div>}
  </div>
);

export default {
  EmptyState,
  ErrorState,
  InfoBanner,
  LoadingState,
  NoResultsState,
  SuccessState
};
