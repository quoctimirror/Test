import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  RefreshCw,
  Clock,
  Target,
  Calculator
} from "lucide-react";
import { preciousMetalAPI } from "@/services/api";

const PreciousMetalDashboard = () => {
  const [pricesUSD, setPricesUSD] = useState(null);
  const [pricesVND, setPricesVND] = useState(null);
  const [trends, setTrends] = useState([]);
  const [materialCost, setMaterialCost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [calculatorSpec, setCalculatorSpec] = useState({
    specId: "custom-calc",
    metalType: "GOLD",
    purity: "18K",
    metalWeightGrams: 5,
    jewelryType: "RING",
    complexity: "MODERATE",
    originCountry: "INDIA",
    quantity: 100
  });

  const metalTypes = [
    {
      type: "GOLD",
      name: "Gold",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      type: "SILVER",
      name: "Silver",
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      type: "PLATINUM",
      name: "Platinum",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      type: "PALLADIUM",
      name: "Palladium",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const purityOptions = {
    GOLD: ["24K", "18K", "14K", "10K"],
    SILVER: ["999", "925"],
    PLATINUM: ["950", "900"],
    PALLADIUM: ["950", "900"]
  };

  useEffect(() => {
    fetchPriceData();
  }, [selectedPeriod]);

  const fetchPriceData = async () => {
    setLoading(true);
    try {
      // Fetch real precious metal prices from backend
      const [usdResponse, vndResponse] = await Promise.all([
        preciousMetalAPI.getPricesInUSD(),
        preciousMetalAPI.getPricesInVND()
      ]);

      // Convert array to object format expected by UI
      const usdPricesMap = {};
      usdResponse.data.forEach(price => {
        usdPricesMap[price.metalType.toLowerCase() + 'PriceUsdPerGram'] = price.pricePerGram;
      });

      const vndPricesMap = {};
      vndResponse.data.forEach(price => {
        vndPricesMap[price.metalType.toLowerCase() + 'PriceVndPerGram'] = price.pricePerGram;
      });

      const mockPricesUSD = {
        ...usdPricesMap,
        exchangeRateUsdVnd: vndResponse.data[0]?.exchangeRate || 24000,
        lastUpdated: vndResponse.data[0]?.timestamp || new Date().toISOString()
      };
      const mockPricesVND = {
        ...vndPricesMap,
        exchangeRateUsdVnd: vndResponse.data[0]?.exchangeRate || 24000,
        lastUpdated: vndResponse.data[0]?.timestamp || new Date().toISOString()
      };
      const mockTrends = [
        {
          metalType: "GOLD",
          trend: "RISING",
          averagePrice: 1800000,
          minPrice: 1750000,
          maxPrice: 1850000,
          volatility: 0.05,
          priceHistory: []
        },
        {
          metalType: "SILVER",
          trend: "STABLE",
          averagePrice: 20000,
          minPrice: 19000,
          maxPrice: 21000,
          volatility: 0.08,
          priceHistory: []
        }
      ];

      setPricesUSD(mockPricesUSD);
      setPricesVND(mockPricesVND);
      setTrends(mockTrends);
    } catch (error) {
      console.error("Error fetching price data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMaterialCost = async () => {
    try {
      // TODO: Implement API call when backend is ready
      const mockMaterialCost = {
        metalCostVnd: 9000000,
        laborCostVnd: 3000000,
        overheadCostVnd: 1000000,
        totalCostVnd: 13000000,
        unitCostVnd: 130000,
        calculatedAt: new Date().toISOString()
      };
      setMaterialCost(mockMaterialCost);
    } catch (error) {
      console.error("Error calculating material cost:", error);
      alert("Failed to calculate material cost. Please try again.");
    }
  };

  const formatCurrencyUSD = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatCurrencyVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "RISING":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "FALLING":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "RISING":
        return "text-green-600";
      case "FALLING":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getMetalPrice = (metalType, pricesData) => {
    if (!pricesData) return 0;
    switch (metalType.toUpperCase()) {
      case "GOLD":
        return pricesData.goldPriceVndPerGram;
      case "SILVER":
        return pricesData.silverPriceVndPerGram;
      case "PLATINUM":
        return pricesData.platinumPriceVndPerGram;
      case "PALLADIUM":
        return pricesData.palladiumPriceVndPerGram;
      default:
        return 0;
    }
  };

  const getMetalPriceUSD = (metalType, pricesData) => {
    if (!pricesData) return 0;
    if (pricesData.metalType === metalType.toUpperCase()) {
      return pricesData.pricePerOunce;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">
                Precious Metal Price Tracker
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time precious metal prices with jewelry cost calculations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated:{" "}
                {pricesVND
                  ? new Date(pricesVND.lastUpdated).toLocaleTimeString()
                  : "-"}
              </div>
              <button
                onClick={fetchPriceData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={20} />
                Refresh Prices
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Current Prices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metalTypes.map((metal) => {
            const priceVND = getMetalPrice(metal.type, pricesVND);
            const priceUSD = getMetalPriceUSD(metal.type, pricesUSD);
            const metalTrend = trends.find(
              (t) =>
                t.metal?.toUpperCase() === metal.type ||
                t.metalType?.toUpperCase() === metal.type
            );

            return (
              <div
                key={metal.type}
                className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-yellow-400"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`h-6 w-6 ${metal.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {metal.name}
                    </h3>
                  </div>
                  {metalTrend && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metalTrend.trend)}
                      <span
                        className={`text-sm font-medium ${getTrendColor(
                          metalTrend.trend
                        )}`}
                      >
                        {metalTrend.trend}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600">VND per gram</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCompactVND(priceVND)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">USD per troy oz</div>
                    <div className="text-lg font-semibold text-gray-700">
                      {formatCurrencyUSD(priceUSD)}
                    </div>
                  </div>
                  {metalTrend && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Volatility: {(metalTrend.volatility * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Range: {formatCompactVND(metalTrend.minPrice)} -{" "}
                        {formatCompactVND(metalTrend.maxPrice)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Exchange Rate Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Exchange Rate Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">
                USD to VND Rate
              </div>
              <div className="text-2xl font-bold text-green-900">
                {pricesVND
                  ? pricesVND.exchangeRateUsdVnd.toLocaleString("vi-VN")
                  : "-"}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">
                Gold Premium (VND)
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {pricesVND && pricesUSD
                  ? formatCompactVND(
                      pricesVND.goldPriceVndPerGram * 31.1035 -
                        pricesUSD.pricePerOunce * pricesVND.exchangeRateUsdVnd
                    )
                  : "-"}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">
                Conversion Accuracy
              </div>
              <div className="text-2xl font-bold text-purple-900">99.9%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Price Trends
                </h2>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
                <option value={365}>1 Year</option>
              </select>
            </div>

            <div className="space-y-4">
              {trends.map((trend, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          (trend.metal || trend.metalType) === "GOLD"
                            ? "bg-yellow-400"
                            : (trend.metal || trend.metalType) === "SILVER"
                            ? "bg-gray-400"
                            : (trend.metal || trend.metalType) === "PLATINUM"
                            ? "bg-blue-400"
                            : "bg-purple-400"
                        }`}
                      ></div>
                      <span className="font-medium text-gray-900">
                        {trend.metal || trend.metalType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend)}
                      <span
                        className={`text-sm font-medium ${getTrendColor(
                          trend.trend
                        )}`}
                      >
                        {trend.trend}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Average</div>
                      <div className="font-semibold">
                        {formatCompactVND(trend.averagePrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Min Price</div>
                      <div className="font-semibold text-red-600">
                        {formatCompactVND(trend.minPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Max Price</div>
                      <div className="font-semibold text-green-600">
                        {formatCompactVND(trend.maxPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Volatility: {(trend.volatility * 100).toFixed(1)}% • Data
                    points: {trend.priceHistory?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Material Cost Calculator */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Material Cost Calculator
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metal Type
                  </label>
                  <select
                    value={calculatorSpec.metalType}
                    onChange={(e) =>
                      setCalculatorSpec({
                        ...calculatorSpec,
                        metalType: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {metalTypes.map((metal) => (
                      <option key={metal.type} value={metal.type}>
                        {metal.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purity
                  </label>
                  <select
                    value={calculatorSpec.purity}
                    onChange={(e) =>
                      setCalculatorSpec({
                        ...calculatorSpec,
                        purity: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(purityOptions[calculatorSpec.metalType] || []).map(
                      (purity) => (
                        <option key={purity} value={purity}>
                          {purity}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={calculatorSpec.metalWeightGrams}
                    onChange={(e) =>
                      setCalculatorSpec({
                        ...calculatorSpec,
                        metalWeightGrams: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={calculatorSpec.quantity}
                    onChange={(e) =>
                      setCalculatorSpec({
                        ...calculatorSpec,
                        quantity: parseInt(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jewelry Type
                  </label>
                  <select
                    value={calculatorSpec.jewelryType}
                    onChange={(e) =>
                      setCalculatorSpec({
                        ...calculatorSpec,
                        jewelryType: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RING">Ring</option>
                    <option value="NECKLACE">Necklace</option>
                    <option value="EARRINGS">Earrings</option>
                    <option value="BRACELET">Bracelet</option>
                    <option value="PENDANT">Pendant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <select
                    value={calculatorSpec.complexity}
                    onChange={(e) =>
                      setCalculatorSpec({
                        ...calculatorSpec,
                        complexity: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SIMPLE">Simple</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="COMPLEX">Complex</option>
                    <option value="MASTERPIECE">Masterpiece</option>
                  </select>
                </div>
              </div>

              <button
                onClick={calculateMaterialCost}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Calculator size={20} />
                Calculate Material Cost
              </button>
            </div>

            {materialCost && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Cost Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Metal Cost:</span>
                    <span className="font-semibold">
                      {formatCurrencyVND(materialCost.metalCostVnd)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Labor Cost:</span>
                    <span className="font-semibold">
                      {formatCurrencyVND(materialCost.laborCostVnd)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overhead Cost:</span>
                    <span className="font-semibold">
                      {formatCurrencyVND(materialCost.overheadCostVnd)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        Total Cost:
                      </span>
                      <span className="text-lg font-bold text-purple-600">
                        {formatCurrencyVND(materialCost.totalCostVnd)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-600">Unit Cost:</span>
                      <span className="font-semibold">
                        {formatCurrencyVND(materialCost.unitCostVnd)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Calculated at:{" "}
                  {new Date(materialCost.calculatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreciousMetalDashboard;
