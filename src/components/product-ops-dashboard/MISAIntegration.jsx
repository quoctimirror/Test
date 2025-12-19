import React, { useState, useEffect } from 'react';

/**
 * MISAIntegration - MISA ERP integration manager
 *
 * Steps 4-5 of Product Workflow
 * - Step 4: Request MISA SKU Creation
 * - Step 5: Monitor MISA SKU Sync Status
 *
 * Features:
 * - Send product data to MISA ERP
 * - Monitor sync status
 * - Display MISA SKU when received
 * - Handle sync failures and retries
 * - View sync history
 */

const MISAIntegration = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Filter options
  const filters = [
    { value: 'PENDING', label: 'Pending Request', count: 0 },
    { value: 'SYNCING', label: 'Syncing', count: 0 },
    { value: 'SYNCED', label: 'Synced', count: 0 },
    { value: 'FAILED', label: 'Failed', count: 0 },
    { value: 'ALL', label: 'All', count: 0 }
  ];

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // const response = await productOpsAPI.getMISAProducts(filter);
      // setProducts(response.data);

      // Mock data
      const mockProducts = [
        {
          id: 'prod-003',
          name: 'Pearl Drop Earrings',
          internalSKU: 'SKU-ER-2401-003',
          misaSKU: null,
          misaStatus: 'SYNCING',
          misaRequestedAt: '2024-01-16T10:00:00Z',
          misaRequestedBy: 'John Doe',
          misaLastAttempt: '2024-01-16T10:00:00Z',
          misaAttempts: 1,
          category: 'Earrings',
          thumbnail: '/api/placeholder/80/80'
        },
        {
          id: 'prod-004',
          name: 'Sapphire Pendant Necklace',
          internalSKU: 'SKU-NC-2401-004',
          misaSKU: null,
          misaStatus: 'PENDING',
          category: 'Necklaces',
          thumbnail: '/api/placeholder/80/80'
        },
        {
          id: 'prod-005',
          name: 'Gold Band Ring',
          internalSKU: 'SKU-RG-2401-005',
          misaSKU: null,
          misaStatus: 'FAILED',
          misaRequestedAt: '2024-01-15T14:00:00Z',
          misaRequestedBy: 'Jane Smith',
          misaLastAttempt: '2024-01-15T14:30:00Z',
          misaAttempts: 3,
          misaError: 'Connection timeout. MISA server did not respond.',
          category: 'Rings',
          thumbnail: '/api/placeholder/80/80'
        },
        {
          id: 'prod-002',
          name: 'Emerald Tennis Bracelet',
          internalSKU: 'SKU-BR-2401-002',
          misaSKU: 'MISA-BR-2401-002',
          misaStatus: 'SYNCED',
          misaRequestedAt: '2024-01-14T10:00:00Z',
          misaRequestedBy: 'John Doe',
          misaSyncedAt: '2024-01-15T12:00:00Z',
          misaAttempts: 1,
          category: 'Bracelets',
          thumbnail: '/api/placeholder/80/80'
        },
        {
          id: 'prod-001',
          name: 'Diamond Solitaire Ring',
          internalSKU: 'SKU-RG-2401-001',
          misaSKU: 'MISA-RG-2401-001',
          misaStatus: 'SYNCED',
          misaRequestedAt: '2024-01-13T09:00:00Z',
          misaRequestedBy: 'John Doe',
          misaSyncedAt: '2024-01-14T11:00:00Z',
          misaAttempts: 1,
          category: 'Rings',
          thumbnail: '/api/placeholder/80/80'
        }
      ];

      // Filter products
      const filtered = mockProducts.filter(p => {
        if (filter === 'ALL') return true;
        return p.misaStatus === filter;
      });

      setProducts(filtered);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request MISA SKU creation
   */
  const handleRequestMISASKU = async (productId) => {
    if (!window.confirm('Send this product to MISA ERP for SKU creation?')) return;

    try {
      // TODO: Implement actual API call
      // await productOpsAPI.requestMISASKU(productId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      alert('MISA SKU request sent successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error requesting MISA SKU:', error);
      alert('Failed to request MISA SKU. Please try again.');
    }
  };

  /**
   * Retry failed MISA sync
   */
  const handleRetrySync = async (productId) => {
    if (!window.confirm('Retry MISA SKU sync for this product?')) return;

    try {
      // TODO: Implement actual API call
      // await productOpsAPI.retryMISASync(productId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      alert('MISA sync retry initiated!');
      fetchProducts();
    } catch (error) {
      console.error('Error retrying MISA sync:', error);
      alert('Failed to retry MISA sync. Please try again.');
    }
  };

  /**
   * View sync history
   */
  const handleViewHistory = async (product) => {
    setSelectedProduct(product);

    try {
      // TODO: Implement actual API call
      // const response = await productOpsAPI.getMISAHistory(product.id);
      // setSyncHistory(response.data);

      // Mock history data
      const mockHistory = [
        {
          id: '1',
          timestamp: '2024-01-16T10:00:00Z',
          action: 'SYNC_REQUESTED',
          user: 'John Doe',
          status: 'SUCCESS',
          message: 'MISA sync request sent'
        },
        {
          id: '2',
          timestamp: '2024-01-16T10:00:15Z',
          action: 'SYNC_STARTED',
          user: 'MISA System',
          status: 'IN_PROGRESS',
          message: 'MISA processing started'
        }
      ];

      setSyncHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching sync history:', error);
      setSyncHistory([]);
    }
  };

  /**
   * Close history modal
   */
  const closeHistoryModal = () => {
    setSelectedProduct(null);
    setSyncHistory([]);
  };

  /**
   * Get status badge style
   */
  const getStatusBadgeStyle = (status) => {
    const styles = {
      PENDING: { backgroundColor: '#f1f5f9', color: '#475569' },
      SYNCING: { backgroundColor: '#dbeafe', color: '#1e40af' },
      SYNCED: { backgroundColor: '#dcfce7', color: '#166534' },
      FAILED: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || styles.PENDING;
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      SYNCING: '⚙️',
      SYNCED: '✓',
      FAILED: '⚠️'
    };
    return icons[status] || '?';
  };

  /**
   * Format date
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Calculate filter counts
  const filterCounts = {
    PENDING: products.filter(p => p.misaStatus === 'PENDING').length,
    SYNCING: products.filter(p => p.misaStatus === 'SYNCING').length,
    SYNCED: products.filter(p => p.misaStatus === 'SYNCED').length,
    FAILED: products.filter(p => p.misaStatus === 'FAILED').length,
    ALL: products.length
  };

  if (loading) {
    return (
      <div className="admin-empty-state">
        Loading MISA integration status...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
            MISA ERP Integration
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Manage MISA SKU creation and sync status
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchProducts}
            className="admin-button admin-button-secondary"
          >
            ⟳ Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '6px',
              border: filter === f.value ? 'none' : '1px solid #e2e8f0',
              backgroundColor: filter === f.value ? '#0f172a' : '#ffffff',
              color: filter === f.value ? '#ffffff' : '#0f172a',
              fontSize: '0.8125rem',
              fontWeight: filter === f.value ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {f.label}
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '10px',
              backgroundColor: filter === f.value ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {filterCounts[f.value] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="admin-empty-state">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
            No products found
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            {filter !== 'ALL' ? 'Try selecting a different filter.' : 'No products ready for MISA integration.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {products.map((product) => (
            <div key={product.id} className="admin-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Thumbnail */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Product Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name and Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {product.name}
                    </h3>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      ...getStatusBadgeStyle(product.misaStatus)
                    }}>
                      <span>{getStatusIcon(product.misaStatus)}</span>
                      {product.misaStatus}
                    </span>
                  </div>

                  {/* SKUs */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#64748b' }}>Internal SKU: </span>
                      <span style={{ color: '#0f172a', fontWeight: '500', fontFamily: 'monospace' }}>
                        {product.internalSKU}
                      </span>
                    </div>
                    {product.misaSKU && (
                      <div style={{ fontSize: '0.8125rem' }}>
                        <span style={{ color: '#64748b' }}>MISA SKU: </span>
                        <span style={{ color: '#10b981', fontWeight: '600', fontFamily: 'monospace' }}>
                          {product.misaSKU}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Details */}
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    marginBottom: '0.75rem'
                  }}>
                    {product.misaStatus === 'PENDING' && (
                      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        Ready to send to MISA ERP for SKU creation
                      </div>
                    )}

                    {product.misaStatus === 'SYNCING' && (
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div style={{ color: '#1e40af', marginBottom: '0.25rem' }}>
                          ⚙️ Sync in progress...
                        </div>
                        <div style={{ color: '#64748b' }}>
                          Requested: {formatDate(product.misaRequestedAt)} by {product.misaRequestedBy}
                        </div>
                        <div style={{ color: '#64748b' }}>
                          Last attempt: {formatTimeAgo(product.misaLastAttempt)} (Attempt #{product.misaAttempts})
                        </div>
                      </div>
                    )}

                    {product.misaStatus === 'SYNCED' && (
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div style={{ color: '#166534', marginBottom: '0.25rem' }}>
                          ✓ Successfully synced with MISA ERP
                        </div>
                        <div style={{ color: '#64748b' }}>
                          Synced: {formatDate(product.misaSyncedAt)}
                        </div>
                        <div style={{ color: '#64748b' }}>
                          Requested by: {product.misaRequestedBy}
                        </div>
                      </div>
                    )}

                    {product.misaStatus === 'FAILED' && (
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div style={{ color: '#991b1b', marginBottom: '0.25rem' }}>
                          ⚠️ Sync failed after {product.misaAttempts} attempts
                        </div>
                        <div style={{ color: '#991b1b', marginBottom: '0.25rem' }}>
                          Error: {product.misaError}
                        </div>
                        <div style={{ color: '#64748b' }}>
                          Last attempt: {formatDate(product.misaLastAttempt)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {product.misaStatus === 'PENDING' && (
                      <button
                        onClick={() => handleRequestMISASKU(product.id)}
                        className="admin-button admin-button-primary"
                        style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                      >
                        🔗 Request MISA SKU
                      </button>
                    )}

                    {product.misaStatus === 'FAILED' && (
                      <button
                        onClick={() => handleRetrySync(product.id)}
                        className="admin-button admin-button-primary"
                        style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                      >
                        ⟳ Retry Sync
                      </button>
                    )}

                    {product.misaRequestedAt && (
                      <button
                        onClick={() => handleViewHistory(product)}
                        className="admin-button admin-button-secondary"
                        style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                      >
                        📋 View History
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Modal */}
      {selectedProduct && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={closeHistoryModal}
          >
            {/* Modal */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
                    MISA Sync History
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                    {selectedProduct.name} • {selectedProduct.internalSKU}
                  </p>
                </div>
                <button
                  onClick={closeHistoryModal}
                  className="admin-button admin-button-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem' }}>
                {syncHistory.length === 0 ? (
                  <div className="admin-empty-state">
                    No sync history available
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {syncHistory.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          padding: '1rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          borderLeft: `3px solid ${entry.status === 'SUCCESS' ? '#10b981' : entry.status === 'FAILED' ? '#ef4444' : '#3b82f6'}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                            {entry.action.replace(/_/g, ' ')}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8125rem', color: '#64748b' }}>
                          {entry.message}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                          By: {entry.user}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MISAIntegration;
