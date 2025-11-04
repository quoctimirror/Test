import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, MapPin, DollarSign, Clock, Star } from 'lucide-react';

const VendorSelectionWizard = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [requirements, setRequirements] = useState({
    productType: '',
    quantity: 0,
    budget: 0,
    deadline: '',
    qualityLevel: 'STANDARD'
  });
  const [selectedVendors, setSelectedVendors] = useState({});
  const [vendorQuantities, setVendorQuantities] = useState({});

  const steps = [
    { number: 1, name: 'Requirements', description: 'Define your needs' },
    { number: 2, name: 'Vendor Selection', description: 'Choose & split quantities' },
    { number: 3, name: 'Review', description: 'Confirm & create orders' }
  ];

  const mockVendors = [
    {
      id: '1',
      name: 'Gold Jewelry Manufacturer Ltd',
      country: 'India',
      rating: 4.8,
      avgCost: 50,
      leadTime: 30,
      qualityScore: 92
    },
    {
      id: '2',
      name: 'Diamond Ring Supplier Co',
      country: 'Thailand',
      rating: 4.6,
      avgCost: 65,
      leadTime: 25,
      qualityScore: 95
    },
    {
      id: '3',
      name: 'Silver Bracelet Factory',
      country: 'China',
      rating: 4.2,
      avgCost: 35,
      leadTime: 20,
      qualityScore: 85
    }
  ];

  const handleNext = () => {
    if (currentStep === 2) {
      // Validate vendor selection before moving to review
      if (selectedVendorsList.length === 0) {
        alert('Please select at least one vendor to continue.');
        return;
      }

      // Auto-split quantities evenly if not manually set
      if (Object.keys(vendorQuantities).length === 0) {
        autoSplitQuantities();
      }

      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Validate total quantities match
      const totalAllocated = Object.values(vendorQuantities).reduce((sum, qty) => sum + qty, 0);
      if (totalAllocated !== requirements.quantity) {
        alert(`Quantity mismatch! You need ${requirements.quantity} items but allocated ${totalAllocated} items.\nPlease adjust the quantities.`);
        return;
      }

      // Create purchase orders with split quantities
      const newOrders = selectedVendorsList.map((vendor, index) => ({
        id: `PO-${Date.now()}-${index}`,
        vendorName: vendor.name,
        totalAmount: vendorQuantities[vendor.id] * vendor.avgCost * 23000, // Convert USD to VND
        currency: 'VND',
        status: 'DRAFT',
        orderDate: new Date().toISOString(),
        expectedDelivery: requirements.deadline,
        itemCount: vendorQuantities[vendor.id],
        productType: requirements.productType,
        qualityLevel: requirements.qualityLevel
      }));

      // Save to localStorage for now (until backend is ready)
      const existingOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
      localStorage.setItem('purchaseOrders', JSON.stringify([...newOrders, ...existingOrders]));

      // Show success message
      alert(`Success! Created ${newOrders.length} purchase order(s):\n${selectedVendorsList.map(v => `• ${v.name}: ${vendorQuantities[v.id]} items`).join('\n')}\n\nTotal: ${totalAllocated} items\n\nRedirecting to Purchase Orders...`);

      if (onComplete) {
        onComplete({ requirements, selectedVendors, orders: newOrders });
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const autoSplitQuantities = () => {
    const vendorCount = selectedVendorsList.length;
    const baseQuantity = Math.floor(requirements.quantity / vendorCount);
    const remainder = requirements.quantity % vendorCount;

    const quantities = {};
    selectedVendorsList.forEach((vendor, index) => {
      quantities[vendor.id] = baseQuantity + (index < remainder ? 1 : 0);
    });

    setVendorQuantities(quantities);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      if (onBack) onBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleVendor = (vendorId) => {
    setSelectedVendors(prev => {
      const newSelected = {
        ...prev,
        [vendorId]: !prev[vendorId]
      };

      // If deselecting, remove quantity allocation
      if (!newSelected[vendorId]) {
        setVendorQuantities(prevQty => {
          const { [vendorId]: removed, ...rest } = prevQty;
          return rest;
        });
      }

      return newSelected;
    });
  };

  const updateVendorQuantity = (vendorId, quantity) => {
    setVendorQuantities(prev => ({
      ...prev,
      [vendorId]: Math.max(0, parseInt(quantity) || 0)
    }));
  };

  const getTotalAllocated = () => {
    return Object.values(vendorQuantities).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  const getRemainingQuantity = () => {
    return requirements.quantity - getTotalAllocated();
  };

  const selectedVendorsList = mockVendors.filter(v => selectedVendors[v.id]);

  return (
    <div className="vendor-selection-wizard">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.number}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{step.name}</div>
                  <div className="text-sm text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-8 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 overflow-visible">
          {/* Step 1: Requirements */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Define Your Requirements</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type
                  </label>
                  <select
                    value={requirements.productType}
                    onChange={(e) => setRequirements({...requirements, productType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="RINGS">Rings</option>
                    <option value="NECKLACES">Necklaces</option>
                    <option value="BRACELETS">Bracelets</option>
                    <option value="EARRINGS">Earrings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={requirements.quantity}
                    onChange={(e) => setRequirements({...requirements, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (VND)
                  </label>
                  <input
                    type="number"
                    value={requirements.budget}
                    onChange={(e) => setRequirements({...requirements, budget: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter budget"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={requirements.deadline}
                    onChange={(e) => setRequirements({...requirements, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Level
                  </label>
                  <select
                    value={requirements.qualityLevel}
                    onChange={(e) => setRequirements({...requirements, qualityLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="LUXURY">Luxury</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vendor Selection */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Vendors & Allocate Quantities</h2>
              <p className="text-sm text-gray-600 mb-6">
                Choose one or more vendors and split your total order quantity among them.
                This allows you to diversify risk or compare quality across multiple suppliers.
              </p>

              <div className="space-y-4">
                {mockVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedVendors[vendor.id]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleVendor(vendor.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                          {selectedVendors[vendor.id] && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{vendor.country}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">{vendor.rating}/5.0</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">${vendor.avgCost}/unit</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{vendor.leadTime} days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity Allocation Section */}
              {selectedVendorsList.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity Allocation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Split the total quantity of <strong>{requirements.quantity} items</strong> among the selected vendors.
                  </p>

                  <div className="space-y-3">
                    {selectedVendorsList.map((vendor) => (
                      <div key={vendor.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">{vendor.name}</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="0"
                            max={requirements.quantity}
                            value={vendorQuantities[vendor.id] || 0}
                            onChange={(e) => updateVendorQuantity(vendor.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-500">items</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Allocated:</span>
                      <span className={`text-lg font-bold ${getTotalAllocated() === requirements.quantity ? 'text-green-600' : getTotalAllocated() > requirements.quantity ? 'text-red-600' : 'text-orange-600'}`}>
                        {getTotalAllocated()} / {requirements.quantity} items
                      </span>
                    </div>
                    {getTotalAllocated() !== requirements.quantity && (
                      <div className="mt-2 text-sm">
                        {getTotalAllocated() < requirements.quantity && (
                          <p className="text-orange-600">⚠️ You still need to allocate {getRemainingQuantity()} more item(s)</p>
                        )}
                        {getTotalAllocated() > requirements.quantity && (
                          <p className="text-red-600">❌ You've allocated {getTotalAllocated() - requirements.quantity} too many item(s)</p>
                        )}
                      </div>
                    )}
                    {getTotalAllocated() === requirements.quantity && (
                      <p className="mt-2 text-sm text-green-600">✓ All items allocated correctly!</p>
                    )}
                  </div>

                  <button
                    onClick={autoSplitQuantities}
                    className="mt-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200 transition-colors"
                  >
                    Auto-split evenly
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Selection</h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Product Type:</span>
                    <span className="text-sm font-medium text-gray-900">{requirements.productType || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium text-gray-900">{requirements.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(requirements.budget)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deadline:</span>
                    <span className="text-sm font-medium text-gray-900">{requirements.deadline || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quality Level:</span>
                    <span className="text-sm font-medium text-gray-900">{requirements.qualityLevel}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Selected Vendors & Quantity Split ({selectedVendorsList.length})
                </h3>
                {selectedVendorsList.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-4">
                      {selectedVendorsList.map((vendor) => (
                        <div key={vendor.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{vendor.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {vendor.country} • Rating: {vendor.rating}/5.0 • Lead time: {vendor.leadTime} days
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {vendorQuantities[vendor.id] || 0}
                              </div>
                              <div className="text-xs text-gray-500">items</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-blue-900">Total Orders:</span>
                        <span className="text-xl font-bold text-blue-900">
                          {getTotalAllocated()} / {requirements.quantity} items
                        </span>
                      </div>
                      {getTotalAllocated() === requirements.quantity ? (
                        <p className="text-sm text-green-600 mt-2">✓ All items properly allocated</p>
                      ) : (
                        <p className="text-sm text-red-600 mt-2">❌ Quantity mismatch detected!</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">No vendors selected</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation - Outside the card */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px' }}>
            <button
              type="button"
              onClick={handleBack}
              style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '500', color: '#374151', backgroundColor: '#F3F4F6', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '500', color: 'white', backgroundColor: '#2563EB', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{currentStep === 3 ? 'Complete Selection' : 'Next'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSelectionWizard;
