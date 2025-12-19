import React, { useState, useEffect } from "react";
import { currencyAPI } from "@/services/api";

const MultiCurrencyCalculator = () => {
  const [specifications, setSpecifications] = useState([]);
  const [calculation, setCalculation] = useState(null);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestId: "",
    supplierId: "",
    supplierName: "",
    originCountry: "INDIA",
    currency: "USD",
    totalValue: 5000,
    paymentTerms: "NET_30",
    expectedDelivery: new Date().toISOString().split("T")[0],
    status: "DRAFT",
    items: [],
    originCurrency: "USD",
    shippingMethod: "AIR_FREIGHT",
    jewelryType: "FINISHED_JEWELRY_GOLD",
    notes: "",
    createdBy: "user",
    createdDate: new Date().toISOString().split("T")[0],
    specificationId: "",
    quantity: 100,
    unitCostOriginCurrency: 50,
    destinationCountry: "VIETNAM",
    insuranceRequired: false,
    expeditedProcessing: false
  });
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    fetchSpecifications();
    fetchExchangeRates();
  }, []);

  const fetchSpecifications = async () => {
    try {
      // TODO: Implement when API is ready
      // const response = await jewelrySpecAPI.getAll();
      // setSpecifications(response.data);
      setSpecifications([]);
    } catch (error) {
      console.error("Error fetching specifications:", error);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      // Fetch real exchange rates for common currencies to VND
      const currencies = ["USD", "CNY", "INR", "THB"];
      const ratePromises = currencies.map(currency =>
        currencyAPI.getExchangeRate(currency, "VND")
      );

      const responses = await Promise.all(ratePromises);
      const rates = responses.map(response => response.data);
      setExchangeRates(rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      // Fallback to mock data if API fails
      const mockRates = [
        {
          fromCurrency: "USD",
          toCurrency: "VND",
          rate: 24000,
          source: "Fallback data",
          timestamp: new Date().toISOString()
        }
      ];
      setExchangeRates(mockRates);
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.supplierName) {
      errors.push("Please enter supplier name");
    }
    if (!formData.originCountry) {
      errors.push("Please select origin country");
    }
    if (formData.totalValue <= 0) {
      errors.push("Total value must be greater than 0");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const calculateImportCost = async () => {
    let requestData = {
      ...formData,
      requestId: formData.requestId || `REQ_${Date.now()}`,
      supplierId: formData.supplierId || `SUP_${Date.now()}`
    };

    if (requestData.items.length === 0) {
      requestData.items = [
        {
          specificationId: `${formData.jewelryType}_001`,
          name: `${formData.jewelryType.replace("_", " ")} Item`,
          category: formData.jewelryType,
          quantity: 100,
          unitPrice: formData.totalValue / 100,
          currency: formData.currency,
          weightGrams: 10,
          hsCode: "7113.11",
          description: `Sample ${formData.jewelryType
            .replace("_", " ")
            .toLowerCase()}`
        }
      ];
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement when API is ready
      // const response = await currencyCalculationAPI.calculateImportCost(requestData);
      // setCalculation(response.data);

      // Mock calculation for demonstration
      const mockCalculation = {
        fobCostVnd: formData.totalValue * 24000,
        shippingCostVnd: 2000000,
        insuranceCost: 500000,
        importDutyVnd: formData.totalValue * 24000 * 0.05,
        vatVnd: formData.totalValue * 24000 * 0.1,
        customsClearanceFeesVnd: 1000000,
        totalLandedCostVnd:
          formData.totalValue * 24000 * 1.15 + 2000000 + 500000 + 1000000,
        unitLandedCostVnd:
          (formData.totalValue * 24000 * 1.15 + 2000000 + 500000 + 1000000) /
          formData.quantity,
        customsCalculation: {
          hsCode: "7113.11",
          dutyRate: 0.05,
          vatRate: 0.1,
          tradeAgreement: "ASEAN FTA"
        }
      };
      setCalculation(mockCalculation);
    } catch (error) {
      console.error("Error calculating import cost:", error);
      alert("Failed to calculate import cost. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = "VND") => {
    if (currency === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
              Multi-Currency Cost Calculator
            </h1>
            <p style={{ margin: '0', fontSize: '0.8125rem', color: '#64748b' }}>
              Calculate comprehensive import costs for jewelry with real-time exchange rates
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Updated:{" "}
              {exchangeRates.length > 0
                ? new Date(exchangeRates[0].timestamp).toLocaleTimeString()
                : "Loading..."}
            </div>
            <button
              onClick={fetchExchangeRates}
              className="admin-button admin-button-primary"
            >
              Refresh Rates
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {/* Input Form */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
            Import Parameters
          </h2>

          {validationErrors.length > 0 && (
            <div className="admin-error-state" style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                Please fix the following errors:
              </div>
              <ul style={{ fontSize: '0.8125rem', listStyle: 'disc', paddingLeft: '1.25rem', margin: 0 }}>
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                Supplier Name
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) =>
                  setFormData({ ...formData, supplierName: e.target.value })
                }
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="Enter supplier name..."
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                Total Value (USD)
              </label>
              <input
                type="number"
                value={formData.totalValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalValue: parseFloat(e.target.value) || 0
                  })
                }
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="Enter total order value..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Origin Country
                </label>
                <select
                  value={formData.originCountry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originCountry: e.target.value
                    })
                  }
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="INDIA">India</option>
                  <option value="USA">United States</option>
                  <option value="THAILAND">Thailand</option>
                  <option value="HONG_KONG">Hong Kong</option>
                  <option value="CHINA">China</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currency: e.target.value,
                      originCurrency: e.target.value
                    })
                  }
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="THB">THB - Thai Baht</option>
                  <option value="HKD">HKD - Hong Kong Dollar</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Quantity (pieces)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0
                    })
                  }
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Unit Cost ({formData.originCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.unitCostOriginCurrency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitCostOriginCurrency: parseFloat(e.target.value) || 0
                    })
                  }
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <button
              onClick={calculateImportCost}
              disabled={loading}
              className="admin-button admin-button-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Calculating...
                </>
              ) : (
                "Calculate Import Cost"
              )}
            </button>
          </div>
        </div>

        {/* Exchange Rates Panel */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
            Current Exchange Rates
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {exchangeRates.map((rate, idx) => (
              <div
                key={idx}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a' }}>
                      {rate.fromCurrency}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                      {rate.fromCurrency} to {rate.toCurrency}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Source: {rate.source}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
                    {rate.rate.toLocaleString("vi-VN", {
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(rate.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Breakdown Results */}
      {calculation && (
        <div className="admin-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
            Import Cost Breakdown
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
                FOB Cost
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
                {formatCurrency(calculation.fobCostVnd || 0)}
              </div>
            </div>

            <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
                Shipping & Logistics
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
                {formatCurrency(
                  (calculation.shippingCostVnd || 0) +
                    (calculation.insuranceCost || 0)
                )}
              </div>
            </div>

            <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
                Customs & Duties
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
                {formatCurrency(
                  (calculation.importDutyVnd || 0) + (calculation.vatVnd || 0)
                )}
              </div>
            </div>

            <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
                Total Import Cost
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
                {formatCurrency(
                  calculation.totalLandedCostVnd || calculation.totalCostVnd || 0
                )}
              </div>
            </div>
          </div>

          {/* Profit Analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Suggested Retail Price
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
                {formatCurrency(calculation.totalLandedCostVnd * 2.5)}
              </div>
            </div>
            <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Gross Margin</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669' }}>
                {formatPercentage(0.6)}
              </div>
            </div>
            <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Break-even Quantity
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
                {Math.ceil(
                  calculation.totalLandedCostVnd / 100000
                ).toLocaleString()}{" "}
                pieces
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiCurrencyCalculator;
