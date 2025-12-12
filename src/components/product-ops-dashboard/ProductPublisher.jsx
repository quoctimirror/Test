import React, { useState, useEffect } from 'react';

/**
 * ProductPublisher - Final product review and publication
 *
 * Steps 6-7 of Product Workflow
 * - Step 6: Mark Product Ready (final review and approval)
 * - Step 7: Publish to Website (make product live)
 *
 * Features:
 * - Product preview
 * - Pre-publication checklist
 * - Publish/unpublish controls
 * - Schedule future publication
 * - Publication history
 */

const ProductPublisher = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('READY');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [publishModal, setPublishModal] = useState(null);

  // Filter options
  const filters = [
    { value: 'READY', label: 'Ready to Publish' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ALL', label: 'All' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // const response = await productOpsAPI.getPublishableProducts(filter);
      // setProducts(response.data);

      // Mock data
      const mockProducts = [
        {
          id: 'prod-002',
          name: 'Emerald Tennis Bracelet',
          internalSKU: 'SKU-BR-2401-002',
          misaSKU: 'MISA-BR-2401-002',
          status: 'READY',
          thumbnail: '/api/placeholder/120/120',
          imageUrls: ['/api/placeholder/400/400', '/api/placeholder/400/400'],
          shortDescription: 'Elegant emerald tennis bracelet in 18K white gold',
          description: 'A stunning tennis bracelet featuring high-quality emeralds...',
          category: 'Bracelets',
          collection: 'Luxury',
          specifications: {
            metal: '18K White Gold',
            gemstone: 'Emerald',
            weight: '15.2g',
            dimensions: '7 inches'
          },
          tags: ['emerald', 'tennis bracelet', 'luxury'],
          markedReadyAt: '2024-01-16T09:00:00Z',
          markedReadyBy: 'Jane Smith',
          checklist: {
            hasImages: true,
            hasDescription: true,
            hasMISASKU: true,
            hasSpecifications: true,
            hasCategory: true
          }
        },
        {
          id: 'prod-007',
          name: 'Amethyst Drop Earrings',
          internalSKU: 'SKU-ER-2401-007',
          misaSKU: 'MISA-ER-2401-007',
          status: 'READY',
          thumbnail: '/api/placeholder/120/120',
          imageUrls: ['/api/placeholder/400/400'],
          shortDescription: 'Beautiful amethyst drop earrings',
          description: 'Elegant drop earrings featuring deep purple amethysts...',
          category: 'Earrings',
          specifications: {
            metal: '14K Yellow Gold',
            gemstone: 'Amethyst'
          },
          tags: ['amethyst', 'earrings'],
          markedReadyAt: '2024-01-15T14:00:00Z',
          markedReadyBy: 'John Doe',
          checklist: {
            hasImages: true,
            hasDescription: true,
            hasMISASKU: true,
            hasSpecifications: true,
            hasCategory: true
          }
        },
        {
          id: 'prod-001',
          name: 'Diamond Solitaire Ring',
          internalSKU: 'SKU-RG-2401-001',
          misaSKU: 'MISA-RG-2401-001',
          status: 'PUBLISHED',
          thumbnail: '/api/placeholder/120/120',
          publishedAt: '2024-01-15T14:30:00Z',
          publishedBy: 'John Doe',
          category: 'Rings'
        },
        {
          id: 'prod-008',
          name: 'White Gold Chain',
          internalSKU: 'SKU-NC-2401-008',
          misaSKU: 'MISA-NC-2401-008',
          status: 'PUBLISHED',
          thumbnail: '/api/placeholder/120/120',
          publishedAt: '2024-01-14T10:00:00Z',
          publishedBy: 'Jane Smith',
          category: 'Necklaces'
        }
      ];

      // Filter products
      const filtered = mockProducts.filter(p => {
        if (filter === 'ALL') return true;
        return p.status === filter;
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
   * Open publish modal
   */
  const openPublishModal = (product) => {
    setPublishModal(product);
  };

  /**
   * Close publish modal
   */
  const closePublishModal = () => {
    setPublishModal(null);
  };

  /**
   * Publish product
   */
  const handlePublish = async (productId) => {
    try {
      // TODO: Implement actual API call
      // await productOpsAPI.publishProduct(productId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      alert('Product published successfully! 🎉');
      closePublishModal();
      fetchProducts();
    } catch (error) {
      console.error('Error publishing product:', error);
      alert('Failed to publish product. Please try again.');
    }
  };

  /**
   * Unpublish product
   */
  const handleUnpublish = async (productId) => {
    if (!window.confirm('Unpublish this product from the website?')) return;

    try {
      // TODO: Implement actual API call
      // await productOpsAPI.unpublishProduct(productId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      alert('Product unpublished successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error unpublishing product:', error);
      alert('Failed to unpublish product. Please try again.');
    }
  };

  /**
   * Mark product as ready
   */
  const handleMarkReady = async (productId) => {
    if (!window.confirm('Mark this product as ready for publication?')) return;

    try {
      // TODO: Implement actual API call
      // await productOpsAPI.markProductReady(productId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      alert('Product marked as ready!');
      fetchProducts();
    } catch (error) {
      console.error('Error marking product ready:', error);
      alert('Failed to mark product ready. Please try again.');
    }
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
   * Check if all checklist items are complete
   */
  const isChecklistComplete = (checklist) => {
    if (!checklist) return false;
    return Object.values(checklist).every(value => value === true);
  };

  if (loading) {
    return (
      <div className="admin-empty-state">
        Loading products...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
            Product Publisher
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Review, approve, and publish products to website
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
              transition: 'all 0.2s ease'
            }}
          >
            {f.label}
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
            {filter === 'READY' ? 'No products ready for publication.' : 'No published products.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {products.map((product) => (
            <div key={product.id} className="admin-card" style={{ padding: '1.25rem' }}>
              {/* Product Image */}
              <div style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                marginBottom: '1rem',
                overflow: 'hidden'
              }}>
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Product Info */}
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {product.name}
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  SKU: <span style={{ fontWeight: '500', fontFamily: 'monospace', color: '#475569' }}>
                    {product.internalSKU}
                  </span>
                </div>
                {product.misaSKU && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    MISA: <span style={{ fontWeight: '500', fontFamily: 'monospace', color: '#10b981' }}>
                      {product.misaSKU}
                    </span>
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Category: <span style={{ fontWeight: '500', color: '#475569' }}>{product.categoryName || "No Category"}</span>
                </div>
              </div>

              {/* Status */}
              {product.status === 'READY' && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  borderLeft: '3px solid #f59e0b'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: '#854d0e', marginBottom: '0.25rem', fontWeight: '500' }}>
                    ✓ Ready for Publication
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                    Marked ready: {formatDate(product.markedReadyAt)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                    By: {product.markedReadyBy}
                  </div>
                </div>
              )}

              {product.status === 'PUBLISHED' && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#dcfce7',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  borderLeft: '3px solid #10b981'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: '#166534', marginBottom: '0.25rem', fontWeight: '500' }}>
                    🚀 Live on Website
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                    Published: {formatDate(product.publishedAt)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                    By: {product.publishedBy}
                  </div>
                </div>
              )}

              {/* Checklist Preview (for ready products) */}
              {product.status === 'READY' && product.checklist && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Pre-Publication Checklist:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {Object.entries(product.checklist).map(([key, value]) => (
                      <div key={key} style={{ fontSize: '0.75rem', color: value ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>{value ? '✓' : '✗'}</span>
                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^has /, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {product.status === 'READY' && (
                  <>
                    <button
                      onClick={() => openPublishModal(product)}
                      className="admin-button admin-button-primary"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                      disabled={!isChecklistComplete(product.checklist)}
                    >
                      🚀 Publish to Website
                    </button>
                    <button
                      className="admin-button admin-button-secondary"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    >
                      👁️ Preview
                    </button>
                  </>
                )}

                {product.status === 'PUBLISHED' && (
                  <>
                    <button
                      className="admin-button admin-button-secondary"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    >
                      🔗 View Live
                    </button>
                    <button
                      onClick={() => handleUnpublish(product.id)}
                      className="admin-button admin-button-secondary"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    >
                      📥 Unpublish
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {publishModal && (
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
            onClick={closePublishModal}
          >
            {/* Modal */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
                  🚀 Publish Product to Website
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  {publishModal.name}
                </p>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem' }}>
                {/* Product Preview */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={publishModal.thumbnail}
                      alt={publishModal.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      {publishModal.internalSKU}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                      {publishModal.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {publishModal.category} • {publishModal.collection}
                    </div>
                  </div>
                </div>

                {/* Final Checklist */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#dcfce7',
                  borderRadius: '6px',
                  borderLeft: '3px solid #10b981',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534', marginBottom: '0.75rem' }}>
                    ✓ All Requirements Met
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {publishModal.checklist && Object.entries(publishModal.checklist).map(([key, value]) => (
                      <div key={key} style={{ fontSize: '0.8125rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span>✓</span>
                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^has /, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fffbeb',
                  borderRadius: '6px',
                  borderLeft: '3px solid #f59e0b',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: '#92400e', lineHeight: '1.6' }}>
                    <strong>⚠️ Before publishing:</strong>
                    <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
                      <li>Product will be visible to all website visitors</li>
                      <li>Price and inventory must be set in MISA</li>
                      <li>All product data has been verified</li>
                    </ul>
                  </div>
                </div>

                {/* Confirmation */}
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#0f172a', textAlign: 'center' }}>
                  Are you sure you want to publish this product?
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={closePublishModal}
                    className="admin-button admin-button-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePublish(publishModal.id)}
                    className="admin-button admin-button-primary"
                    style={{ flex: 1 }}
                  >
                    🚀 Publish Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPublisher;
