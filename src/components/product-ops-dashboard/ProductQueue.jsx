import React, { useState, useEffect } from 'react';
import ProductWorkflowTracker from './ProductWorkflowTracker';

/**
 * ProductQueue - Kanban board view for product workflow
 *
 * Displays products in columns based on workflow stage:
 * - Draft: Steps 1-2 (SKU generation, draft creation)
 * - In Progress: Steps 3-4 (Assets filling, MISA request)
 * - Ready: Steps 5-6 (MISA synced, marked ready)
 * - Published: Step 7 (Live on website)
 */

const ProductQueue = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Kanban columns configuration
  const columns = [
    {
      id: 'DRAFT',
      title: 'Draft',
      description: 'New products being set up',
      icon: '📝',
      color: '#64748b',
      bgColor: '#f8fafc'
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      description: 'Assets & MISA integration',
      icon: '⚙️',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      id: 'READY',
      title: 'Ready',
      description: 'Awaiting publication',
      icon: '✓',
      color: '#f59e0b',
      bgColor: '#fffbeb'
    },
    {
      id: 'PUBLISHED',
      title: 'Published',
      description: 'Live on website',
      icon: '🚀',
      color: '#10b981',
      bgColor: '#f0fdf4'
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // const response = await productOpsAPI.getAllProducts();
      // setProducts(response.data);

      // Mock data
      const mockProducts = [
        {
          id: 'prod-001',
          name: 'Diamond Solitaire Ring',
          internalSKU: 'SKU-2024-001',
          misaSKU: 'MISA-DR-001',
          thumbnail: '/api/placeholder/120/120',
          currentStep: 7,
          status: 'PUBLISHED',
          createdAt: '2024-01-10T10:00:00Z',
          steps: [
            { id: 1, status: 'complete' },
            { id: 2, status: 'complete' },
            { id: 3, status: 'complete' },
            { id: 4, status: 'complete' },
            { id: 5, status: 'complete' },
            { id: 6, status: 'complete' },
            { id: 7, status: 'complete' }
          ]
        },
        {
          id: 'prod-002',
          name: 'Emerald Tennis Bracelet',
          internalSKU: 'SKU-2024-002',
          misaSKU: 'MISA-BR-002',
          thumbnail: '/api/placeholder/120/120',
          currentStep: 6,
          status: 'READY',
          createdAt: '2024-01-12T09:00:00Z',
          steps: [
            { id: 1, status: 'complete' },
            { id: 2, status: 'complete' },
            { id: 3, status: 'complete' },
            { id: 4, status: 'complete' },
            { id: 5, status: 'complete' },
            { id: 6, status: 'complete' },
            { id: 7, status: 'pending' }
          ]
        },
        {
          id: 'prod-003',
          name: 'Pearl Drop Earrings',
          internalSKU: 'SKU-2024-003',
          misaSKU: null,
          thumbnail: '/api/placeholder/120/120',
          currentStep: 5,
          status: 'IN_PROGRESS',
          createdAt: '2024-01-14T11:00:00Z',
          steps: [
            { id: 1, status: 'complete' },
            { id: 2, status: 'complete' },
            { id: 3, status: 'complete' },
            { id: 4, status: 'complete' },
            { id: 5, status: 'pending' },
            { id: 6, status: 'pending' },
            { id: 7, status: 'pending' }
          ]
        },
        {
          id: 'prod-004',
          name: 'Sapphire Pendant Necklace',
          internalSKU: 'SKU-2024-004',
          misaSKU: null,
          thumbnail: '/api/placeholder/120/120',
          currentStep: 3,
          status: 'IN_PROGRESS',
          createdAt: '2024-01-15T10:00:00Z',
          steps: [
            { id: 1, status: 'complete' },
            { id: 2, status: 'complete' },
            { id: 3, status: 'pending', actionButton: true },
            { id: 4, status: 'pending' },
            { id: 5, status: 'pending' },
            { id: 6, status: 'pending' },
            { id: 7, status: 'pending' }
          ]
        },
        {
          id: 'prod-005',
          name: 'Gold Band Ring',
          internalSKU: 'SKU-2024-005',
          misaSKU: null,
          thumbnail: '/api/placeholder/120/120',
          currentStep: 2,
          status: 'DRAFT',
          createdAt: '2024-01-16T14:00:00Z',
          steps: [
            { id: 1, status: 'complete' },
            { id: 2, status: 'complete' },
            { id: 3, status: 'pending', actionButton: true },
            { id: 4, status: 'pending' },
            { id: 5, status: 'pending' },
            { id: 6, status: 'pending' },
            { id: 7, status: 'pending' }
          ]
        },
        {
          id: 'prod-006',
          name: 'Ruby Cluster Ring',
          internalSKU: 'SKU-2024-006',
          misaSKU: null,
          thumbnail: '/api/placeholder/120/120',
          currentStep: 1,
          status: 'DRAFT',
          createdAt: '2024-01-17T09:00:00Z',
          steps: [
            { id: 1, status: 'pending', actionButton: true },
            { id: 2, status: 'pending' },
            { id: 3, status: 'pending' },
            { id: 4, status: 'pending' },
            { id: 5, status: 'pending' },
            { id: 6, status: 'pending' },
            { id: 7, status: 'pending' }
          ]
        },
        {
          id: 'prod-007',
          name: 'Amethyst Drop Earrings',
          internalSKU: 'SKU-2024-007',
          misaSKU: 'MISA-ER-007',
          thumbnail: '/api/placeholder/120/120',
          currentStep: 6,
          status: 'READY',
          createdAt: '2024-01-13T15:00:00Z',
          steps: [
            { id: 1, status: 'complete' },
            { id: 2, status: 'complete' },
            { id: 3, status: 'complete' },
            { id: 4, status: 'complete' },
            { id: 5, status: 'complete' },
            { id: 6, status: 'complete' },
            { id: 7, status: 'pending' }
          ]
        },
        {
          id: 'prod-008',
          name: 'White Gold Chain',
          internalSKU: 'SKU-2024-008',
          misaSKU: 'MISA-NC-008',
          thumbnail: '/api/placeholder/120/120',
          currentStep: 7,
          status: 'PUBLISHED',
          createdAt: '2024-01-11T08:00:00Z',
          steps: [
            { id: 1, status: 'complete' },
            { id: 2, status: 'complete' },
            { id: 3, status: 'complete' },
            { id: 4, status: 'complete' },
            { id: 5, status: 'complete' },
            { id: 6, status: 'complete' },
            { id: 7, status: 'complete' }
          ]
        }
      ];

      setProducts(mockProducts);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get products for a specific column
   */
  const getColumnProducts = (columnId) => {
    return products.filter(product => {
      // Apply search filter
      if (searchTerm) {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.internalSKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.misaSKU && product.misaSKU.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchesSearch) return false;
      }

      // Filter by status
      return product.status === columnId;
    });
  };

  /**
   * Handle product action
   */
  const handleProductAction = (productId) => {
    // TODO: Implement action handler
    console.log('Action for product:', productId);
  };

  /**
   * Open product details modal
   */
  const openProductDetails = (product) => {
    setSelectedProduct(product);
  };

  /**
   * Close product details modal
   */
  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  /**
   * Format date
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-empty-state">
        Loading product queue...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
              Product Queue
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Visual workflow board for product lifecycle tracking
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
            <button
              onClick={() => handleProductAction('new')}
              className="admin-button admin-button-primary"
            >
              + New Product
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="admin-card" style={{ padding: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        alignItems: 'start'
      }}>
        {columns.map((column) => {
          const columnProducts = getColumnProducts(column.id);

          return (
            <div
              key={column.id}
              style={{
                backgroundColor: column.bgColor,
                borderRadius: '8px',
                padding: '1rem',
                minHeight: '400px'
              }}
            >
              {/* Column Header */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{column.icon}</span>
                  <h2 style={{
                    margin: 0,
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: column.color
                  }}>
                    {column.title}
                  </h2>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: column.color,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '10px'
                  }}>
                    {columnProducts.length}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  color: '#64748b',
                  paddingLeft: '1.75rem'
                }}>
                  {column.description}
                </p>
              </div>

              {/* Column Products */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {columnProducts.length === 0 ? (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.8125rem',
                    fontStyle: 'italic'
                  }}>
                    No products in this stage
                  </div>
                ) : (
                  columnProducts.map((product) => (
                    <div
                      key={product.id}
                      className="admin-card"
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid #e2e8f0'
                      }}
                      onClick={() => openProductDetails(product)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Drag indicator */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '0.5rem',
                        opacity: 0.3
                      }}>
                        <div style={{
                          width: '32px',
                          height: '4px',
                          backgroundColor: '#cbd5e1',
                          borderRadius: '2px'
                        }} />
                      </div>

                      {/* Product thumbnail */}
                      <div style={{
                        width: '100%',
                        height: '120px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        marginBottom: '0.75rem',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Product info */}
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.name}
                      </h3>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          SKU: <span style={{ fontWeight: '500', color: '#475569' }}>{product.internalSKU}</span>
                        </div>
                        {product.misaSKU && (
                          <div style={{ marginBottom: '0.25rem' }}>
                            MISA: <span style={{ fontWeight: '500', color: '#475569' }}>{product.misaSKU}</span>
                          </div>
                        )}
                        <div>
                          Created: <span style={{ fontWeight: '500', color: '#475569' }}>{formatDate(product.createdAt)}</span>
                        </div>
                      </div>

                      {/* Workflow progress */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <ProductWorkflowTracker
                          productId={product.id}
                          steps={product.steps}
                          currentStep={product.currentStep}
                          compact={true}
                        />
                      </div>

                      {/* Action button */}
                      {product.status !== 'PUBLISHED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductAction(product.id);
                          }}
                          className="admin-button admin-button-primary"
                          style={{
                            width: '100%',
                            fontSize: '0.8125rem',
                            padding: '0.5rem'
                          }}
                        >
                          Continue →
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Details Modal */}
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
            onClick={closeProductDetails}
          >
            {/* Modal */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                maxWidth: '800px',
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
                    {selectedProduct.name}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                    {selectedProduct.internalSKU}
                  </p>
                </div>
                <button
                  onClick={closeProductDetails}
                  className="admin-button admin-button-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem' }}>
                <ProductWorkflowTracker
                  productId={selectedProduct.id}
                  productName={selectedProduct.name}
                  steps={selectedProduct.steps}
                  currentStep={selectedProduct.currentStep}
                  onStepAction={(stepId) => {
                    console.log('Step action:', { productId: selectedProduct.id, stepId });
                    closeProductDetails();
                  }}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductQueue;
