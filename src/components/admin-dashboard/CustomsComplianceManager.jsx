import React, { useState, useEffect } from 'react';

const CustomsComplianceManager = () => {
  const [customsRates, setCustomsRates] = useState([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [complianceCheck, setComplianceCheck] = useState(null);
  const [checkingCompliance, setCheckingCompliance] = useState(false);

  const [researchParams, setResearchParams] = useState({
    originCountry: 'INDIA',
    destinationCountry: 'VIETNAM',
    productCategory: 'SYNTHETIC_DIAMOND_JEWELRY'
  });

  const countries = [
    { code: 'INDIA', name: 'India', flag: '🇮🇳' },
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'THAILAND', name: 'Thailand', flag: '🇹🇭' },
    { code: 'HONG_KONG', name: 'Hong Kong', flag: '🇭🇰' },
    { code: 'CHINA', name: 'China', flag: '🇨🇳' }
  ];

  const productCategories = [
    'SYNTHETIC_DIAMOND_JEWELRY',
    'PRECIOUS_METAL_JEWELRY',
    'FASHION_JEWELRY',
    'WATCHES_TIMEPIECES',
    'GEMSTONE_JEWELRY'
  ];

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API calls when backend is ready
      // const regulatoryResponse = await vietnamMarketAPI.getRegulatoryUpdates();
      // setRegulatoryUpdates(regulatoryResponse.data);

      // Mock data for now
      const mockUpdates = [
        {
          changeType: 'DUTY_RATE_CHANGE',
          description: 'Updated import duty rates for synthetic diamond jewelry from India',
          impact: 'Significant cost impact - rates increased from 10% to 15%',
          effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          complianceRequired: true
        },
        {
          changeType: 'DOCUMENTATION_REQUIREMENT',
          description: 'New certificate of origin requirements for ASEAN countries',
          impact: 'Additional documentation needed for customs clearance',
          effectiveDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          complianceRequired: true
        },
        {
          changeType: 'TRADE_AGREEMENT',
          description: 'Vietnam-India FTA preferential rates extended for jewelry imports',
          impact: 'Reduced duty rates available with proper documentation',
          effectiveDate: new Date().toISOString(),
          complianceRequired: false
        }
      ];
      setRegulatoryUpdates(mockUpdates);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const researchDutyRates = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // const response = await customsAPI.researchDutyRates(
      //   researchParams.originCountry,
      //   researchParams.destinationCountry,
      //   researchParams.productCategory
      // );
      // setCustomsRates([response.data]);

      // Mock data for now
      const mockRate = {
        originCountry: researchParams.originCountry,
        destinationCountry: researchParams.destinationCountry,
        productCategory: researchParams.productCategory,
        hsCode: '7113.11.00',
        standardDutyRate: 0.15,
        preferentialRate: 0.10,
        vatRate: 0.10,
        effectiveDate: new Date().toISOString(),
        tradeAgreement: 'ASEAN-India FTA',
        additionalFees: [
          {
            feeType: 'CUSTOMS_PROCESSING',
            description: 'Standard customs processing fee',
            rate: 0.02
          },
          {
            feeType: 'INSPECTION_FEE',
            description: 'Quality inspection for jewelry imports',
            rate: 0.01
          }
        ]
      };
      setCustomsRates([mockRate]);
    } catch (error) {
      console.error('Error researching duty rates:', error);
      alert('Failed to research duty rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateCompliance = async () => {
    setCheckingCompliance(true);
    try {
      // TODO: Implement actual API call
      // const response = await customsAPI.validateCompliance(mockRequest);
      // setComplianceCheck(response.data);

      // Mock compliance check result
      const mockCheck = {
        isCompliant: Math.random() > 0.3,
        requiredDocuments: [
          'Certificate of Origin',
          'Commercial Invoice',
          'Packing List',
          'Import License',
          'Quality Certificate'
        ],
        riskLevel: 'MEDIUM',
        issues: []
      };
      setComplianceCheck(mockCheck);
    } catch (error) {
      console.error('Error validating compliance:', error);
      alert('Failed to validate compliance. Please try again.');
    } finally {
      setCheckingCompliance(false);
    }
  };

  const filteredUpdates = regulatoryUpdates.filter(update => {
    const matchesSearch = update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         update.changeType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getUpdateIndicator = (changeType) => {
    switch (changeType.toLowerCase()) {
      case 'duty_rate_change': return { symbol: '🛡️', color: '#3b82f6' };
      case 'documentation_requirement': return { symbol: '📄', color: '#10b981' };
      case 'trade_agreement': return { symbol: '🌐', color: '#a855f7' };
      default: return { symbol: '⚠️', color: '#f97316' };
    }
  };

  const getUpdatePriority = (complianceRequired, impact) => {
    if (complianceRequired) return 'HIGH';
    if (impact.toLowerCase().includes('significant')) return 'MEDIUM';
    return 'LOW';
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'HIGH': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'MEDIUM': return { backgroundColor: '#fef3c7', color: '#854d0e' };
      case 'LOW': return { backgroundColor: '#dcfce7', color: '#166534' };
      default: return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div>
      {/* Header and Action Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
          Customs & Compliance
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchComplianceData}
            className="admin-button admin-button-outline"
          >
            ⟳ Refresh Data
          </button>
          <button className="admin-button admin-button-primary">
            ↓ Export Report
          </button>
        </div>
      </div>
      {/* Duty Rate Research */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
          Duty Rate Research
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="admin-label">Origin Country</label>
            <select
              value={researchParams.originCountry}
              onChange={(e) => setResearchParams({ ...researchParams, originCountry: e.target.value })}
              className="admin-select"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="admin-label">Destination</label>
            <select
              value={researchParams.destinationCountry}
              onChange={(e) => setResearchParams({ ...researchParams, destinationCountry: e.target.value })}
              className="admin-select"
            >
              <option value="VIETNAM">🇻🇳 Vietnam</option>
            </select>
          </div>

          <div>
            <label className="admin-label">Product Category</label>
            <select
              value={researchParams.productCategory}
              onChange={(e) => setResearchParams({ ...researchParams, productCategory: e.target.value })}
              className="admin-select"
            >
              {productCategories.map(category => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={researchDutyRates}
              disabled={loading}
              className="admin-button admin-button-primary"
              style={{ width: '100%', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'Loading...' : '🔍 Research Rates'}
            </button>
          </div>
        </div>

        {/* Duty Rate Results */}
        {customsRates.length > 0 && (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', backgroundColor: '#fafbfc' }}>
            {customsRates.map((rate, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
                    {countries.find(c => c.code === rate.originCountry)?.flag} {rate.originCountry} → 🇻🇳 {rate.destinationCountry}
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Effective: {new Date(rate.effectiveDate).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>HS Code</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{rate.hsCode}</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>Standard Duty Rate</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{formatPercentage(rate.standardDutyRate)}</div>
                  </div>
                  {rate.preferentialRate && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>Preferential Rate</div>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: '#10b981' }}>{formatPercentage(rate.preferentialRate)}</div>
                    </div>
                  )}
                  <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>VAT Rate</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{formatPercentage(rate.vatRate)}</div>
                  </div>
                </div>

                {rate.tradeAgreement && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#854d0e' }}>🌐 Trade Agreement Applied: {rate.tradeAgreement}</span>
                  </div>
                )}

                {rate.additionalFees && rate.additionalFees.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>Additional Fees</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                      {rate.additionalFees.map((fee, feeIdx) => (
                        <div key={feeIdx} style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                          <div style={{ fontWeight: '600', fontSize: '0.8125rem', color: '#0f172a', marginBottom: '0.25rem' }}>{fee.feeType.replace(/_/g, ' ')}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{fee.description}</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' }}>{formatPercentage(fee.rate)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance Validation */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
            Compliance Validation
          </h2>
          <button
            onClick={validateCompliance}
            disabled={checkingCompliance}
            className="admin-button admin-button-primary"
            style={{ opacity: checkingCompliance ? 0.5 : 1 }}
          >
            {checkingCompliance ? 'Validating...' : '✓ Validate Compliance'}
          </button>
        </div>

        {complianceCheck && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              borderRadius: '6px',
              backgroundColor: complianceCheck.isCompliant ? '#dcfce7' : '#fee2e2',
              border: `1px solid ${complianceCheck.isCompliant ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: '500',
                fontSize: '0.8125rem',
                color: complianceCheck.isCompliant ? '#166534' : '#991b1b'
              }}>
                {complianceCheck.isCompliant ? '✓' : '⚠️'} Compliance Status
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: complianceCheck.isCompliant ? '#166534' : '#991b1b'
              }}>
                {complianceCheck.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8125rem', color: '#1e40af', fontWeight: '500', marginBottom: '0.5rem' }}>Documentation Required</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af' }}>
                {complianceCheck.requiredDocuments?.length || 0} documents
              </div>
              {complianceCheck.requiredDocuments && complianceCheck.requiredDocuments.length > 0 && (
                <ul style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#1e40af', paddingLeft: '1rem' }}>
                  {complianceCheck.requiredDocuments.slice(0, 3).map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                  {complianceCheck.requiredDocuments.length > 3 && (
                    <li>+ {complianceCheck.requiredDocuments.length - 3} more...</li>
                  )}
                </ul>
              )}
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8125rem', color: '#854d0e', fontWeight: '500', marginBottom: '0.5rem' }}>Risk Level</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#854d0e' }}>
                {complianceCheck.riskLevel || 'MEDIUM'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Regulatory Updates */}
      <div className="admin-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
            Regulatory Updates
          </h2>
          <div>
            <input
              type="text"
              placeholder="Search updates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ minWidth: '250px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredUpdates.map((update, idx) => {
            const priority = getUpdatePriority(update.complianceRequired, update.impact);
            const indicator = getUpdateIndicator(update.changeType);
            return (
              <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.125rem' }}>{indicator.symbol}</span>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '0.875rem', color: '#0f172a' }}>
                        {update.changeType.replace(/_/g, ' ')}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.6875rem',
                          fontWeight: '600',
                          borderRadius: '12px',
                          ...getPriorityStyle(priority)
                        }}>
                          {priority} PRIORITY
                        </span>
                        {update.complianceRequired && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.6875rem',
                            fontWeight: '600',
                            borderRadius: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b'
                          }}>
                            ACTION REQUIRED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    Effective: {new Date(update.effectiveDate).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>Description:</span>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>{update.description}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>Impact:</span>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>{update.impact}</p>
                  </div>
                </div>

                {update.complianceRequired && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#991b1b' }}>
                      ⚠️ Immediate compliance action required by {new Date(update.effectiveDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredUpdates.length === 0 && (
          <div className="admin-empty-state">
            <p style={{ margin: 0 }}>No regulatory updates found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomsComplianceManager;
