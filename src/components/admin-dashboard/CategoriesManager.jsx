import React, { useState, useEffect } from "react";
import { categoriesAPI, handleAPIError } from "@services/api";

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load categories');
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    const search = searchTerm.toLowerCase();
    return (
      category.categoryName?.toLowerCase().includes(search) ||
      category.categoryCode?.toLowerCase().includes(search) ||
      category.categoryId?.toLowerCase().includes(search) ||
      category.description?.toLowerCase().includes(search) ||
      category.fullPath?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="admin-empty-state">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="admin-card" style={{ padding: '1.5rem' }}>
      {/* Info Banner */}
      <div style={{
        padding: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        borderLeft: '3px solid #0f172a'
      }}>
        <div>
          <strong style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600' }}>MISA Categories (Read-Only)</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
            Categories are managed in MISA ERP and automatically synced to Mirror. To add, edit, or delete categories, please use MISA ERP.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-error-state" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search categories by name, code, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input"
          style={{ width: '100%' }}
        />
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {filteredCategories.map(category => (
          <div key={category.id} style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '1rem',
            transition: 'box-shadow 0.2s ease'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: '0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                  {category.categoryName}
                </h3>
                <span className="status-pill" style={{
                  backgroundColor: category.isActive ? '#ecfdf5' : '#fef2f2',
                  color: category.isActive ? '#059669' : '#dc2626',
                  borderColor: category.isActive ? '#059669' : '#dc2626'
                }}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {category.categoryCode && (
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Code: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: '500' }}>
                    {category.categoryCode}
                  </code>
                </div>
              )}

              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem', color: '#64748b', lineHeight: '1.4' }}>
                {category.description || 'No description'}
              </p>
            </div>

            {/* MISA Category Details */}
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fafbfc',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#64748b',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>Grade:</span>
                  <div style={{ marginTop: '2px', color: '#0f172a', fontSize: '0.75rem' }}>{category.grade ?? 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>Type:</span>
                  <div style={{ marginTop: '2px', color: '#0f172a', fontSize: '0.75rem' }}>{category.isLeaf ? 'Leaf' : 'Parent'}</div>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>Sort Order:</span>
                  <div style={{ marginTop: '2px', color: '#0f172a', fontSize: '0.75rem' }}>{category.sortOrder ?? 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>Sync Status:</span>
                  <div style={{ marginTop: '2px', color: '#0f172a', fontSize: '0.75rem' }}>{category.syncStatus || 'N/A'}</div>
                </div>
              </div>

              {category.parentId && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>Parent ID:</span>
                  <div style={{ marginTop: '2px', fontSize: '0.6875rem', fontFamily: 'monospace', color: '#0f172a' }}>
                    {category.parentId}
                  </div>
                </div>
              )}

              {category.fullPath && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>Full Path:</span>
                  <div style={{ marginTop: '2px', fontSize: '0.6875rem', color: '#0f172a' }}>
                    {category.fullPath}
                  </div>
                </div>
              )}

              {category.lastSyncDate && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>Last Synced:</span>
                  <div style={{ marginTop: '2px', fontSize: '0.6875rem', color: '#0f172a' }}>
                    {new Date(category.lastSyncDate).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* MISA ID */}
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
              MISA ID: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                {category.categoryId}
              </code>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="admin-empty-state">
          {searchTerm ? (
            <>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#64748b' }}>No categories found</div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Try adjusting your search.</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#64748b' }}>No categories synced yet</div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Categories will appear here once they are synced from MISA ERP.</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;