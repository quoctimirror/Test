import React, { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, CheckCircle, Globe, Search, RefreshCw, Download } from 'lucide-react';

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

  const getUpdateIcon = (changeType) => {
    switch (changeType.toLowerCase()) {
      case 'duty_rate_change': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'documentation_requirement': return <FileText className="h-4 w-4 text-green-600" />;
      case 'trade_agreement': return <Globe className="h-4 w-4 text-purple-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getUpdatePriority = (complianceRequired, impact) => {
    if (complianceRequired) return 'HIGH';
    if (impact.toLowerCase().includes('significant')) return 'MEDIUM';
    return 'LOW';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="customs-compliance-manager">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Action Bar */}
        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={fetchComplianceData}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={20} />
            Refresh Data
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Download size={20} />
            Export Report
          </button>
        </div>
        {/* Duty Rate Research */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Search className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Duty Rate Research</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origin Country</label>
              <select
                value={researchParams.originCountry}
                onChange={(e) => setResearchParams({ ...researchParams, originCountry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <select
                value={researchParams.destinationCountry}
                onChange={(e) => setResearchParams({ ...researchParams, destinationCountry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VIETNAM">🇻🇳 Vietnam</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
              <select
                value={researchParams.productCategory}
                onChange={(e) => setResearchParams({ ...researchParams, productCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {productCategories.map(category => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={researchDutyRates}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search size={16} />
                )}
                Research Rates
              </button>
            </div>
          </div>

          {/* Duty Rate Results */}
          {customsRates.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              {customsRates.map((rate, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {countries.find(c => c.code === rate.originCountry)?.flag} {rate.originCountry} → 🇻🇳 {rate.destinationCountry}
                    </h3>
                    <span className="text-sm text-gray-500">Effective: {new Date(rate.effectiveDate).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">HS Code</div>
                      <div className="text-lg font-bold text-blue-900">{rate.hsCode}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-sm text-red-600 font-medium">Standard Duty Rate</div>
                      <div className="text-lg font-bold text-red-900">{formatPercentage(rate.standardDutyRate)}</div>
                    </div>
                    {rate.preferentialRate && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Preferential Rate</div>
                        <div className="text-lg font-bold text-green-900">{formatPercentage(rate.preferentialRate)}</div>
                      </div>
                    )}
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-purple-600 font-medium">VAT Rate</div>
                      <div className="text-lg font-bold text-purple-900">{formatPercentage(rate.vatRate)}</div>
                    </div>
                  </div>

                  {rate.tradeAgreement && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Trade Agreement Applied: {rate.tradeAgreement}</span>
                      </div>
                    </div>
                  )}

                  {rate.additionalFees && rate.additionalFees.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Fees</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {rate.additionalFees.map((fee, feeIdx) => (
                          <div key={feeIdx} className="bg-gray-50 p-2 rounded">
                            <div className="font-medium text-sm">{fee.feeType.replace(/_/g, ' ')}</div>
                            <div className="text-xs text-gray-600">{fee.description}</div>
                            <div className="text-sm font-bold">{formatPercentage(fee.rate)}</div>
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Compliance Validation</h2>
            </div>
            <button
              onClick={validateCompliance}
              disabled={checkingCompliance}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {checkingCompliance ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckCircle size={16} />
              )}
              Validate Compliance
            </button>
          </div>

          {complianceCheck && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${complianceCheck.isCompliant ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {complianceCheck.isCompliant ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${complianceCheck.isCompliant ? 'text-green-800' : 'text-red-800'}`}>
                    Compliance Status
                  </span>
                </div>
                <div className={`text-lg font-bold ${complianceCheck.isCompliant ? 'text-green-900' : 'text-red-900'}`}>
                  {complianceCheck.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-2">Documentation Required</div>
                <div className="text-lg font-bold text-blue-900">
                  {complianceCheck.requiredDocuments?.length || 0} documents
                </div>
                {complianceCheck.requiredDocuments && complianceCheck.requiredDocuments.length > 0 && (
                  <ul className="mt-2 text-xs text-blue-700 space-y-1">
                    {complianceCheck.requiredDocuments.slice(0, 3).map((doc, idx) => (
                      <li key={idx}>• {doc}</li>
                    ))}
                    {complianceCheck.requiredDocuments.length > 3 && (
                      <li>+ {complianceCheck.requiredDocuments.length - 3} more...</li>
                    )}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">Risk Level</div>
                <div className="text-lg font-bold text-yellow-900">
                  {complianceCheck.riskLevel || 'MEDIUM'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regulatory Updates */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Regulatory Updates</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search updates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredUpdates.map((update, idx) => {
              const priority = getUpdatePriority(update.complianceRequired, update.impact);
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getUpdateIcon(update.changeType)}
                      <div>
                        <h3 className="font-medium text-gray-900">{update.changeType.replace(/_/g, ' ')}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(priority)}`}>
                            {priority} PRIORITY
                          </span>
                          {update.complianceRequired && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              ACTION REQUIRED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Effective: {new Date(update.effectiveDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Description:</span>
                      <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Impact:</span>
                      <p className="text-sm text-gray-600 mt-1">{update.impact}</p>
                    </div>
                  </div>

                  {update.complianceRequired && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Immediate compliance action required by {new Date(update.effectiveDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredUpdates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p>No regulatory updates found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomsComplianceManager;
