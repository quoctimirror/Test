import React, { useState, useEffect, useCallback } from 'react';

const CollectionPlanWizard = ({ collectionPlanId, onBack, onNext }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [collectionPlan, setCollectionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [jewelrySpecs, setJewelrySpecs] = useState([]);
  const [specsLoading, setSpecsLoading] = useState(true);

  const fetchCollectionPlan = useCallback(async () => {
    try {
      if (collectionPlanId) {
        // TODO: Implement actual API calls when backend is ready
        // const [collectionResponse, specsResponse] = await Promise.all([
        //   collectionPlanAPI.getById(collectionPlanId),
        //   jewelrySpecAPI.getAll()
        // ]);

        // Mock data for now
        const mockCollectionPlan = {
          id: collectionPlanId,
          name: 'Collection Plan ' + collectionPlanId,
          totalQuantity: 1000,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          ageGroupAllocations: [
            { id: '1', ageGroupName: '15-25', allocationPercentage: 35, targetQuantity: 350 },
            { id: '2', ageGroupName: '26-35', allocationPercentage: 40, targetQuantity: 400 },
            { id: '3', ageGroupName: '36+', allocationPercentage: 25, targetQuantity: 250 },
          ],
          items: []
        };

        const mockSpecs = [
          { id: '1', name: 'Diamond Ring Classic', type: 'Ring', material: 'Gold', purity: '18K' },
          { id: '2', name: 'Pearl Necklace', type: 'Necklace', material: 'Pearl', purity: 'AAA' },
          { id: '3', name: 'Silver Bracelet', type: 'Bracelet', material: 'Silver', purity: '925' },
        ];

        setCollectionPlan(mockCollectionPlan);
        setJewelrySpecs(mockSpecs);
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching collection plan:', error);
    } finally {
      setLoading(false);
      setSpecsLoading(false);
    }
  }, [collectionPlanId]);

  const fetchJewelrySpecs = useCallback(async () => {
    try {
      setSpecsLoading(true);
      // TODO: Implement actual API call
      // const response = await jewelrySpecAPI.getAll();
      // setJewelrySpecs(response.data || []);

      const mockSpecs = [
        { id: '1', name: 'Diamond Ring Classic', type: 'Ring', material: 'Gold', purity: '18K' },
        { id: '2', name: 'Pearl Necklace', type: 'Necklace', material: 'Pearl', purity: 'AAA' },
        { id: '3', name: 'Silver Bracelet', type: 'Bracelet', material: 'Silver', purity: '925' },
      ];
      setJewelrySpecs(mockSpecs);
    } catch (error) {
      console.error('Error fetching jewelry specs:', error);
      setJewelrySpecs([]);
    } finally {
      setSpecsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (collectionPlanId) {
      fetchCollectionPlan();
    } else {
      fetchJewelrySpecs();
      setLoading(false);
    }
  }, [collectionPlanId, fetchCollectionPlan, fetchJewelrySpecs]);

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      productName: '',
      productType: '',
      baseDesign: '',
      targetQuantity: 0,
      jewelrySpecId: null,
      isNew: true,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems(prevItems => {
      const updatedItems = prevItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return updatedItems;
    });
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Save items and generate variants
      try {
        const validItems = items.filter(item =>
          item.jewelrySpecId && item.targetQuantity > 0
        );

        if (validItems.length === 0) {
          alert('Please select at least one product with a target quantity greater than 0');
          return;
        }

        // TODO: Save items and generate variants via API
        // await collectionPlanAPI.updateItems(collectionPlanId, validItems);
        // await productVariantAPI.generateVariants(collectionPlanId);

        setCurrentStep(2);
      } catch (error) {
        console.error('Error saving items or generating variants:', error);
        alert('Failed to save items and generate variants');
      }
    } else {
      // Move to vendor matching
      if (onNext) {
        onNext({ collectionPlanId, items });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        Loading collection plan...
      </div>
    );
  }

  if (!collectionPlan) {
    return (
      <div className="admin-empty-state">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
            Collection Plan Not Found
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Please select a valid collection plan
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="admin-button admin-button-primary"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, name: 'Products', description: 'Select target products' },
    { number: 2, name: 'Variants', description: 'Review age group variants' },
  ];

  return (
    <div>
      {/* Collection Info Header */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
              {collectionPlan.name}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
              {collectionPlan.totalQuantity.toLocaleString()} pieces •
              Deadline: {new Date(collectionPlan.deadline).toLocaleDateString()}
            </p>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#64748b',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            Step {currentStep} of {steps.length}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1', maxWidth: '250px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= step.number ? '#0f172a' : '#e2e8f0',
                  color: currentStep >= step.number ? '#ffffff' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  border: currentStep === step.number ? '2px solid #64748b' : 'none'
                }}>
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: currentStep >= step.number ? '#0f172a' : '#64748b', marginBottom: '0.125rem' }}>
                    {step.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  backgroundColor: currentStep > step.number ? '#0f172a' : '#e2e8f0',
                  marginBottom: '2.5rem'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {currentStep === 1 && (
            <ProductSelectionStep
              items={items}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
              collectionPlan={collectionPlan}
              jewelrySpecs={jewelrySpecs}
              specsLoading={specsLoading}
            />
          )}

          {currentStep === 2 && (
            <VariantReviewStep
              collectionPlan={collectionPlan}
              items={items}
            />
          )}

          {/* Navigation */}
          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleBack}
              className="admin-button admin-button-outline"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: '500' }}
            >
              ← {currentStep === 1 ? 'Back to Dashboard' : 'Previous'}
            </button>
            <button
              onClick={handleNext}
              className="admin-button admin-button-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {currentStep === 1 ? 'Generate Variants' : 'Find Vendors'} →
            </button>
          </div>
        </div>
      </div>
  );
};

