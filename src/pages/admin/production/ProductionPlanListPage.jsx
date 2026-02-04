import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  productionPlanAPI,
  PRODUCTION_PLAN_STATUS,
  formatDate,
  formatDateRange,
  calculateProgress,
  canGenerateOrders,
} from '@services/productionPlanService';
import { PlanStatusBadge, PlanProgressBar } from '@components/production';
import AdminTable, { TableActions, ActionButton } from '@components/admin-dashboard/AdminTable';
import { SkeletonStatsGrid } from '@components/admin-dashboard/Skeleton';
import '@components/production/production.css';

/**
 * ProductionPlanListPage - List page for production plan management
 * Features: Table, filters, pagination, status badges, progress indicators, actions
 */
const ProductionPlanListPage = () => {
  const navigate = useNavigate();

  // State
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filter options (loaded from API)
  const [filterOptions, setFilterOptions] = useState({
    collections: [],
    templates: [],
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    planned: 0,
    inProgress: 0,
    completed: 0,
  });

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await productionPlanAPI.getFilterOptions();
        setFilterOptions(response.data || { collections: [], templates: [] });
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setFilterOptions({ collections: [], templates: [] });
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch production plans
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        size: pageSize,
        ...(searchQuery && { q: searchQuery }),
        ...(collectionFilter && { collectionPlanId: collectionFilter }),
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await productionPlanAPI.getAll(params);
      const data = response.data;

      // Handle paginated response
      if (data.content) {
        setPlans(data.content);
        setTotalCount(data.totalElements || data.content.length);
      } else if (Array.isArray(data)) {
        setPlans(data);
        setTotalCount(data.length);
      } else {
        setPlans([]);
        setTotalCount(0);
      }

      // Calculate stats
      const allItems = data.content || data || [];
      setStats({
        total: allItems.length,
        draft: allItems.filter((p) => p.status === PRODUCTION_PLAN_STATUS.DRAFT).length,
        planned: allItems.filter((p) => p.status === PRODUCTION_PLAN_STATUS.PLANNED).length,
        inProgress: allItems.filter((p) => p.status === PRODUCTION_PLAN_STATUS.IN_PROGRESS).length,
        completed: allItems.filter((p) => p.status === PRODUCTION_PLAN_STATUS.COMPLETED).length,
      });
    } catch (err) {
      console.error('Error fetching production plans:', err);
      setError('Failed to load production plans. Please try again.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, collectionFilter, statusFilter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Handle search with debounce
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handlers
  const handleCreateNew = () => {
    navigate('/dashboard/admin?tab=production-plan-form&mode=new');
  };

  const handleView = (plan) => {
    navigate(`/dashboard/admin?tab=production-plan-form&mode=view&id=${plan.id}`);
  };

  const handleEdit = (plan) => {
    navigate(`/dashboard/admin?tab=production-plan-form&mode=edit&id=${plan.id}`);
  };

  const handleGenerateOrders = async (plan) => {
    if (!window.confirm(`Generate production orders for "${plan.name}"? This will create orders for all items in the collection plan.`)) {
      return;
    }

    try {
      await productionPlanAPI.generateOrders(plan.id);
      fetchPlans();
      alert('Production orders generated successfully!');
    } catch (err) {
      console.error('Error generating orders:', err);
      alert('Failed to generate orders. Please try again.');
    }
  };

  const handleStartPlan = async (plan) => {
    try {
      await productionPlanAPI.start(plan.id);
      fetchPlans();
      alert(`Plan "${plan.name}" started!`);
    } catch (err) {
      console.error('Error starting plan:', err);
      alert('Failed to start plan. Please try again.');
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete production plan "${plan.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await productionPlanAPI.delete(plan.id);
      fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete plan. Please try again.');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'collection':
        setCollectionFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(0);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Plan Name',
        sortable: true,
        render: (value, row) => (
          <div>
            <div className="admin-table-primary">{value}</div>
            {row.notes && (
              <div className="admin-table-secondary">
                {row.notes.length > 60 ? `${row.notes.substring(0, 60)}...` : row.notes}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'collectionPlanName',
        header: 'Collection',
        sortable: true,
        render: (value, row) => (
          <div>
            <div className="admin-table-primary">{value || '-'}</div>
            {row.collectionSeason && (
              <div className="admin-table-secondary">{row.collectionSeason}</div>
            )}
          </div>
        ),
      },
      {
        key: 'workflowTemplateName',
        header: 'Template',
        sortable: true,
        render: (value) => value || '-',
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (value) => <PlanStatusBadge status={value} size="sm" />,
      },
      {
        key: 'targetDates',
        header: 'Target Dates',
        sortable: true,
        render: (_, row) => (
          <div className="production-date-range">
            {formatDateRange(row.targetStartDate, row.targetEndDate)}
          </div>
        ),
      },
      {
        key: 'progress',
        header: 'Progress',
        sortable: false,
        render: (_, row) => {
          const completed = row.completedOrdersCount || 0;
          const total = row.totalOrdersCount || 0;
          const progress = calculateProgress(completed, total);
          return (
            <div style={{ minWidth: '120px' }}>
              <PlanProgressBar
                completed={completed}
                total={total}
                showText
                size="sm"
              />
            </div>
          );
        },
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        render: (value) => formatDate(value),
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (_, row) => (
          <TableActions>
            <ActionButton onClick={() => handleView(row)} title="View">
              View
            </ActionButton>
            {row.status !== PRODUCTION_PLAN_STATUS.COMPLETED &&
             row.status !== PRODUCTION_PLAN_STATUS.CANCELLED && (
              <ActionButton onClick={() => handleEdit(row)} title="Edit">
                Edit
              </ActionButton>
            )}
            {canGenerateOrders(row.status, row.totalOrdersCount > 0) && (
              <ActionButton onClick={() => handleGenerateOrders(row)} title="Generate Orders">
                Generate
              </ActionButton>
            )}
            {row.status === PRODUCTION_PLAN_STATUS.PLANNED && row.totalOrdersCount > 0 && (
              <ActionButton onClick={() => handleStartPlan(row)} title="Start Production">
                Start
              </ActionButton>
            )}
            {(row.status === PRODUCTION_PLAN_STATUS.DRAFT ||
              row.status === PRODUCTION_PLAN_STATUS.PLANNED) && (
              <ActionButton
                onClick={() => handleDelete(row)}
                variant="danger"
                title="Delete"
              >
                Delete
              </ActionButton>
            )}
          </TableActions>
        ),
      },
    ],
    []
  );

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: PRODUCTION_PLAN_STATUS.DRAFT, label: 'Draft' },
    { value: PRODUCTION_PLAN_STATUS.PLANNED, label: 'Planned' },
    { value: PRODUCTION_PLAN_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: PRODUCTION_PLAN_STATUS.PAUSED, label: 'Paused' },
    { value: PRODUCTION_PLAN_STATUS.COMPLETED, label: 'Completed' },
    { value: PRODUCTION_PLAN_STATUS.CANCELLED, label: 'Cancelled' },
  ];

  return (
    <div className="production-plan-list-page">
      {/* Filters & Actions */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <div className="production-list-header">
          <div className="production-filters">
            <input
              type="text"
              className="admin-input"
              placeholder="Search by plan name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <select
              className="admin-select"
              value={collectionFilter}
              onChange={(e) => handleFilterChange('collection', e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Collections</option>
              {filterOptions.collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{ minWidth: '150px' }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
            ))}
            </select>
          </div>
          <button
            onClick={handleCreateNew}
            className="admin-button admin-button-primary"
          >
            + Create New Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="admin-card admin-p-lg admin-mb-lg">
          <SkeletonStatsGrid count={5} />
        </div>
      ) : (
        <div className="admin-stats-grid admin-mb-lg">
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">Total Plans</p>
            <p className="admin-stat-value">{stats.total}</p>
          </div>
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">Drafts</p>
            <p className="admin-stat-value" style={{ color: '#475569' }}>
              {stats.draft}
            </p>
          </div>
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">Planned</p>
            <p className="admin-stat-value" style={{ color: '#1e40af' }}>
              {stats.planned}
            </p>
          </div>
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">In Progress</p>
            <p className="admin-stat-value" style={{ color: '#854d0e' }}>
              {stats.inProgress}
            </p>
          </div>
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">Completed</p>
            <p className="admin-stat-value" style={{ color: '#166534' }}>
              {stats.completed}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="admin-error-state admin-mb-lg">{error}</div>
      )}

      {/* Table */}
      <div className="admin-card">
        <div className="admin-section-header">
          <h2>Production Plans ({totalCount})</h2>
        </div>

        <AdminTable
          columns={columns}
          data={plans}
          loading={loading}
          emptyMessage="No production plans found"
          emptySubtext="Create your first production plan to start managing collection production workflows."
          rowKey="id"
          paginated
          pageSize={pageSize}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onRowClick={handleView}
          hoverable
        />
      </div>
    </div>
  );
};

export default ProductionPlanListPage;
