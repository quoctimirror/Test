import React, { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  Calculator,
  Info,
  RefreshCw,
  Copy,
  CheckCircle
} from "lucide-react";

const WeightUnit = {
  GRAMS: "GRAMS",
  OUNCES: "OUNCES",
  LUONG: "LUONG",
  CHI: "CHI"
};

const UnitConversionCalculator = () => {
  const [fromValue, setFromValue] = useState(1);
  const [fromUnit, setFromUnit] = useState(WeightUnit.GRAMS);
  const [toUnit, setToUnit] = useState(WeightUnit.LUONG);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversionRates, setConversionRates] = useState(null);
  const [copied, setCopied] = useState(false);

  const quickConversions = [
    {
      label: "1 lượng to grams",
      from: 1,
      fromUnit: WeightUnit.LUONG,
      toUnit: WeightUnit.GRAMS
    },
    {
      label: "1 chỉ to grams",
      from: 1,
      fromUnit: WeightUnit.CHI,
      toUnit: WeightUnit.GRAMS
    },
    {
      label: "1 ounce to grams",
      from: 1,
      fromUnit: WeightUnit.OUNCES,
      toUnit: WeightUnit.GRAMS
    },
    {
      label: "10 grams to lượng",
      from: 10,
      fromUnit: WeightUnit.GRAMS,
      toUnit: WeightUnit.LUONG
    },
    {
      label: "100 grams to chỉ",
      from: 100,
      fromUnit: WeightUnit.GRAMS,
      toUnit: WeightUnit.CHI
    },
    {
      label: "1 ounce to lượng",
      from: 1,
      fromUnit: WeightUnit.OUNCES,
      toUnit: WeightUnit.LUONG
    }
  ];

  useEffect(() => {
    loadConversionRates();
  }, []);

  useEffect(() => {
    if (fromValue > 0) {
      performConversion();
    }
  }, [fromValue, fromUnit, toUnit]);

  const loadConversionRates = async () => {
    try {
      // TODO: Implement API call when backend is ready
      // Mock conversion rates
      const mockRates = {
        GRAMS: { GRAMS: 1, OUNCES: 0.0352739, LUONG: 0.0267, CHI: 0.267 },
        OUNCES: { GRAMS: 28.3495, OUNCES: 1, LUONG: 0.756, CHI: 7.56 },
        LUONG: { GRAMS: 37.5, OUNCES: 1.3228, LUONG: 1, CHI: 10 },
        CHI: { GRAMS: 3.75, OUNCES: 0.13228, LUONG: 0.1, CHI: 1 }
      };
      setConversionRates(mockRates);
    } catch (err) {
      console.error("Failed to load conversion rates:", err);
    }
  };

  const performConversion = async () => {
    if (fromValue <= 0) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement API call when backend is ready
      // Manual conversion using mock rates
      const rate = conversionRates?.[fromUnit]?.[toUnit] || 1;
      const converted = fromValue * rate;

      const mockResult = {
        originalValue: fromValue,
        originalUnit: fromUnit,
        convertedValue: converted,
        convertedUnit: toUnit,
        conversionRate: rate,
        precision: 6
      };
      setResult(mockResult);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(err.response?.data?.message || "Conversion failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);

    if (result) {
      setFromValue(result.convertedValue);
    }
  };

  const handleQuickConversion = (preset) => {
    setFromValue(preset.from);
    setFromUnit(preset.fromUnit);
    setToUnit(preset.toUnit);
  };

  const copyResult = async () => {
    if (result) {
      const text = `${result.originalValue} ${result.originalUnit} = ${result.convertedValue} ${result.convertedUnit}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getUnitDisplay = (unit) => {
    switch (unit) {
      case WeightUnit.GRAMS:
        return "Grams (g)";
      case WeightUnit.OUNCES:
        return "Ounces (oz)";
      case WeightUnit.LUONG:
        return "Lượng (Vietnamese)";
      case WeightUnit.CHI:
        return "Chỉ (Vietnamese)";
      default:
        return unit;
    }
  };

  const getUnitInfo = (unit) => {
    switch (unit) {
      case WeightUnit.LUONG:
        return "1 lượng = 37.5 grams - Traditional Vietnamese unit for precious metals";
      case WeightUnit.CHI:
        return "1 chỉ = 3.75 grams - Traditional Vietnamese unit, 1/10 of a lượng";
      case WeightUnit.GRAMS:
        return "Standard metric unit for weight measurement";
      case WeightUnit.OUNCES:
        return "Troy ounce = 28.3495 grams - Standard for precious metals trading";
      default:
        return "";
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
                <Calculator className="h-8 w-8 mr-3 text-blue-600" />
                Jewelry Unit Converter
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Convert between grams, ounces, and Vietnamese jewelry units
                (lượng, chỉ)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Converter */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Unit Converter
            </h2>

            <div className="space-y-4">
              {/* From Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={fromValue}
                    onChange={(e) =>
                      setFromValue(parseFloat(e.target.value) || 0)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter value"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={WeightUnit.GRAMS}>Grams (g)</option>
                    <option value={WeightUnit.OUNCES}>Ounces (oz)</option>
                    <option value={WeightUnit.LUONG}>Lượng</option>
                    <option value={WeightUnit.CHI}>Chỉ</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getUnitInfo(fromUnit)}
                </p>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapUnits}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  title="Swap units"
                >
                  <ArrowRightLeft className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* To Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <span className="text-gray-700 font-medium">
                      {loading ? (
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Converting...
                        </div>
                      ) : result ? (
                        result.convertedValue.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 6
                        })
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={WeightUnit.GRAMS}>Grams (g)</option>
                    <option value={WeightUnit.OUNCES}>Ounces (oz)</option>
                    <option value={WeightUnit.LUONG}>Lượng</option>
                    <option value={WeightUnit.CHI}>Chỉ</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getUnitInfo(toUnit)}
                </p>
              </div>

              {/* Result Display */}
              {result && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">
                        Conversion Result
                      </h3>
                      <p className="text-lg font-semibold text-blue-800 mt-1">
                        {result.originalValue} {result.originalUnit} ={" "}
                        {result.convertedValue.toLocaleString("en-US", {
                          maximumFractionDigits: 6
                        })}{" "}
                        {result.convertedUnit}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Conversion rate: {result.conversionRate} • Precision:{" "}
                        {result.precision} decimal places
                      </p>
                    </div>
                    <button
                      onClick={copyResult}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                      title="Copy result"
                    >
                      {copied ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Conversions & Reference */}
          <div className="space-y-6">
            {/* Quick Conversions */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Conversions
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {quickConversions.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickConversion(preset)}
                    className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-sm"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reference Guide
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Vietnamese Jewelry Units
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>1 lượng =</span>
                        <span className="font-medium">37.5 grams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1 chỉ =</span>
                        <span className="font-medium">3.75 grams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1 lượng =</span>
                        <span className="font-medium">10 chỉ</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    International Units
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>1 troy ounce =</span>
                        <span className="font-medium">28.3495 grams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1 troy ounce =</span>
                        <span className="font-medium">0.7560 lượng</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1 gram =</span>
                        <span className="font-medium">0.0267 lượng</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Common Jewelry Weights
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Wedding ring:</span>
                        <span className="font-medium">2-6 grams (0.5-1.6 chỉ)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chain necklace:</span>
                        <span className="font-medium">5-20 grams (1.3-5.3 chỉ)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pendant:</span>
                        <span className="font-medium">1-10 grams (0.3-2.7 chỉ)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Earrings (pair):</span>
                        <span className="font-medium">2-8 grams (0.5-2.1 chỉ)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversion Rates Table */}
            {conversionRates && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Conversion Matrix
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-1 text-left">From → To</th>
                        <th className="px-2 py-1 text-center">Grams</th>
                        <th className="px-2 py-1 text-center">Ounces</th>
                        <th className="px-2 py-1 text-center">Lượng</th>
                        <th className="px-2 py-1 text-center">Chỉ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(conversionRates).map(
                        ([fromUnitKey, rates]) => (
                          <tr key={fromUnitKey}>
                            <td className="px-2 py-1 font-medium">
                              {getUnitDisplay(fromUnitKey)}
                            </td>
                            <td className="px-2 py-1 text-center">
                              {rates.GRAMS?.toFixed(4) || "1.0000"}
                            </td>
                            <td className="px-2 py-1 text-center">
                              {rates.OUNCES?.toFixed(4) || "—"}
                            </td>
                            <td className="px-2 py-1 text-center">
                              {rates.LUONG?.toFixed(4) || "—"}
                            </td>
                            <td className="px-2 py-1 text-center">
                              {rates.CHI?.toFixed(4) || "—"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConversionCalculator;