const ProductSelectionStep = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  collectionPlan,
  jewelrySpecs,
  specsLoading,
}) => {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
          Select Target Products
        </h2>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Add the products you want to include in this collection drop. We'll generate age-specific variants for each product.
        </p>
      </div>

      {/* Age Group Allocation Summary */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>Age Group Allocation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {collectionPlan.ageGroupAllocations.map((allocation) => (
            <div
              key={allocation.id}
              style={{
                padding: '1rem',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#fafbfc'
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.375rem', lineHeight: 1 }}>
                {allocation.allocationPercentage}%
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.375rem' }}>
                {allocation.ageGroupName}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {allocation.targetQuantity.toLocaleString()} pieces
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item, index) => {
          const selectedSpec = jewelrySpecs.find(spec => String(spec.id) === String(item.jewelrySpecId));
          return (
            <div
              key={item.id}
              className="admin-card"
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.75rem'
                  }}>
                    {index + 1}
                  </div>
                  <h4 style={{ margin: 0, fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                    Product {index + 1}
                  </h4>
                </div>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="admin-button admin-button-danger"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                >
                  × Remove
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">
                    Product Name
                  </label>
                  <select
                    value={item.jewelrySpecId || ''}
                    onChange={(e) => {
                      const selectedValue = e.target.value;

                      if (!selectedValue) {
                        onUpdateItem(index, 'jewelrySpecId', '');
                        onUpdateItem(index, 'productName', '');
                        onUpdateItem(index, 'productType', '');
                        onUpdateItem(index, 'baseDesign', '');
                        return;
                      }

                      const spec = jewelrySpecs.find(s => String(s.id) === selectedValue);

                      if (spec) {
                        onUpdateItem(index, 'jewelrySpecId', selectedValue);
                        onUpdateItem(index, 'productName', spec.name);
                        onUpdateItem(index, 'productType', spec.type);
                        onUpdateItem(index, 'baseDesign', spec.material);
                      }
                    }}
                    className="admin-select"
                    disabled={specsLoading}
                  >
                    <option value="">{specsLoading ? 'Loading products...' : 'Select product'}</option>
                    {!specsLoading && jewelrySpecs.map(spec => (
                      <option key={spec.id} value={String(spec.id)}>{spec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-label">
                    Product Type
                  </label>
                  <input
                    type="text"
                    value={selectedSpec ? selectedSpec.type || '' : item.productType || ''}
                    disabled
                    className="admin-input"
                    style={{ backgroundColor: '#f8fafb', cursor: 'not-allowed' }}
                  />
                </div>

                <div>
                  <label className="admin-label">
                    Base Design / Material
                  </label>
                  <input
                    type="text"
                    value={selectedSpec ? selectedSpec.material || '' : item.baseDesign || ''}
                    disabled
                    className="admin-input"
                    style={{ backgroundColor: '#f8fafb', cursor: 'not-allowed' }}
                  />
                </div>

                <div>
                  <label className="admin-label">
                    Target Quantity
                  </label>
                  <input
                    type="number"
                    value={item.targetQuantity || 0}
                    onChange={e => onUpdateItem(index, 'targetQuantity', parseInt(e.target.value) || 0)}
                    className="admin-input"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={onAddItem}
          className="admin-button admin-button-outline"
          style={{
            width: '100%',
            borderWidth: '2px',
            borderStyle: 'dashed',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            backgroundColor: '#fafbfc',
            marginTop: '1rem'
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: '400' }}>+</span>
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Add Product</span>
        </button>
      </div>
    </div>
  );
};

const VariantReviewStep = ({ collectionPlan, items }) => {
  const [variantItems, setVariantItems] = useState(() => {
    // Generate mock variants for each item based on age groups
    return items.map(item => ({
      ...item,
      variants: collectionPlan.ageGroupAllocations.map((allocation, idx) => ({
        id: `${item.id}-variant-${idx}`,
        ageGroupName: allocation.ageGroupName,
        metalType: idx === 0 ? 'Gold' : idx === 1 ? 'Silver' : 'Platinum',
        stoneShape: idx === 0 ? 'Round' : idx === 1 ? 'Princess' : 'Oval',
        stoneSize: `${1 + idx * 0.5} ct`,
        targetQuantity: Math.floor(item.targetQuantity * allocation.allocationPercentage / 100),
        matchScore: 90 - idx * 5,
        estimatedUnitCost: 150 + idx * 50,
        approved: true,
      }))
    }));
  });

  const handleQuantityChange = (itemId, variantId, value) => {
    setVariantItems(prev => prev.map(item =>
      item.id === itemId ? {
        ...item,
        variants: item.variants.map(variant =>
          variant.id === variantId ? { ...variant, targetQuantity: value } : variant
        )
      } : item
    ));
  };

  const handleApproveToggle = (itemId, variantId) => {
    setVariantItems(prev => prev.map(item =>
      item.id === itemId ? {
        ...item,
        variants: item.variants.map(variant =>
          variant.id === variantId ? { ...variant, approved: !variant.approved } : variant
        )
      } : item
    ));
  };

  const handleRemoveVariant = (itemId, variantId) => {
    setVariantItems(prev => prev.map(item =>
      item.id === itemId ? {
        ...item,
        variants: item.variants.filter(variant => variant.id !== variantId)
      } : item
    ));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>Age Group Variants</h2>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Review, edit, approve, or remove the generated variants for each age group. Adjust quantities or exclude variants as needed before proceeding.
        </p>
      </div>

      {variantItems.length === 0 ? (
        <div className="admin-empty-state">
          <p>No variants generated yet. Please add products in Step 1.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {variantItems.map((item) => (
            <div key={item.id} className="admin-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>{item.productName || 'Unnamed Product'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {item.variants && item.variants.map((variant) => (
                  <div key={variant.id} style={{
                    backgroundColor: '#fafbfc',
                    borderRadius: '6px',
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    opacity: variant.approved ? 1 : 0.5
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: '#0f172a' }}>{variant.ageGroupName}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '500' }}>
                        {variant.matchScore}% match
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Metal:</span>
                        <span style={{ fontWeight: '500', color: '#0f172a' }}>{variant.metalType}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Shape:</span>
                        <span style={{ fontWeight: '500', color: '#0f172a' }}>{variant.stoneShape}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Size:</span>
                        <span style={{ fontWeight: '500', color: '#0f172a' }}>{variant.stoneSize}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Quantity:</span>
                        <input
                          type="number"
                          min={0}
                          value={variant.targetQuantity}
                          onChange={e => handleQuantityChange(item.id, variant.id, parseInt(e.target.value) || 0)}
                          className="admin-input"
                          style={{ width: '80px', textAlign: 'right', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                          disabled={!variant.approved}
                        />
                      </div>
                      {variant.estimatedUnitCost && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Est. Cost:</span>
                          <span style={{ fontWeight: '500', color: '#0f172a' }}>
                            ${variant.estimatedUnitCost.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.75rem', gap: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', color: '#64748b' }}>
                        <input
                          type="checkbox"
                          checked={variant.approved}
                          onChange={() => handleApproveToggle(item.id, variant.id)}
                          style={{ marginRight: '0.375rem' }}
                        />
                        Approve
                      </label>
                      <button
                        className="admin-button admin-button-danger"
                        style={{ marginLeft: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleRemoveVariant(item.id, variant.id)}
                        title="Remove variant"
                      >
                        × Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPlanWizard;
