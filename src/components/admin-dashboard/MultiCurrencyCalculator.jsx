import React, { useState, useEffect } from "react";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Globe,
  Truck,
  Shield,
  FileText,
  AlertCircle
} from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Multi-Currency Cost Calculator
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Calculate comprehensive import costs for jewelry with real-time
                exchange rates
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Exchange rates updated:{" "}
                {exchangeRates.length > 0
                  ? new Date(exchangeRates[0].timestamp).toLocaleTimeString()
                  : "Loading..."}
              </div>
              <button
                onClick={fetchExchangeRates}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <TrendingUp size={20} />
                Refresh Rates
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Import Parameters
              </h2>
            </div>

            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Please fix the following errors:
                  </span>
                </div>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total order value..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INDIA">India</option>
                    <option value="USA">United States</option>
                    <option value="THAILAND">Thailand</option>
                    <option value="HONG_KONG">Hong Kong</option>
                    <option value="CHINA">China</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="THB">THB - Thai Baht</option>
                    <option value="HKD">HKD - Hong Kong Dollar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={calculateImportCost}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Calculator size={20} />
                )}
                {loading ? "Calculating..." : "Calculate Import Cost"}
              </button>
            </div>
          </div>

          {/* Exchange Rates Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Current Exchange Rates
              </h2>
            </div>

            <div className="space-y-3">
              {exchangeRates.map((rate, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {rate.fromCurrency}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {rate.fromCurrency} to {rate.toCurrency}
                      </div>
                      <div className="text-sm text-gray-500">
                        Source: {rate.source}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {rate.rate.toLocaleString("vi-VN", {
                        maximumFractionDigits: 0
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
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
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Import Cost Breakdown
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    FOB Cost
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(calculation.fobCostVnd || 0)}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    Shipping & Logistics
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(
                    (calculation.shippingCostVnd || 0) +
                      (calculation.insuranceCost || 0)
                  )}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">
                    Customs & Duties
                  </span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {formatCurrency(
                    (calculation.importDutyVnd || 0) + (calculation.vatVnd || 0)
                  )}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">
                    Total Import Cost
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(
                    calculation.totalLandedCostVnd || calculation.totalCostVnd || 0
                  )}
                </div>
              </div>
            </div>

            {/* Profit Analysis */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Suggested Retail Price
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(calculation.totalLandedCostVnd * 2.5)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Gross Margin</div>
                <div className="text-xl font-bold text-green-600">
                  {formatPercentage(0.6)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Break-even Quantity
                </div>
                <div className="text-xl font-bold text-blue-600">
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
    </div>
  );
};

export default MultiCurrencyCalculator;
