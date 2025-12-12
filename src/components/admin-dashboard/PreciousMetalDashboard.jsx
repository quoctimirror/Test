import React, { useState, useEffect } from "react";
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

  const getTrendText = (trend) => {
    switch (trend) {
      case "RISING":
        return "↑";
      case "FALLING":
        return "↓";
      default:
        return "→";
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "RISING":
        return "#059669";
      case "FALLING":
        return "#dc2626";
      default:
        return "#64748b";
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
      <div className="admin-empty-state">
        Loading precious metal prices...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
              Precious Metal Price Tracker
            </h1>
            <p style={{ margin: '0', fontSize: '0.8125rem', color: '#64748b' }}>
              Real-time precious metal prices with jewelry cost calculations
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Updated:{" "}
              {pricesVND
                ? new Date(pricesVND.lastUpdated).toLocaleTimeString()
                : "-"}
            </div>
            <button
              onClick={fetchPriceData}
              className="admin-button admin-button-primary"
            >
              Refresh Prices
            </button>
          </div>
        </div>
      </div>

      {/* Current Prices Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
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
              className="admin-card"
              style={{ padding: '1.5rem', borderLeft: '3px solid #0f172a' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {metal.name}
                </h3>
                {metalTrend && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', color: getTrendColor(metalTrend.trend) }}>
                      {getTrendText(metalTrend.trend)}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: getTrendColor(metalTrend.trend) }}>
                      {metalTrend.trend}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>VND per gram</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
                    {formatCompactVND(priceVND)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>USD per troy oz</div>
                  <div style={{ fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                    {formatCurrencyUSD(priceUSD)}
                  </div>
                </div>
                {metalTrend && (
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                      Volatility: {(metalTrend.volatility * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
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
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
          Exchange Rate Information
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
              USD to VND Rate
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
              {pricesVND
                ? pricesVND.exchangeRateUsdVnd.toLocaleString("vi-VN")
                : "-"}
            </div>
          </div>
          <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
              Gold Premium (VND)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
              {pricesVND && pricesUSD
                ? formatCompactVND(
                    pricesVND.goldPriceVndPerGram * 31.1035 -
                      pricesUSD.pricePerOunce * pricesVND.exchangeRateUsdVnd
                  )
                : "-"}
            </div>
          </div>
          <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
              Conversion Accuracy
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>99.9%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Price Trends Chart */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
              Price Trends
            </h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className="admin-select"
            >
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={365}>1 Year</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trends.map((trend, idx) => (
              <div
                key={idx}
                style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor:
                          (trend.metal || trend.metalType) === "GOLD"
                            ? "#facc15"
                            : (trend.metal || trend.metalType) === "SILVER"
                            ? "#94a3b8"
                            : (trend.metal || trend.metalType) === "PLATINUM"
                            ? "#60a5fa"
                            : "#a78bfa"
                      }}
                    ></div>
                    <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '0.8125rem' }}>
                      {trend.metal || trend.metalType}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: getTrendColor(trend.trend) }}>
                      {getTrendText(trend.trend)}
                    </span>
                    <span
                      style={{ fontSize: '0.75rem', fontWeight: '500', color: getTrendColor(trend.trend) }}
                    >
                      {trend.trend}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.8125rem' }}>
                  <div>
                    <div style={{ color: '#64748b' }}>Average</div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>
                      {formatCompactVND(trend.averagePrice)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>Min Price</div>
                    <div style={{ fontWeight: '600', color: '#dc2626' }}>
                      {formatCompactVND(trend.minPrice)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>Max Price</div>
                    <div style={{ fontWeight: '600', color: '#059669' }}>
                      {formatCompactVND(trend.maxPrice)}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: '#64748b' }}>
                  Volatility: {(trend.volatility * 100).toFixed(1)}% • Data
                  points: {trend.priceHistory?.length || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Cost Calculator */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
            Material Cost Calculator
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="admin-label">
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
                  className="admin-select"
                >
                  {metalTypes.map((metal) => (
                    <option key={metal.type} value={metal.type}>
                      {metal.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="admin-label">
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
                  className="admin-select"
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
                <label className="admin-label">
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
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">
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
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">
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
                  className="admin-select"
                >
                  <option value="RING">Ring</option>
                  <option value="NECKLACE">Necklace</option>
                  <option value="EARRINGS">Earrings</option>
                  <option value="BRACELET">Bracelet</option>
                  <option value="PENDANT">Pendant</option>
                </select>
              </div>

              <div>
                <label className="admin-label">
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
                  className="admin-select"
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
              className="admin-button admin-button-primary"
              style={{ width: '100%' }}
            >
              Calculate Material Cost
            </button>
          </div>

          {materialCost && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem' }}>
                Cost Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>Metal Cost:</span>
                  <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.8125rem' }}>
                    {formatCurrencyVND(materialCost.metalCostVnd)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>Labor Cost:</span>
                  <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.8125rem' }}>
                    {formatCurrencyVND(materialCost.laborCostVnd)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>Overhead Cost:</span>
                  <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.8125rem' }}>
                    {formatCurrencyVND(materialCost.overheadCostVnd)}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '0.8125rem' }}>
                      Total Cost:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                      {formatCurrencyVND(materialCost.totalCostVnd)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>Unit Cost:</span>
                    <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.8125rem' }}>
                      {formatCurrencyVND(materialCost.unitCostVnd)}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.6875rem', color: '#64748b' }}>
                Calculated at:{" "}
                {new Date(materialCost.calculatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreciousMetalDashboard;
