import React, { useState, useEffect } from "react";
import {
  Search,
  Target,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  RefreshCw,
  Award
} from "lucide-react";
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
    if (score >= 0.8) return "text-green-600 bg-green-100";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getViabilityIcon = (suggestion) => {
    if (suggestion.isViable) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Target className="h-8 w-8 mr-3 text-blue-600" />
                Vendor Optimization
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Find the best vendors for your jewelry orders based on cost,
                quality, and timeline
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Requirements Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Order Requirements
              </h2>

              <div className="space-y-4">
                {/* Basic Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={orderRequirement.deadline}
                    onChange={(e) =>
                      handleInputChange("deadline", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>

                {/* Vendor Type Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accept Vendor Types
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={orderRequirement.acceptParts}
                        onChange={(e) =>
                          handleInputChange("acceptParts", e.target.checked)
                        }
                        className="mr-2"
                      />
                      Accept Parts Only Vendors
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={orderRequirement.acceptWholePieces}
                        onChange={(e) =>
                          handleInputChange(
                            "acceptWholePieces",
                            e.target.checked
                          )
                        }
                        className="mr-2"
                      />
                      Accept Whole Pieces Vendors
                    </label>
                  </div>
                </div>

                {/* Country Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Countries
                  </label>
                  <input
                    type="text"
                    value={orderRequirement.preferredCountries?.join(", ") || ""}
                    onChange={(e) =>
                      handleArrayInputChange("preferredCountries", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="China, Vietnam, India"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated list
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excluded Countries
                  </label>
                  <input
                    type="text"
                    value={orderRequirement.excludedCountries?.join(", ") || ""}
                    onChange={(e) =>
                      handleArrayInputChange("excludedCountries", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Countries to exclude"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated list
                  </p>
                </div>

                {/* Additional Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No requirement</option>
                    <option value="BASIC">Basic</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="LUXURY">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={orderRequirement.requiresCertification}
                      onChange={(e) =>
                        handleInputChange(
                          "requiresCertification",
                          e.target.checked
                        )
                      }
                      className="mr-2"
                    />
                    Requires Certification
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={orderRequirement.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional requirements or notes..."
                  />
                </div>

                <button
                  onClick={handleGetSuggestions}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Finding Vendors...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Find Optimal Vendors
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Vendor Suggestions ({suggestions.length})
                  </h2>

                  {suggestions.length > 0 && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 text-gray-400 mr-2" />
                        <label className="flex items-center text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={filterViable}
                            onChange={(e) => setFilterViable(e.target.checked)}
                            className="mr-1"
                          />
                          Viable only
                        </label>
                      </div>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
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

              <div className="p-6">
                {suggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No vendor suggestions yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Fill in your order requirements and click "Find Optimal
                      Vendors" to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredAndSortedSuggestions().map(
                      (suggestion, index) => (
                        <div
                          key={suggestion.vendorId}
                          className={`border rounded-lg p-4 ${
                            suggestion.isViable
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              {getViabilityIcon(suggestion)}
                              <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  {suggestion.vendorName}
                                  {index === 0 && (
                                    <span title="Best Match">
                                      <Award className="h-4 w-4 text-yellow-500 ml-2" />
                                    </span>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {suggestion.country} →{" "}
                                  {suggestion.countryOfOrigin} •{" "}
                                  {suggestion.vendorType}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ${suggestion.estimatedTotalCost.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                ${suggestion.costPerPiece.toFixed(2)}/piece
                              </div>
                            </div>
                          </div>

                          {/* Scores */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                                  suggestion.totalValueScore
                                )}`}
                              >
                                {(suggestion.totalValueScore * 100).toFixed(0)}%
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Total Value
                              </p>
                            </div>

                            <div className="text-center">
                              <div
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                                  suggestion.costEfficiencyScore
                                )}`}
                              >
                                {(suggestion.costEfficiencyScore * 100).toFixed(
                                  0
                                )}
                                %
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Cost Efficiency
                              </p>
                            </div>

                            <div className="text-center">
                              <div
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                                  suggestion.timeEfficiencyScore
                                )}`}
                              >
                                {(suggestion.timeEfficiencyScore * 100).toFixed(
                                  0
                                )}
                                %
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Time Efficiency
                              </p>
                            </div>

                            <div className="text-center">
                              <div
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                                  suggestion.qualityScore
                                )}`}
                              >
                                {(suggestion.qualityScore * 100).toFixed(0)}%
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Quality
                              </p>
                            </div>
                          </div>

                          {/* Timeline and Feasibility */}
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {suggestion.leadTimeDays} days lead time
                              {suggestion.canMeetDeadline ? (
                                <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 ml-2" />
                              )}
                            </div>

                            <div className="text-right">
                              {suggestion.canMeetDeadline
                                ? "Can meet deadline"
                                : "Cannot meet deadline"}
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="bg-white p-3 rounded border">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Cost Breakdown
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-gray-600">Base:</span>
                                <span className="font-medium ml-1">
                                  ${suggestion.costBreakdown.baseCost.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Labor:</span>
                                <span className="font-medium ml-1">
                                  $
                                  {suggestion.costBreakdown.laborCost.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Material:</span>
                                <span className="font-medium ml-1">
                                  $
                                  {suggestion.costBreakdown.materialCost.toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Shipping:</span>
                                <span className="font-medium ml-1">
                                  $
                                  {suggestion.costBreakdown.shippingFee.toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Import Tax:</span>
                                <span className="font-medium ml-1">
                                  ${suggestion.costBreakdown.importTax.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">VAT:</span>
                                <span className="font-medium ml-1">
                                  ${suggestion.costBreakdown.vatTax.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Customs:</span>
                                <span className="font-medium ml-1">
                                  $
                                  {suggestion.costBreakdown.customsTax.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Tax:</span>
                                <span className="font-medium ml-1">
                                  ${suggestion.costBreakdown.totalTax.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Limitations and Recommendations */}
                          {suggestion.limitations &&
                            suggestion.limitations.length > 0 && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                                  Limitations:
                                </h4>
                                <ul className="text-xs text-yellow-700 list-disc list-inside">
                                  {suggestion.limitations.map((limitation, i) => (
                                    <li key={i}>{limitation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {suggestion.recommendations &&
                            suggestion.recommendations.length > 0 && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                <h4 className="text-sm font-medium text-blue-800 mb-1">
                                  Recommendations:
                                </h4>
                                <ul className="text-xs text-blue-700 list-disc list-inside">
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
      </div>
    </div>
  );
};

export default VendorOptimization;
