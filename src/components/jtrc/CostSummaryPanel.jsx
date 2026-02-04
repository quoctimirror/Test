import React from 'react';
import { formatVND, formatUSD, convertVNDtoUSD } from '@services/jtrcService';
import './jtrc.css';

/**
 * CostSummaryPanel - Read-only cost summary display for JTRC
 *
 * @param {Object} props
 * @param {number} props.metalCost - Total metal cost in VND
 * @param {number} props.stoneCost - Total stone cost in VND
 * @param {number} props.laborCost - Total labor cost in VND
 * @param {number} props.exchangeRate - USD/VND exchange rate
 * @param {number} props.goldPricePerGram - Current gold price per gram in VND
 * @param {string} props.goldPriceUpdatedAt - Last update timestamp for gold price
 * @param {number} props.difficultyLevel - Difficulty level 1-5
 * @param {number} props.estimatedLeadTime - Estimated production lead time in days
 * @param {string} props.castingStatus - Casting status
 * @param {string} props.productionNotes - Production notes
 * @param {boolean} props.loading - Loading state
 */
const CostSummaryPanel = ({
  metalCost = 0,
  stoneCost = 0,
  laborCost = 0,
  exchangeRate = 24500,
  goldPricePerGram = 0,
  goldPriceUpdatedAt,
  difficultyLevel = 0,
  estimatedLeadTime = 0,
  castingStatus = 'NOT_STARTED',
  productionNotes = '',
  loading = false,
}) => {
  const totalCOGS = metalCost + stoneCost + laborCost;
  const totalCOGSUSD = convertVNDtoUSD(totalCOGS, exchangeRate);
  const metalCostUSD = convertVNDtoUSD(metalCost, exchangeRate);
  const stoneCostUSD = convertVNDtoUSD(stoneCost, exchangeRate);
  const laborCostUSD = convertVNDtoUSD(laborCost, exchangeRate);

  const getCastingStatusLabel = (status) => {
    const labels = {
      NOT_STARTED: 'Not Started',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
    };
    return labels[status] || status;
  };

  const getCastingStatusColor = (status) => {
    const colors = {
      NOT_STARTED: '#9ca3af',
      IN_PROGRESS: '#f59e0b',
      COMPLETED: '#10b981',
    };
    return colors[status] || '#9ca3af';
  };

  const getDifficultyLabel = (level) => {
    const labels = {
      1: 'Simple',
      2: 'Easy',
      3: 'Moderate',
      4: 'Complex',
      5: 'Very Complex',
    };
    return labels[level] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="cost-summary-panel">
        <div className="cost-summary-skeleton">
          <div className="skeleton-line" style={{ width: '100%', height: '200px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="cost-summary-panel">
      {/* Cost Breakdown Table */}
      <div className="cost-summary-section">
        <h4 className="cost-summary-title">Cost Summary</h4>
        <table className="cost-summary-table">
          <thead>
            <tr>
              <th>Component</th>
              <th style={{ textAlign: 'right' }}>VND</th>
              <th style={{ textAlign: 'right' }}>USD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Metal Cost</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {formatVND(metalCost)}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {formatUSD(metalCostUSD)}
              </td>
            </tr>
            <tr>
              <td>Stone Cost</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {formatVND(stoneCost)}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {formatUSD(stoneCostUSD)}
              </td>
            </tr>
            <tr>
              <td>Labor Cost</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {formatVND(laborCost)}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {formatUSD(laborCostUSD)}
              </td>
            </tr>
            <tr className="cost-summary-total-row">
              <td><strong>TOTAL COGS</strong></td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <strong>{formatVND(totalCOGS)}</strong>
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <strong>{formatUSD(totalCOGSUSD)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Price Snapshot */}
      <div className="cost-summary-section cost-summary-snapshot">
        <h4 className="cost-summary-title">Price Snapshot</h4>
        <div className="cost-summary-grid">
          <div className="cost-summary-item">
            <span className="cost-summary-label">Gold Price (per gram)</span>
            <span className="cost-summary-value">{formatVND(goldPricePerGram)}</span>
          </div>
          <div className="cost-summary-item">
            <span className="cost-summary-label">Exchange Rate</span>
            <span className="cost-summary-value">{formatVND(exchangeRate)}/USD</span>
          </div>
          {goldPriceUpdatedAt && (
            <div className="cost-summary-item cost-summary-item-full">
              <span className="cost-summary-label">Last Updated</span>
              <span className="cost-summary-value cost-summary-value-small">
                {new Date(goldPriceUpdatedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Production Metrics */}
      <div className="cost-summary-section">
        <h4 className="cost-summary-title">Production Metrics</h4>
        <div className="cost-summary-metrics">
          <div className="cost-summary-metric">
            <span className="cost-summary-label">Difficulty Level</span>
            <div className="difficulty-indicator">
              <div className="difficulty-bars">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`difficulty-bar ${level <= difficultyLevel ? 'active' : ''}`}
                  />
                ))}
              </div>
              <span className="difficulty-text">
                {difficultyLevel}/5 ({getDifficultyLabel(difficultyLevel)})
              </span>
            </div>
          </div>
          <div className="cost-summary-metric">
            <span className="cost-summary-label">Estimated Lead Time</span>
            <span className="cost-summary-value">
              {estimatedLeadTime} {estimatedLeadTime === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="cost-summary-metric">
            <span className="cost-summary-label">Casting Status</span>
            <span
              className="casting-status-indicator"
              style={{ color: getCastingStatusColor(castingStatus) }}
            >
              <span className="status-dot" style={{ backgroundColor: getCastingStatusColor(castingStatus) }} />
              {getCastingStatusLabel(castingStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Production Notes */}
      {productionNotes && (
        <div className="cost-summary-section">
          <h4 className="cost-summary-title">Production Notes</h4>
          <div className="cost-summary-notes">
            {productionNotes}
          </div>
        </div>
      )}
    </div>
  );
};

export default CostSummaryPanel;
