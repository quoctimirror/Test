import React, { useState, useEffect, useCallback } from 'react';
import { productFinderAdminAPI } from '../../services/api';
import './ProductFinderAdminPage.css';

const UserSelectionsPage = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all user selections
  const loadSelections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productFinderAdminAPI.getSelections();
      setSelections(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load selections:', err);
      setError('Failed to load user selections. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSelections();
  }, [loadSelections]);

  // Format currency
  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="pf-admin">
        <div className="pf-admin__loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pf-admin">
        <div className="pf-admin__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="pf-admin">
      <div className="pf-admin__header">
        <h1>User Selections</h1>
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          {selections.length} selection{selections.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="pf-admin__table-container">
        <table className="pf-admin__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Main Stone</th>
              <th>Band</th>
              <th>Side Stone</th>
              <th>Colors</th>
              <th>Est. Total</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {selections.map((selection) => (
              <tr key={selection.id}>
                <td>{selection.id}</td>
                <td className="pf-admin__cell--modelid" title={selection.userId}>
                  {selection.userId?.substring(0, 8)}...
                </td>
                <td>
                  <div>{selection.mainStoneCode}</div>
                  <small style={{ color: '#6b7280' }}>{formatPrice(selection.mainStonePrice)}</small>
                </td>
                <td>
                  <div>{selection.bandCode}</div>
                  <small style={{ color: '#6b7280' }}>{formatPrice(selection.bandPrice)}</small>
                </td>
                <td>
                  <div>{selection.sideStoneCode}</div>
                  <small style={{ color: '#6b7280' }}>{formatPrice(selection.sideStonePrice)}</small>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {selection.mainColor && (
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: selection.mainColor,
                          border: '1px solid #d1d5db',
                          display: 'inline-block',
                        }}
                        title={`Main: ${selection.mainColor}`}
                      />
                    )}
                    {selection.bandColor && (
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: selection.bandColor,
                          border: '1px solid #d1d5db',
                          display: 'inline-block',
                        }}
                        title={`Band: ${selection.bandColor}`}
                      />
                    )}
                    {selection.sideColor && (
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: selection.sideColor,
                          border: '1px solid #d1d5db',
                          display: 'inline-block',
                        }}
                        title={`Side: ${selection.sideColor}`}
                      />
                    )}
                    {!selection.mainColor && !selection.bandColor && !selection.sideColor && (
                      <span className="pf-admin__empty">-</span>
                    )}
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{formatPrice(selection.estimatedTotal)}</td>
                <td style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                  {formatDate(selection.createdAt)}
                </td>
              </tr>
            ))}
            {selections.length === 0 && (
              <tr>
                <td colSpan="8" className="pf-admin__empty-row">
                  No user selections found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSelectionsPage;
