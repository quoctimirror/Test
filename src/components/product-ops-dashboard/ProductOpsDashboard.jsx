import React, { useState, useEffect, useRef } from 'react';
import ProductWorkflowTracker from './ProductWorkflowTracker';
import { getAllProductsWithWorkflow, getWorkflowSummary } from '../../services/productOpsApi';
import './ProductOpsDashboard.css';

/**
 * ProductOpsDashboard - Main dashboard for Product Operations team
 *
 * Features:
 * - Summary cards showing product counts by status
 * - Filterable product list with workflow status
 * - Integrated workflow tracker for each product
 * - Quick actions for current workflow step
 */

const ProductOpsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({ draft: 0, inProgress: 0, ready: 0, published: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);

  // Ref to prevent double fetch in React StrictMode (dev only)
  const hasFetchedRef = useRef(false);

  // Status filter options
  const statusFilters = [
    { value: 'ALL', label: 'All Products' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'READY', label: 'Ready to Publish' },
    { value: 'PUBLISHED', label: 'Published' }
  ];

  const fetchSummary = async () => {
    try {
      const data = await getWorkflowSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching workflow summary:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProductsWithWorkflow({
        status: statusFilter,
        search: searchTerm
      });
      setProducts(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      // Fallback to empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary and products on mount (with StrictMode guard)
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchSummary();
    fetchProducts();
  }, []);

  // Fetch products when statusFilter changes (skip initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Mock data for development (commented out - using real API now)
  /*
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const mockProducts = [
        {
          id: 'prod-001',
          name: 'Diamond Solitaire Ring',
          internalSKU: 'SKU-2024-001',
          misaSKU: 'MISA-DR-001',
          thumbnail: '/api/placeholder/80/80',
          currentStep: 7,
          status: 'PUBLISHED',
          createdAt: '2024-01-10T10:00:00Z',
          publishedAt: '2024-01-15T14:30:00Z',
          steps: [
            { id: 1, status: 'complete', completedAt: '2024-01-10T10:15:00Z', completedBy: 'John Doe' },
            { id: 2, status: 'complete', completedAt: '2024-01-10T10:30:00Z', completedBy: 'John Doe' },
            { id: 3, status: 'complete', completedAt: '2024-01-12T15:00:00Z', completedBy: 'Jane Smith' },
            { id: 4, status: 'complete', completedAt: '2024-01-13T09:00:00Z', completedBy: 'John Doe' },
            { id: 5, status: 'complete', completedAt: '2024-01-14T11:00:00Z', completedBy: 'MISA System' },
            { id: 6, status: 'complete', completedAt: '2024-01-15T10:00:00Z', completedBy: 'Jane Smith' },
            { id: 7, status: 'complete', completedAt: '2024-01-15T14:30:00Z', completedBy: 'John Doe' }
          ]
        },
        {
          id: 'prod-002',
          name: 'Emerald Tennis Bracelet',
          internalSKU: 'SKU-2024-002',
          misaSKU: 'MISA-BR-002',
          thumbnail: '/api/placeholder/80/80',
          currentStep: 6,
          status: 'READY',
          createdAt: '2024-01-12T09:00:00Z',
          steps: [
            { id: 1, status: 'complete', completedAt: '2024-01-12T09:15:00Z', completedBy: 'John Doe' },
            { id: 2, status: 'complete', completedAt: '2024-01-12T09:30:00Z', completedBy: 'John Doe' },
            { id: 3, status: 'complete', completedAt: '2024-01-13T16:00:00Z', completedBy: 'Jane Smith' },
            { id: 4, status: 'complete', completedAt: '2024-01-14T10:00:00Z', completedBy: 'John Doe' },
            { id: 5, status: 'complete', completedAt: '2024-01-15T12:00:00Z', completedBy: 'MISA System' },
            { id: 6, status: 'complete', completedAt: '2024-01-16T09:00:00Z', completedBy: 'Jane Smith' },
            { id: 7, status: 'pending' }
          ]
        },
        {
          id: 'prod-003',
          name: 'Pearl Drop Earrings',
          internalSKU: 'SKU-2024-003',
          misaSKU: null,
          thumbnail: '/api/placeholder/80/80',
          currentStep: 5,
          status: 'IN_PROGRESS',
          createdAt: '2024-01-14T11:00:00Z',
          steps: [
            { id: 1, status: 'complete', completedAt: '2024-01-14T11:15:00Z', completedBy: 'John Doe' },
            { id: 2, status: 'complete', completedAt: '2024-01-14T11:30:00Z', completedBy: 'John Doe' },
            { id: 3, status: 'complete', completedAt: '2024-01-15T14:00:00Z', completedBy: 'Jane Smith' },
            { id: 4, status: 'complete', completedAt: '2024-01-16T10:00:00Z', completedBy: 'John Doe' },
            { id: 5, status: 'pending', pendingMessage: 'Waiting for MISA response...' },
            { id: 6, status: 'pending' },
            { id: 7, status: 'pending' }
          ]
        },
        {
          id: 'prod-004',
          name: 'Sapphire Pendant Necklace',
          internalSKU: 'SKU-2024-004',
          misaSKU: null,
          thumbnail: '/api/placeholder/80/80',
          currentStep: 3,
          status: 'IN_PROGRESS',
          createdAt: '2024-01-15T10:00:00Z',
          steps: [
            { id: 1, status: 'complete', completedAt: '2024-01-15T10:15:00Z', completedBy: 'John Doe' },
            { id: 2, status: 'complete', completedAt: '2024-01-15T10:30:00Z', completedBy: 'John Doe' },
            { id: 3, status: 'pending', actionButton: true, actionLabel: 'Upload Assets' },
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
          thumbnail: '/api/placeholder/80/80',
          currentStep: 2,
          status: 'DRAFT',
          createdAt: '2024-01-16T14:00:00Z',
          steps: [
            { id: 1, status: 'complete', completedAt: '2024-01-16T14:15:00Z', completedBy: 'John Doe' },
            { id: 2, status: 'complete', completedAt: '2024-01-16T14:30:00Z', completedBy: 'John Doe' },
            { id: 3, status: 'pending', actionButton: true, actionLabel: 'Fill Product Data' },
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
          thumbnail: '/api/placeholder/80/80',
          currentStep: 1,
          status: 'DRAFT',
          createdAt: '2024-01-17T09:00:00Z',
          steps: [
            { id: 1, status: 'pending', actionButton: true, actionLabel: 'Generate SKU' },
            { id: 2, status: 'pending' },
            { id: 3, status: 'pending' },
            { id: 4, status: 'pending' },
            { id: 5, status: 'pending' },
            { id: 6, status: 'pending' },
            { id: 7, status: 'pending' }
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
   * Get summary statistics (from API)
   */
  const getSummaryStats = () => {
    return summary;
  };

  /**
   * Filter products by search term and status
   */
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.internalSKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.misaSKU && product.misaSKU.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  /**
   * Handle product action (continue to next step)
   */
  const handleProductAction = async (productId) => {
    console.log('Action for product:', productId);
    // Refresh products after action
    await fetchProducts();
    await fetchSummary();
  };

  /**
   * Handle step action from workflow tracker
   */
  const handleStepAction = async (productId, stepId) => {
    console.log('Step action:', { productId, stepId });
    // Refresh products after step action
    await fetchProducts();
    await fetchSummary();
  };

  /**
   * Toggle product expansion
   */
  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  /**
   * Handle search
   */
  const handleSearch = () => {
    fetchProducts();
  };

  /**
   * Handle search on Enter key
   */
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Get status badge CSS class
   */
  const getStatusBadgeClass = (status) => {
    const classes = {
      DRAFT: 'draft',
      IN_PROGRESS: 'in-progress',
      READY: 'ready',
      PUBLISHED: 'published'
    };
    return classes[status] || 'draft';
  };

  /**
   * Get status display name
   */
  const getStatusDisplayName = (status) => {
    const names = {
      DRAFT: 'Draft',
      IN_PROGRESS: 'In Progress',
      READY: 'Ready',
      PUBLISHED: 'Published'
    };
    return names[status] || status;
  };

  /**
   * Format date
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stats = getSummaryStats();
  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
      <div className="admin-empty-state">
        Loading products...
      </div>
    );
  }

  return (
    <div>
      {/* Error Message */}
      {error && (
        <div className="product-ops-error">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="product-ops-header">
        <div className="product-ops-header-info">
          <h1>Product Operations Dashboard</h1>
          <p>Manage product lifecycle from SKU generation to publication</p>
        </div>
        <div className="product-ops-header-actions">
          <div className="product-ops-timestamp">
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

      {/* Summary Cards */}
      <div className="product-ops-summary-grid">
        <div className="admin-card product-ops-summary-card">
          <div className="product-ops-summary-card-header">
            <div>
              <p className="product-ops-summary-card-label">Draft</p>
              <p className="product-ops-summary-card-value">{stats.draft}</p>
            </div>
            <div className="product-ops-summary-icon gray">📝</div>
          </div>
          <div className="product-ops-summary-footer">Newly created products</div>
        </div>

        <div className="admin-card product-ops-summary-card">
          <div className="product-ops-summary-card-header">
            <div>
              <p className="product-ops-summary-card-label">In Progress</p>
              <p className="product-ops-summary-card-value blue">{stats.inProgress}</p>
            </div>
            <div className="product-ops-summary-icon blue">⚙️</div>
          </div>
          <div className="product-ops-summary-footer">Being processed</div>
        </div>

        <div className="admin-card product-ops-summary-card">
          <div className="product-ops-summary-card-header">
            <div>
              <p className="product-ops-summary-card-label">Ready</p>
              <p className="product-ops-summary-card-value amber">{stats.ready}</p>
            </div>
            <div className="product-ops-summary-icon amber">✓</div>
          </div>
          <div className="product-ops-summary-footer">Ready to publish</div>
        </div>

        <div className="admin-card product-ops-summary-card">
          <div className="product-ops-summary-card-header">
            <div>
              <p className="product-ops-summary-card-label">Published</p>
              <p className="product-ops-summary-card-value green">{stats.published}</p>
            </div>
            <div className="product-ops-summary-icon green">🚀</div>
          </div>
          <div className="product-ops-summary-footer">Live on website</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card product-ops-filters">
        <div className="product-ops-filters-row">
          {/* Search */}
          <div className="product-ops-search">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="admin-input"
            />
            <button
              onClick={handleSearch}
              className="admin-button admin-button-secondary"
            >
              Search
            </button>
          </div>

          {/* Status filter */}
          <div className="product-ops-status-filter">
            <label className="admin-label">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="product-ops-results-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </div>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="admin-empty-state product-ops-empty">
          <h3>No products found</h3>
          <p>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your filters or search term.'
              : 'Get started by creating your first product.'}
          </p>
        </div>
      ) : (
        <div className="product-ops-products-list">
          {filteredProducts.map((product) => {
            const isExpanded = expandedProduct === product.id;

            return (
              <div key={product.id} className="admin-card product-ops-product-card">
                {/* Product Header */}
                <div className={`product-ops-product-header ${isExpanded ? 'expanded' : ''}`}>
                  {/* Thumbnail */}
                  <div className="product-ops-thumbnail">
                    <img src={product.thumbnail} alt={product.name} />
                  </div>

                  {/* Product Info */}
                  <div className="product-ops-product-info">
                    {/* Name and Status */}
                    <div className="product-ops-name-row">
                      <h3 className="product-ops-product-name">{product.name}</h3>
                      <span className={`product-ops-status-badge ${getStatusBadgeClass(product.status)}`}>
                        {getStatusDisplayName(product.status)}
                      </span>
                    </div>

                    {/* SKUs */}
                    <div className="product-ops-sku-row">
                      <div className="product-ops-sku-item">
                        <span className="product-ops-sku-label">Internal SKU: </span>
                        <span className="product-ops-sku-value">{product.internalSKU}</span>
                      </div>
                      {product.misaSKU && (
                        <div className="product-ops-sku-item">
                          <span className="product-ops-sku-label">MISA SKU: </span>
                          <span className="product-ops-sku-value">{product.misaSKU}</span>
                        </div>
                      )}
                      <div className="product-ops-sku-item">
                        <span className="product-ops-sku-label">Created: </span>
                        <span className="product-ops-sku-value">{formatDate(product.createdAt)}</span>
                      </div>
                    </div>

                    {/* Workflow Progress (Compact) */}
                    {!isExpanded && (
                      <div className="product-ops-workflow-compact">
                        <ProductWorkflowTracker
                          productId={product.id}
                          steps={product.steps}
                          currentStep={product.currentStep}
                          compact={true}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="product-ops-actions">
                      <button
                        onClick={() => toggleProductExpansion(product.id)}
                        className="admin-button admin-button-secondary"
                      >
                        {isExpanded ? '▼ Hide Details' : '▶ View Details'}
                      </button>

                      {product.status !== 'PUBLISHED' && (
                        <button
                          onClick={() => handleProductAction(product.id)}
                          className="admin-button admin-button-primary"
                        >
                          Continue →
                        </button>
                      )}

                      <button className="admin-button admin-button-secondary">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded View - Full Workflow */}
                {isExpanded && (
                  <div className="product-ops-expanded">
                    <ProductWorkflowTracker
                      productId={product.id}
                      productName={product.name}
                      steps={product.steps}
                      currentStep={product.currentStep}
                      onStepAction={(stepId) => handleStepAction(product.id, stepId)}
                      compact={false}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductOpsDashboard;
