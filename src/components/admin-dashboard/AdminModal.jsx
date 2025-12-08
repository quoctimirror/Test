import React, { useEffect, useCallback } from 'react';
import './AdminDashboard.css';

/**
 * AdminModal - Reusable modal/dialog component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {boolean} props.closeOnOverlay - Close when clicking overlay (default: true)
 * @param {boolean} props.closeOnEscape - Close on Escape key (default: true)
 * @param {boolean} props.showCloseButton - Show close button (default: true)
 * @param {boolean} props.disabled - Disable close interactions (for loading states)
 * @param {React.ReactNode} props.footer - Optional footer content
 * @param {string} props.className - Additional modal class
 */
const AdminModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  disabled = false,
  footer,
  className = ''
}) => {
  // Handle Escape key
  const handleKeyDown = useCallback((e) => {
    if (closeOnEscape && e.key === 'Escape' && !disabled) {
      onClose();
    }
  }, [closeOnEscape, disabled, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && !disabled && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Size class mapping
  const sizeClasses = {
    sm: 'admin-modal-sm',
    md: '',
    lg: 'admin-modal-lg',
    xl: 'admin-modal-xl'
  };

  const modalSizeClass = sizeClasses[size] || '';

  return (
    <div className="admin-modal-overlay" onClick={handleOverlayClick}>
      <div
        className={`admin-modal ${modalSizeClass} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="admin-modal-header">
            {title && <h3 id="modal-title">{title}</h3>}
            {showCloseButton && (
              <button
                type="button"
                className="admin-modal-close"
                onClick={onClose}
                disabled={disabled}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="admin-modal-content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="admin-modal-footer-section">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ConfirmDialog - Reusable confirmation dialog
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Function} props.onClose - Close/cancel handler
 * @param {Function} props.onConfirm - Confirm handler
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Confirmation message
 * @param {string} props.confirmText - Confirm button text (default: 'Confirm')
 * @param {string} props.cancelText - Cancel button text (default: 'Cancel')
 * @param {string} props.variant - Confirm button variant: 'primary', 'danger' (default: 'primary')
 * @param {boolean} props.loading - Show loading state on confirm button
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false
}) => {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      disabled={loading}
      footer={
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`admin-button admin-button-${variant === 'danger' ? 'danger' : 'primary'}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      }
    >
      <p className="admin-confirm-message">{message}</p>
    </AdminModal>
  );
};

/**
 * FormModal - Modal wrapper for forms
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Form fields
 * @param {string} props.submitText - Submit button text (default: 'Save')
 * @param {string} props.cancelText - Cancel button text (default: 'Cancel')
 * @param {boolean} props.loading - Show loading state
 * @param {string} props.size - Modal size
 * @param {string} props.error - Error message to display
 */
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  size = 'md',
  error
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      onSubmit(e);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      disabled={loading}
    >
      <form onSubmit={handleSubmit} className="admin-modal-form">
        <div className="admin-modal-form-body">
          {children}
        </div>

        {error && (
          <div className="admin-modal-error">
            {error}
          </div>
        )}

        <div className="admin-modal-form-footer">
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className="admin-button admin-button-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : submitText}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

/**
 * AlertDialog - Simple alert dialog with single action
 */
export const AlertDialog = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  buttonText = 'OK',
  variant = 'primary'
}) => (
  <AdminModal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <div className="admin-modal-actions admin-modal-actions-center">
        <button
          type="button"
          className={`admin-button admin-button-${variant}`}
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    }
  >
    <p className="admin-alert-message">{message}</p>
  </AdminModal>
);

export default AdminModal;
