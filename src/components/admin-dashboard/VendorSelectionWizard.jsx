import React, { useState } from 'react';

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
    <div>
      {/* Progress Steps */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {steps.map((step, index) => (
            <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: currentStep >= step.number ? '#0f172a' : '#e2e8f0',
                color: currentStep >= step.number ? 'white' : '#64748b',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                {step.number}
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{step.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  width: '96px',
                  height: '2px',
                  marginLeft: '2rem',
                  marginRight: '2rem',
                  backgroundColor: currentStep > step.number ? '#0f172a' : '#e2e8f0'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="admin-card" style={{ padding: '1.5rem' }}>
        {/* Step 1: Requirements */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Define Your Requirements</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Product Type
                </label>
                <select
                  value={requirements.productType}
                  onChange={(e) => setRequirements({...requirements, productType: e.target.value})}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Select type</option>
                  <option value="RINGS">Rings</option>
                  <option value="NECKLACES">Necklaces</option>
                  <option value="BRACELETS">Bracelets</option>
                  <option value="EARRINGS">Earrings</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={requirements.quantity}
                  onChange={(e) => setRequirements({...requirements, quantity: parseInt(e.target.value) || 0})}
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Budget (VND)
                </label>
                <input
                  type="number"
                  value={requirements.budget}
                  onChange={(e) => setRequirements({...requirements, budget: parseInt(e.target.value) || 0})}
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="Enter budget"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Deadline
                </label>
                <input
                  type="date"
                  value={requirements.deadline}
                  onChange={(e) => setRequirements({...requirements, deadline: e.target.value})}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>
                  Quality Level
                </label>
                <select
                  value={requirements.qualityLevel}
                  onChange={(e) => setRequirements({...requirements, qualityLevel: e.target.value})}
                  className="admin-select"
                  style={{ width: '100%' }}
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
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Select Vendors & Allocate Quantities</h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Choose one or more vendors and split your total order quantity among them.
              This allows you to diversify risk or compare quality across multiple suppliers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  style={{
                    border: `1px solid ${selectedVendors[vendor.id] ? '#0f172a' : '#e2e8f0'}`,
                    backgroundColor: selectedVendors[vendor.id] ? '#fafbfc' : 'white',
                    borderRadius: '6px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => toggleVendor(vendor.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>{vendor.name}</h3>
                        {selectedVendors[vendor.id] && (
                          <span style={{ fontSize: '0.75rem', color: '#0f172a' }}>✓</span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Country</div>
                          <div style={{ fontSize: '0.8125rem', color: '#0f172a' }}>{vendor.country}</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Rating</div>
                          <div style={{ fontSize: '0.8125rem', color: '#0f172a' }}>{vendor.rating}/5.0</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Cost</div>
                          <div style={{ fontSize: '0.8125rem', color: '#0f172a' }}>${vendor.avgCost}/unit</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Lead Time</div>
                          <div style={{ fontSize: '0.8125rem', color: '#0f172a' }}>{vendor.leadTime} days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Allocation Section */}
            {selectedVendorsList.length > 0 && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.75rem' }}>Quantity Allocation</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
                  Split the total quantity of <strong>{requirements.quantity} items</strong> among the selected vendors.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedVendorsList.map((vendor) => (
                    <div key={vendor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{vendor.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="number"
                          min="0"
                          max={requirements.quantity}
                          value={vendorQuantities[vendor.id] || 0}
                          onChange={(e) => updateVendorQuantity(vendor.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="admin-input"
                          style={{ width: '80px', padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                        />
                        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>items</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>Total Allocated:</span>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: getTotalAllocated() === requirements.quantity ? '#059669' : getTotalAllocated() > requirements.quantity ? '#dc2626' : '#d97706'
                    }}>
                      {getTotalAllocated()} / {requirements.quantity} items
                    </span>
                  </div>
                  {getTotalAllocated() !== requirements.quantity && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {getTotalAllocated() < requirements.quantity && (
                        <p style={{ fontSize: '0.8125rem', color: '#d97706', margin: 0 }}>You still need to allocate {getRemainingQuantity()} more item(s)</p>
                      )}
                      {getTotalAllocated() > requirements.quantity && (
                        <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: 0 }}>You've allocated {getTotalAllocated() - requirements.quantity} too many item(s)</p>
                      )}
                    </div>
                  )}
                  {getTotalAllocated() === requirements.quantity && (
                    <p style={{ fontSize: '0.8125rem', color: '#059669', marginTop: '0.5rem' }}>All items allocated correctly</p>
                  )}
                </div>

                <button
                  onClick={autoSplitQuantities}
                  className="admin-button admin-button-secondary"
                  style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}
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
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Review Your Selection</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.75rem' }}>Requirements</h3>
              <div style={{ backgroundColor: '#fafbfc', borderRadius: '6px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Product Type:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{requirements.productType || 'Not specified'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Quantity:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{requirements.quantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Budget:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(requirements.budget)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Deadline:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{requirements.deadline || 'Not specified'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Quality Level:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{requirements.qualityLevel}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.75rem' }}>
                Selected Vendors & Quantity Split ({selectedVendorsList.length})
              </h3>
              {selectedVendorsList.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {selectedVendorsList.map((vendor) => (
                      <div key={vendor.id} style={{ backgroundColor: '#fafbfc', borderRadius: '6px', padding: '1rem', borderLeft: '3px solid #0f172a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', fontSize: '0.8125rem', color: '#0f172a' }}>{vendor.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {vendor.country} • Rating: {vendor.rating}/5.0 • Lead time: {vendor.leadTime} days
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f172a' }}>
                              {vendorQuantities[vendor.id] || 0}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>items</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ backgroundColor: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>Total Orders:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
                        {getTotalAllocated()} / {requirements.quantity} items
                      </span>
                    </div>
                    {getTotalAllocated() === requirements.quantity ? (
                      <p style={{ fontSize: '0.8125rem', color: '#059669', marginTop: '0.5rem', margin: 0 }}>All items properly allocated</p>
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: '#dc2626', marginTop: '0.5rem', margin: 0 }}>Quantity mismatch detected</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="admin-empty-state">
                  No vendors selected
                </div>
              )}
            </div>
          </div>
        )}
        </div>

      {/* Navigation - Outside the card */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={handleBack}
            className="admin-button admin-button-secondary"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="admin-button admin-button-primary"
          >
            {currentStep === 3 ? 'Complete Selection' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorSelectionWizard;
