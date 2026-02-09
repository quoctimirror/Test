import React from 'react';
import {
  calculateProgress,
  getProgressColor,
  formatProgressText,
} from '@services/productionPlanService';
import './production.css';

/**
 * PlanProgressBar - Visual progress indicator for production plans
 *
 * @param {Object} props
 * @param {number} props.completedCount - Number of completed orders
 * @param {number} props.totalCount - Total number of orders
 * @param {boolean} props.compact - Use compact display for tables
 * @param {boolean} props.showText - Show progress text
 * @param {string} props.className - Additional CSS class
 */
const PlanProgressBar = ({
  completedCount = 0,
  totalCount = 0,
  compact = false,
  showText = true,
  className = '',
}) => {
  const percentage = calculateProgress(completedCount, totalCount);
  const colorConfig = getProgressColor(percentage);
  const progressText = formatProgressText(completedCount, totalCount);

  if (compact) {
    return (
      <div className={`plan-progress-compact ${className}`}>
        <div className="plan-progress-bar-wrapper">
          <div
            className="plan-progress-bar"
            style={{
              width: `${percentage}%`,
              backgroundColor: colorConfig.color,
            }}
          />
        </div>
        {showText && (
          <span className="plan-progress-text" style={{ color: colorConfig.color }}>
            {progressText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`plan-progress-container ${className}`}>
      <div className="plan-progress-bar-wrapper">
        <div
          className="plan-progress-bar"
          style={{
            width: `${percentage}%`,
            backgroundColor: colorConfig.color,
          }}
        />
      </div>
      {showText && (
        <span className="plan-progress-text" style={{ color: colorConfig.color }}>
          {progressText} ({percentage}%)
        </span>
      )}
    </div>
  );
};

export default PlanProgressBar;
