import React, { useState, useEffect, useCallback } from "react";
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
      <div className="admin-loading-state">
        Loading vendor matches...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card" style={{ padding: '1.5rem' }}>
        <div className="admin-error-state" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
        {onBack && (
          <button
            onClick={handleBack}
            className="admin-button admin-button-secondary"
          >
            Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
              Vendor Matching
            </h1>
            <p style={{ margin: '0', fontSize: '0.875rem', color: '#64748b' }}>
              {collectionPlan?.name} • Select the best vendors for each age group
            </p>
          </div>
          {onBack && (
            <button
              onClick={handleBack}
              className="admin-button admin-button-secondary"
            >
              Back
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
              Total Cost
            </p>
            <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: '600', color: '#0f172a' }}>
              {formatCurrency(getTotalCost())}
            </p>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
              Est. Delivery
            </p>
            <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: '600', color: '#0f172a' }}>
              {getEstimatedDeliveryDate().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
              Vendors Selected
            </p>
            <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: '600', color: '#0f172a' }}>
              {Object.keys(selectedVendors).length}
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Matching Table */}
      <div className="admin-card">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
            Age Group × Variant × Vendor Options
          </h2>
        </div>

        {vendorMatches.length === 0 ? (
          <div className="admin-empty-state">
            No vendor matches found. Create a collection plan first to see vendor recommendations.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Age Group</th>
                  <th>Variant</th>
                  <th>Vendor</th>
                  <th>Lead Time</th>
                  <th>Total Cost</th>
                  <th>Match Score</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {vendorMatches.map((match) => (
                  <React.Fragment key={match.ageGroupId}>
                    {match.vendorOptions?.map((option, index) => (
                      <tr key={`${match.ageGroupId}-${option.vendorId}`}>
                        {index === 0 && (
                          <>
                            <td style={{ borderRight: '1px solid #e2e8f0' }} rowSpan={match.vendorOptions.length}>
                              <div style={{ fontWeight: '500', color: '#0f172a' }}>
                                {match.ageGroupName}
                              </div>
                            </td>
                            <td style={{ borderRight: '1px solid #e2e8f0' }} rowSpan={match.vendorOptions.length}>
                              {match.variant}
                            </td>
                          </>
                        )}
                        <td>
                          <div>
                            <div style={{ fontWeight: '500', color: '#0f172a', marginBottom: '0.25rem' }}>
                              {option.vendorName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {option.vendorCountry} • {option.paymentTerms}
                            </div>
                          </div>
                        </td>
                        <td>{option.leadTimeDays} days</td>
                        <td>
                          <div style={{ fontWeight: '500', color: '#0f172a' }}>
                            {formatCurrency(option.totalCost)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {formatCurrency(option.unitCost)}/unit
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '4rem', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${option.matchScore}%`,
                                  height: '100%',
                                  backgroundColor: '#059669',
                                  borderRadius: '2px'
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '0.8125rem', color: '#0f172a' }}>
                              {option.matchScore}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleVendorSelect(
                                match.ageGroupId,
                                option.vendorId
                              )
                            }
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: `2px solid ${selectedVendors[match.ageGroupId] === option.vendorId ? '#0f172a' : '#cbd5e1'}`,
                              backgroundColor: selectedVendors[match.ageGroupId] === option.vendorId ? '#0f172a' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            {selectedVendors[match.ageGroupId] === option.vendorId && (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }}></div>
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
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          {onBack && (
            <button
              onClick={handleBack}
              className="admin-button admin-button-secondary"
            >
              Previous
            </button>
          )}
          {onNext && vendorMatches.length > 0 && (
            <button
              onClick={handleNext}
              className="admin-button admin-button-primary"
              style={{ marginLeft: 'auto' }}
            >
              Build Purchase Orders
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorMatching;
