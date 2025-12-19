import React, { useState, useEffect } from "react";
import { vendorOptimizationAPI } from "@/services/api";

const VendorOptimization = () => {
  const [orderRequirement, setOrderRequirement] = useState({
    totalStakeValue: 0,
    maxBudget: 0,
    totalPieces: 0,
    deadline: "",
    acceptParts: true,
    acceptWholePieces: true,
    preferredCountries: [],
    excludedCountries: [],
    minQualityLevel: "",
    requiresCertification: false,
    currency: "USD",
    notes: ""
  });

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("totalValueScore");
  const [filterViable, setFilterViable] = useState(false);

  useEffect(() => {
    // Set default deadline to 30 days from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);
    setOrderRequirement((prev) => ({
      ...prev,
      deadline: defaultDeadline.toISOString().split("T")[0]
    }));
  }, []);

  const handleGetSuggestions = async () => {
    if (
      !orderRequirement.maxBudget ||
      !orderRequirement.totalPieces ||
      !orderRequirement.deadline
    ) {
      setError(
        "Please fill in required fields: Max Budget, Total Pieces, and Deadline"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call real backend API
      const response = await vendorOptimizationAPI.calculateOptimalVendors(orderRequirement);
      setSuggestions(response.data || []);
    } catch (err) {
      console.error("Error getting vendor suggestions:", err);
      setError(
        err.response?.data?.message || "Failed to get vendor suggestions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOrderRequirement((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, value) => {
    const countries = value
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    handleInputChange(field, countries);
  };

  const getFilteredAndSortedSuggestions = () => {
    let filtered = suggestions;

    if (filterViable) {
      filtered = filtered.filter((s) => s.isViable);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return bValue - aValue; // Descending order
    });
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return { bg: '#ecfdf5', color: '#059669' };
    if (score >= 0.6) return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#fee2e2', color: '#dc2626' };
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
            Vendor Optimization
          </h1>
          <p style={{ margin: '0', fontSize: '0.875rem', color: '#64748b' }}>
            Find the best vendors for your jewelry orders based on cost, quality, and timeline
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Order Requirements Form */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
            Order Requirements
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Basic Requirements */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Max Budget (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={orderRequirement.maxBudget}
                onChange={(e) =>
                  handleInputChange(
                    "maxBudget",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="admin-input"
                placeholder="10000.00"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Total Pieces *
              </label>
              <input
                type="number"
                min="1"
                value={orderRequirement.totalPieces}
                onChange={(e) =>
                  handleInputChange(
                    "totalPieces",
                    parseInt(e.target.value) || 0
                  )
                }
                className="admin-input"
                placeholder="100"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Deadline *
              </label>
              <input
                type="date"
                value={orderRequirement.deadline}
                onChange={(e) =>
                  handleInputChange("deadline", e.target.value)
                }
                className="admin-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Total Stake Value (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={orderRequirement.totalStakeValue || ""}
                onChange={(e) =>
                  handleInputChange(
                    "totalStakeValue",
                    parseFloat(e.target.value) || undefined
                  )
                }
                className="admin-input"
                placeholder="Optional"
              />
            </div>

            {/* Vendor Type Preferences */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Accept Vendor Types
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.8125rem', color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={orderRequirement.acceptParts}
                    onChange={(e) =>
                      handleInputChange("acceptParts", e.target.checked)
                    }
                    style={{ marginRight: '0.5rem' }}
                  />
                  Accept Parts Only Vendors
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.8125rem', color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={orderRequirement.acceptWholePieces}
                    onChange={(e) =>
                      handleInputChange(
                        "acceptWholePieces",
                        e.target.checked
                      )
                    }
                    style={{ marginRight: '0.5rem' }}
                  />
                  Accept Whole Pieces Vendors
                </label>
              </div>
            </div>

            {/* Country Preferences */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Preferred Countries
              </label>
              <input
                type="text"
                value={orderRequirement.preferredCountries?.join(", ") || ""}
                onChange={(e) =>
                  handleArrayInputChange("preferredCountries", e.target.value)
                }
                className="admin-input"
                placeholder="China, Vietnam, India"
              />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Comma-separated list
              </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Excluded Countries
              </label>
              <input
                type="text"
                value={orderRequirement.excludedCountries?.join(", ") || ""}
                onChange={(e) =>
                  handleArrayInputChange("excludedCountries", e.target.value)
                }
                className="admin-input"
                placeholder="Countries to exclude"
              />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Comma-separated list
              </p>
            </div>

            {/* Additional Options */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Minimum Quality Level
              </label>
              <select
                value={orderRequirement.minQualityLevel || ""}
                onChange={(e) =>
                  handleInputChange(
                    "minQualityLevel",
                    e.target.value || undefined
                  )
                }
                className="admin-select"
              >
                <option value="">No requirement</option>
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="LUXURY">Luxury</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.8125rem', color: '#0f172a' }}>
                <input
                  type="checkbox"
                  checked={orderRequirement.requiresCertification}
                  onChange={(e) =>
                    handleInputChange(
                      "requiresCertification",
                      e.target.checked
                    )
                  }
                  style={{ marginRight: '0.5rem' }}
                />
                Requires Certification
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                Notes
              </label>
              <textarea
                value={orderRequirement.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="admin-input"
                rows={3}
                placeholder="Additional requirements or notes..."
              />
            </div>

            <button
              onClick={handleGetSuggestions}
              disabled={loading}
              className="admin-button admin-button-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Finding Vendors...' : 'Find Optimal Vendors'}
            </button>

            {error && (
              <div className="admin-error-state">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="admin-card">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: '0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                Vendor Suggestions ({suggestions.length})
              </h2>

              {suggestions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.8125rem', color: '#0f172a' }}>
                    <input
                      type="checkbox"
                      checked={filterViable}
                      onChange={(e) => setFilterViable(e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Viable only
                  </label>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="admin-select"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                  >
                    <option value="totalValueScore">Total Value Score</option>
                    <option value="costEfficiencyScore">
                      Cost Efficiency
                    </option>
                    <option value="timeEfficiencyScore">
                      Time Efficiency
                    </option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {suggestions.length === 0 ? (
              <div className="admin-empty-state">
                No vendor suggestions yet. Fill in your order requirements and click "Find Optimal Vendors" to get started.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {getFilteredAndSortedSuggestions().map(
                  (suggestion, index) => (
                    <div
                      key={suggestion.vendorId}
                      style={{
                        border: `1px solid ${suggestion.isViable ? '#a7f3d0' : '#fecaca'}`,
                        backgroundColor: suggestion.isViable ? '#ecfdf5' : '#fee2e2',
                        borderRadius: '6px',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                            {suggestion.vendorName}
                            {index === 0 && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#d97706' }} title="Best Match">
                                ★
                              </span>
                            )}
                          </h3>
                          <p style={{ margin: '0', fontSize: '0.75rem', color: '#64748b' }}>
                            {suggestion.country} → {suggestion.countryOfOrigin} • {suggestion.vendorType}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
                            ${suggestion.estimatedTotalCost.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ${suggestion.costPerPiece.toFixed(2)}/piece
                          </div>
                        </div>
                      </div>

                      {/* Scores */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: getScoreColor(suggestion.totalValueScore).bg,
                              color: getScoreColor(suggestion.totalValueScore).color
                            }}
                          >
                            {(suggestion.totalValueScore * 100).toFixed(0)}%
                          </div>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                            Total Value
                          </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: getScoreColor(suggestion.costEfficiencyScore).bg,
                              color: getScoreColor(suggestion.costEfficiencyScore).color
                            }}
                          >
                            {(suggestion.costEfficiencyScore * 100).toFixed(0)}%
                          </div>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                            Cost Efficiency
                          </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: getScoreColor(suggestion.timeEfficiencyScore).bg,
                              color: getScoreColor(suggestion.timeEfficiencyScore).color
                            }}
                          >
                            {(suggestion.timeEfficiencyScore * 100).toFixed(0)}%
                          </div>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                            Time Efficiency
                          </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: getScoreColor(suggestion.qualityScore).bg,
                              color: getScoreColor(suggestion.qualityScore).color
                            }}
                          >
                            {(suggestion.qualityScore * 100).toFixed(0)}%
                          </div>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                            Quality
                          </p>
                        </div>
                      </div>

                      {/* Timeline and Feasibility */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {suggestion.leadTimeDays} days lead time
                          <span style={{ color: suggestion.canMeetDeadline ? '#059669' : '#dc2626' }}>
                            {suggestion.canMeetDeadline ? '✓' : '✗'}
                          </span>
                        </div>

                        <div>
                          {suggestion.canMeetDeadline
                            ? "Can meet deadline"
                            : "Cannot meet deadline"}
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                          Cost Breakdown
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', fontSize: '0.75rem' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Base:</span>
                            <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#0f172a' }}>
                              ${suggestion.costBreakdown.baseCost.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Labor:</span>
                            <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#0f172a' }}>
                              ${suggestion.costBreakdown.laborCost.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Material:</span>
                            <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#0f172a' }}>
                              ${suggestion.costBreakdown.materialCost.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Shipping:</span>
                            <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#0f172a' }}>
                              ${suggestion.costBreakdown.shippingFee.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Import Tax:</span>
                            <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#0f172a' }}>
                              ${suggestion.costBreakdown.importTax.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>VAT:</span>
                            <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#0f172a' }}>
                              ${suggestion.costBreakdown.vatTax.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Customs:</span>
                            <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#0f172a' }}>
                              ${suggestion.costBreakdown.customsTax.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Total Tax:</span>
                            <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#0f172a' }}>
                              ${suggestion.costBreakdown.totalTax.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Limitations and Recommendations */}
                      {suggestion.limitations &&
                        suggestion.limitations.length > 0 && (
                          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', fontWeight: '500', color: '#d97706' }}>
                              Limitations:
                            </h4>
                            <ul style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#d97706' }}>
                              {suggestion.limitations.map((limitation, i) => (
                                <li key={i}>{limitation}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {suggestion.recommendations &&
                        suggestion.recommendations.length > 0 && (
                          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '6px' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', fontWeight: '500', color: '#0284c7' }}>
                              Recommendations:
                            </h4>
                            <ul style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#0284c7' }}>
                              {suggestion.recommendations.map(
                                (recommendation, i) => (
                                  <li key={i}>{recommendation}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOptimization;
