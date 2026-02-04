import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  workflowTemplateAPI,
  WORKFLOW_TEMPLATE_STATUS,
  WORKFLOW_CATEGORIES,
  formatCategory,
  calculateTotalDuration,
} from '@services/workflowTemplateService';
import { WorkflowStatusBadge } from '@components/workflow';
import AdminTable, { TableActions, ActionButton } from '@components/admin-dashboard/AdminTable';
import { SkeletonStatsGrid } from '@components/admin-dashboard/Skeleton';
import '@components/workflow/workflow.css';

/**
 * WorkflowTemplateListPage - List page for workflow template management
 * Features: Table, filters, pagination, status badges, actions
 */
const WorkflowTemplateListPage = () => {
  const navigate = useNavigate();

  // State
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    active: 0,
    archived: 0,
  });

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        size: pageSize,
        ...(searchQuery && { q: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await workflowTemplateAPI.getAll(params);
      const data = response.data;

      // Handle paginated response
      if (data.content) {
        setTemplates(data.content);
        setTotalCount(data.totalElements || data.content.length);
      } else if (Array.isArray(data)) {
        setTemplates(data);
        setTotalCount(data.length);
      } else {
        setTemplates([]);
        setTotalCount(0);
      }

      // Calculate stats
      const allItems = data.content || data || [];
      setStats({
        total: allItems.length,
        draft: allItems.filter((t) => t.status === WORKFLOW_TEMPLATE_STATUS.DRAFT).length,
        active: allItems.filter((t) => t.status === WORKFLOW_TEMPLATE_STATUS.ACTIVE).length,
        archived: allItems.filter((t) => t.status === WORKFLOW_TEMPLATE_STATUS.ARCHIVED).length,
      });
    } catch (err) {
      console.error('Error fetching workflow templates:', err);
      setError('Failed to load workflow templates. Please try again.');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

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
    navigate('/dashboard/admin?tab=workflow-template-form&mode=new');
  };

  const handleView = (template) => {
    navigate(`/dashboard/admin?tab=workflow-template-form&mode=view&id=${template.id}`);
  };

  const handleEdit = (template) => {
    navigate(`/dashboard/admin?tab=workflow-template-form&mode=edit&id=${template.id}`);
  };

  const handleDuplicate = async (template) => {
    if (!window.confirm(`Duplicate template "${template.name}"?`)) return;

    try {
      const response = await workflowTemplateAPI.duplicate(template.id);
      fetchTemplates();
      alert(`Duplicated successfully! New template: ${response.data.name}`);
    } catch (err) {
      console.error('Error duplicating template:', err);
      alert('Failed to duplicate template. Please try again.');
    }
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`Delete template "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await workflowTemplateAPI.delete(template.id);
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleActivate = async (template) => {
    try {
      await workflowTemplateAPI.activate(template.id);
      fetchTemplates();
      alert(`Template "${template.name}" activated successfully!`);
    } catch (err) {
      console.error('Error activating template:', err);
      alert('Failed to activate template. Please try again.');
    }
  };

  const handleArchive = async (template) => {
    if (!window.confirm(`Archive template "${template.name}"?`)) return;

    try {
      await workflowTemplateAPI.archive(template.id);
      fetchTemplates();
    } catch (err) {
      console.error('Error archiving template:', err);
      alert('Failed to archive template. Please try again.');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setCategoryFilter(value);
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
        header: 'Name',
        sortable: true,
        render: (value, row) => (
          <div>
            <div className="admin-table-primary">{value}</div>
            {row.description && (
              <div className="admin-table-secondary">
                {row.description.length > 60 ? `${row.description.substring(0, 60)}...` : row.description}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        sortable: true,
        render: (value) => formatCategory(value),
      },
      {
        key: 'stages',
        header: 'Stages',
        sortable: false,
        align: 'center',
        render: (value, row) => {
          const stagesCount = row.stages?.length || 0;
          const duration = calculateTotalDuration(row.stages);
          return (
            <div>
              <div className="admin-table-primary">{stagesCount}</div>
              <div className="admin-table-secondary">{duration} days</div>
            </div>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (value) => <WorkflowStatusBadge status={value} size="sm" />,
      },
      {
        key: 'isDefault',
        header: 'Default',
        sortable: true,
        align: 'center',
        render: (value) =>
          value ? (
            <span className="workflow-default-badge">Default</span>
          ) : (
            '-'
          ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        render: (value) =>
          value ? new Date(value).toLocaleDateString() : '-',
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
            <ActionButton onClick={() => handleEdit(row)} title="Edit">
              Edit
            </ActionButton>
            <ActionButton onClick={() => handleDuplicate(row)} title="Duplicate">
              Copy
            </ActionButton>
            {row.status === WORKFLOW_TEMPLATE_STATUS.DRAFT && (
              <ActionButton onClick={() => handleActivate(row)} title="Activate">
                Activate
              </ActionButton>
            )}
            {row.status === WORKFLOW_TEMPLATE_STATUS.ACTIVE && (
              <ActionButton onClick={() => handleArchive(row)} title="Archive">
                Archive
              </ActionButton>
            )}
            <ActionButton
              onClick={() => handleDelete(row)}
              variant="danger"
              title="Delete"
            >
              Delete
            </ActionButton>
          </TableActions>
        ),
      },
    ],
    []
  );

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: WORKFLOW_TEMPLATE_STATUS.DRAFT, label: 'Draft' },
    { value: WORKFLOW_TEMPLATE_STATUS.ACTIVE, label: 'Active' },
    { value: WORKFLOW_TEMPLATE_STATUS.ARCHIVED, label: 'Archived' },
  ];

  return (
    <div className="workflow-template-list-page">
      {/* Filters & Actions */}
      <div className="admin-card admin-p-lg admin-mb-lg">
        <div className="workflow-list-header">
          <div className="workflow-filters">
            <input
              type="text"
              className="admin-input"
              placeholder="Search by template name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <select
              className="admin-select"
              value={categoryFilter}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Categories</option>
              {WORKFLOW_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
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
            + Create New Template
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="admin-card admin-p-lg admin-mb-lg">
          <SkeletonStatsGrid count={4} />
        </div>
      ) : (
        <div className="admin-stats-grid admin-mb-lg">
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">Total Templates</p>
            <p className="admin-stat-value">{stats.total}</p>
          </div>
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">Drafts</p>
            <p className="admin-stat-value" style={{ color: '#854d0e' }}>
              {stats.draft}
            </p>
          </div>
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">Active</p>
            <p className="admin-stat-value" style={{ color: '#166534' }}>
              {stats.active}
            </p>
          </div>
          <div className="admin-card admin-p-lg">
            <p className="admin-stat-label">Archived</p>
            <p className="admin-stat-value" style={{ color: '#475569' }}>
              {stats.archived}
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
          <h2>Workflow Templates ({totalCount})</h2>
        </div>

        <AdminTable
          columns={columns}
          data={templates}
          loading={loading}
          emptyMessage="No workflow templates found"
          emptySubtext="Create your first workflow template to define production stages for your products."
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

export default WorkflowTemplateListPage;
