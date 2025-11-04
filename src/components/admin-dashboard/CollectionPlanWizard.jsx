import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';

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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!collectionPlan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Collection Plan Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">Please select a valid collection plan</p>
          {onBack && (
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 font-medium"
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
    <div className="collection-plan-wizard">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Collection Info */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{collectionPlan.name}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {collectionPlan.totalQuantity} pieces • Deadline: {new Date(collectionPlan.deadline).toLocaleDateString()}
          </p>
        </div>

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
        <div className="bg-white rounded-lg shadow-sm">
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
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={handleBack}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {currentStep === 1 ? 'Back to Dashboard' : 'Previous'}
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {currentStep === 1 ? 'Generate Variants' : 'Find Vendors'}
              <ArrowRight size={16} />
            </button>
          </div>
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Target Products</h2>
        <p className="text-sm text-gray-600">
          Add the products you want to include in this collection drop.
          We'll generate age-specific variants for each product.
        </p>
      </div>

      {/* Age Group Allocation Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Age Group Allocation</h3>
        <div className="grid grid-cols-3 gap-4">
          {collectionPlan.ageGroupAllocations.map((allocation) => (
            <div key={allocation.id} className="text-center">
              <div className="text-lg font-semibold text-blue-900">{allocation.allocationPercentage}%</div>
              <div className="text-sm text-blue-700">{allocation.ageGroupName}</div>
              <div className="text-xs text-blue-600">{allocation.targetQuantity} pieces</div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Items */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const selectedSpec = jewelrySpecs.find(spec => String(spec.id) === String(item.jewelrySpecId));
          return (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">Product {index + 1}</h4>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={specsLoading}
                  >
                    <option value="">{specsLoading ? 'Loading products...' : 'Select product'}</option>
                    {!specsLoading && jewelrySpecs.map(spec => (
                      <option key={spec.id} value={String(spec.id)}>{spec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <input
                    type="text"
                    value={selectedSpec ? selectedSpec.type || '' : item.productType || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Design / Material
                  </label>
                  <input
                    type="text"
                    value={selectedSpec ? selectedSpec.material || '' : item.baseDesign || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Quantity
                  </label>
                  <input
                    type="number"
                    value={item.targetQuantity || 0}
                    onChange={e => onUpdateItem(index, 'targetQuantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={onAddItem}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        >
          <Plus size={24} className="mx-auto text-gray-400 mb-2" />
          <div className="text-sm text-gray-600">Add Product</div>
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Age Group Variants</h2>
        <p className="text-sm text-gray-600">
          Review, edit, approve, or remove the generated variants for each age group. Adjust quantities or exclude variants as needed before proceeding.
        </p>
      </div>

      {variantItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No variants generated yet. Please add products in Step 1.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {variantItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{item.productName || 'Unnamed Product'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {item.variants && item.variants.map((variant) => (
                  <div key={variant.id} className={`bg-gray-50 rounded-lg p-4 relative ${!variant.approved ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{variant.ageGroupName}</h4>
                      <span className="text-sm text-green-600 font-medium">
                        {variant.matchScore}% match
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metal:</span>
                        <span className="font-medium">{variant.metalType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shape:</span>
                        <span className="font-medium">{variant.stoneShape}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{variant.stoneSize}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Quantity:</span>
                        <input
                          type="number"
                          min={0}
                          value={variant.targetQuantity}
                          onChange={e => handleQuantityChange(item.id, variant.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                          disabled={!variant.approved}
                        />
                      </div>
                      {variant.estimatedUnitCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Cost:</span>
                          <span className="font-medium">
                            ${variant.estimatedUnitCost.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center mt-3 gap-2">
                      <label className="flex items-center text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.approved}
                          onChange={() => handleApproveToggle(item.id, variant.id)}
                          className="mr-1"
                        />
                        Approve
                      </label>
                      <button
                        className="ml-auto text-red-500 hover:text-red-700 text-xs flex items-center"
                        onClick={() => handleRemoveVariant(item.id, variant.id)}
                        title="Remove variant"
                      >
                        <X size={14} /> Remove
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
