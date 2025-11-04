import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, MapPin, DollarSign } from "lucide-react";
import { vendorMatchingAPI } from "@/services/api";

const VendorMatching = ({ collectionPlanId, onBack, onNext }) => {
  const [vendorMatches, setVendorMatches] = useState([]);
  const [collectionPlan, setCollectionPlan] = useState(null);
  const [selectedVendors, setSelectedVendors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!collectionPlanId) {
      setError("No collection plan ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch real vendor matches from backend
      const vendorResponse = await vendorMatchingAPI.getMatchesByCollectionPlan(collectionPlanId);
      const mockVendorMatches = vendorResponse.data || [];
      const mockCollectionPlan = {
        id: collectionPlanId,
        name: "Collection Plan " + collectionPlanId
      };

      setVendorMatches(mockVendorMatches);
      setCollectionPlan(mockCollectionPlan);

      // Pre-select best vendors (highest match score)
      const defaultSelections = {};
      mockVendorMatches.forEach((match) => {
        if (match.vendorOptions && match.vendorOptions.length > 0) {
          defaultSelections[match.ageGroupId] = match.vendorOptions[0].vendorId;
        }
      });
      setSelectedVendors(defaultSelections);
    } catch (err) {
      console.error("Error fetching vendor matches:", err);
      setError(err.message || "Failed to load vendor matches");
    } finally {
      setLoading(false);
    }
  }, [collectionPlanId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVendorSelect = (ageGroupId, vendorId) => {
    setSelectedVendors((prev) => ({
      ...prev,
      [ageGroupId]: vendorId
    }));
  };

  const handleNext = () => {
    if (onNext) {
      onNext({ selectedVendors });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const getTotalCost = () => {
    return vendorMatches.reduce((total, match) => {
      const selectedVendorId = selectedVendors[match.ageGroupId];
      const selectedOption = match.vendorOptions?.find(
        (option) => option.vendorId === selectedVendorId
      );
      return total + (selectedOption?.totalCost || 0);
    }, 0);
  };

  const getEstimatedDeliveryDate = () => {
    const maxLeadTime = vendorMatches.reduce((max, match) => {
      const selectedVendorId = selectedVendors[match.ageGroupId];
      const selectedOption = match.vendorOptions?.find(
        (option) => option.vendorId === selectedVendorId
      );
      return Math.max(max, selectedOption?.leadTimeDays || 0);
    }, 0);

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + maxLeadTime);
    return deliveryDate;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        {onBack && (
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vendor Matching
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {collectionPlan?.name} • Select the best vendors for each age
                group
              </p>
            </div>
            {onBack && (
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(getTotalCost())}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Est. Delivery</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getEstimatedDeliveryDate().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Vendors Selected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(selectedVendors).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Matching Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Age Group × Variant × Vendor Options
            </h2>
          </div>

          {vendorMatches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No vendor matches found.</p>
              <p className="text-sm mt-2">
                Create a collection plan first to see vendor recommendations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Match Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorMatches.map((match) => (
                    <React.Fragment key={match.ageGroupId}>
                      {match.vendorOptions?.map((option, index) => (
                        <tr
                          key={`${match.ageGroupId}-${option.vendorId}`}
                          className="hover:bg-gray-50"
                        >
                          {index === 0 && (
                            <>
                              <td
                                className="px-6 py-4 whitespace-nowrap border-r border-gray-200"
                                rowSpan={match.vendorOptions.length}
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {match.ageGroupName}
                                </div>
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap border-r border-gray-200"
                                rowSpan={match.vendorOptions.length}
                              >
                                <div className="text-sm text-gray-900">
                                  {match.variant}
                                </div>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {option.vendorName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {option.vendorCountry} • {option.paymentTerms}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {option.leadTimeDays} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(option.totalCost)}
                            <div className="text-xs text-gray-500">
                              {formatCurrency(option.unitCost)}/unit
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${option.matchScore}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-900">
                                {option.matchScore}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() =>
                                handleVendorSelect(
                                  match.ageGroupId,
                                  option.vendorId
                                )
                              }
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedVendors[match.ageGroupId] ===
                                option.vendorId
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedVendors[match.ageGroupId] ===
                                option.vendorId && (
                                <Check size={16} className="text-white" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            {onBack && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Previous
              </button>
            )}
            {onNext && vendorMatches.length > 0 && (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2 ml-auto"
              >
                Build Purchase Orders
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorMatching;
