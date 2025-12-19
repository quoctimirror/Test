import React, { useState, useEffect } from "react";

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
    <div>
      {/* Header */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
          Jewelry Unit Converter
        </h1>
        <p style={{ margin: '0', fontSize: '0.8125rem', color: '#64748b' }}>
          Convert between grams, ounces, and Vietnamese jewelry units (lượng, chỉ)
        </p>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Converter */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
              Unit Converter
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* From Section */}
              <div>
                <label className="admin-label">
                  From
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={fromValue}
                    onChange={(e) =>
                      setFromValue(parseFloat(e.target.value) || 0)
                    }
                    className="admin-input"
                    placeholder="Enter value"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="admin-select"
                  >
                    <option value={WeightUnit.GRAMS}>Grams (g)</option>
                    <option value={WeightUnit.OUNCES}>Ounces (oz)</option>
                    <option value={WeightUnit.LUONG}>Lượng</option>
                    <option value={WeightUnit.CHI}>Chỉ</option>
                  </select>
                </div>
                <p style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {getUnitInfo(fromUnit)}
                </p>
              </div>

              {/* Swap Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={handleSwapUnits}
                  className="admin-button admin-button-outline"
                  style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Swap units"
                >
                  ⇅
                </button>
              </div>

              {/* To Section */}
              <div>
                <label className="admin-label">
                  To
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.625rem 0.75rem', backgroundColor: '#f8fafb', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <span style={{ color: '#0f172a', fontWeight: '500', fontSize: '0.875rem' }}>
                      {loading ? (
                        <span>⟳ Converting...</span>
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
                    className="admin-select"
                  >
                    <option value={WeightUnit.GRAMS}>Grams (g)</option>
                    <option value={WeightUnit.OUNCES}>Ounces (oz)</option>
                    <option value={WeightUnit.LUONG}>Lượng</option>
                    <option value={WeightUnit.CHI}>Chỉ</option>
                  </select>
                </div>
                <p style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {getUnitInfo(toUnit)}
                </p>
              </div>

              {/* Result Display */}
              {result && (
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#1e40af', margin: '0 0 0.5rem 0' }}>
                        Conversion Result
                      </h3>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a8a', margin: '0 0 0.25rem 0' }}>
                        {result.originalValue} {result.originalUnit} ={" "}
                        {result.convertedValue.toLocaleString("en-US", {
                          maximumFractionDigits: 6
                        })}{" "}
                        {result.convertedUnit}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: '#2563eb', margin: 0 }}>
                        Conversion rate: {result.conversionRate} • Precision:{" "}
                        {result.precision} decimal places
                      </p>
                    </div>
                    <button
                      onClick={copyResult}
                      className="admin-button admin-button-outline"
                      style={{ padding: '0.5rem' }}
                      title="Copy result"
                    >
                      {copied ? "✓" : "📋"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="admin-error-state">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Quick Conversions & Reference */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Conversions */}
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                Quick Conversions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {quickConversions.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickConversion(preset)}
                    className="admin-button admin-button-outline"
                    style={{ justifyContent: 'flex-start', fontSize: '0.8125rem' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Table */}
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                Reference Guide
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Vietnamese Jewelry Units
                  </h3>
                  <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: '6px', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>1 lượng =</span>
                        <span style={{ fontWeight: '500' }}>37.5 grams</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>1 chỉ =</span>
                        <span style={{ fontWeight: '500' }}>3.75 grams</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>1 lượng =</span>
                        <span style={{ fontWeight: '500' }}>10 chỉ</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a', marginBottom: '0.5rem' }}>
                    International Units
                  </h3>
                  <div style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '6px', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>1 troy ounce =</span>
                        <span style={{ fontWeight: '500' }}>28.3495 grams</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>1 troy ounce =</span>
                        <span style={{ fontWeight: '500' }}>0.7560 lượng</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>1 gram =</span>
                        <span style={{ fontWeight: '500' }}>0.0267 lượng</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Common Jewelry Weights
                  </h3>
                  <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Wedding ring:</span>
                        <span style={{ fontWeight: '500' }}>2-6 grams (0.5-1.6 chỉ)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Chain necklace:</span>
                        <span style={{ fontWeight: '500' }}>5-20 grams (1.3-5.3 chỉ)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pendant:</span>
                        <span style={{ fontWeight: '500' }}>1-10 grams (0.3-2.7 chỉ)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Earrings (pair):</span>
                        <span style={{ fontWeight: '500' }}>2-8 grams (0.5-2.1 chỉ)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversion Rates Table */}
            {conversionRates && (
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                  Conversion Matrix
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafb' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>From → To</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Grams</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Ounces</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Lượng</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Chỉ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(conversionRates).map(
                        ([fromUnitKey, rates]) => (
                          <tr key={fromUnitKey} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.5rem', fontWeight: '500' }}>
                              {getUnitDisplay(fromUnitKey)}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              {rates.GRAMS?.toFixed(4) || "1.0000"}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              {rates.OUNCES?.toFixed(4) || "—"}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              {rates.LUONG?.toFixed(4) || "—"}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
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
  );
};

export default UnitConversionCalculator;
