import React from "react";
import "./Section2ProductSpecs.css";

const Section2ProductSpecs = ({ product }) => {
  // Prepare specifications data
  const specifications = [
    {
      category: "General",
      items: [
        { label: "Product Code", value: product?.productCode },
        { label: "Category", value: product?.categoryName },
        { label: "Collection", value: product?.collectionName },
        { label: "Status", value: product?.status },
      ]
    },
    {
      category: "Materials",
      items: [
        { label: "Gold Weight", value: product?.goldWeight ? `${product.goldWeight}g` : null },
        { label: "Diamond Weight", value: product?.diamondWeight ? `${product.diamondWeight} ct` : null },
        { label: "Gemstone Type", value: product?.gemstoneType },
        { label: "Gemstone Weight", value: product?.gemstoneWeight ? `${product.gemstoneWeight} ct` : null },
        { label: "Metal Type", value: product?.metalType },
        { label: "Metal Purity", value: product?.metalPurity },
      ]
    },
    {
      category: "Dimensions",
      items: [
        { label: "Width", value: product?.width ? `${product.width} mm` : null },
        { label: "Height", value: product?.height ? `${product.height} mm` : null },
        { label: "Depth", value: product?.depth ? `${product.depth} mm` : null },
        { label: "Size", value: product?.size },
      ]
    },
    {
      category: "Pricing",
      items: [
        { label: "Base Price", value: product?.basePrice ? `$${product.basePrice.toLocaleString()}` : null },
        { label: "Sale Price", value: product?.salePrice ? `$${product.salePrice.toLocaleString()}` : null },
        { label: "Labor Cost", value: product?.laborCost ? `$${product.laborCost.toLocaleString()}` : null },
      ]
    },
    {
      category: "Inventory",
      items: [
        { label: "Stock Quantity", value: product?.stockQuantity },
        { label: "Reorder Level", value: product?.reorderLevel },
        { label: "Location", value: product?.locationWarehouse },
      ]
    },
  ];

  // Filter out empty categories
  const filteredSpecs = specifications
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.value !== null && item.value !== undefined && item.value !== "")
    }))
    .filter(cat => cat.items.length > 0);

  if (filteredSpecs.length === 0) {
    return null;
  }

  return (
    <div className="section2-product-specs" data-navbar-theme="black">
      <div className="product-specs-container">
        <div className="specs-header">
          <h2 className="specs-title heading-2--no-margin">
            Technical Specifications
          </h2>
          <p className="specs-subtitle bodytext-4--no-margin">
            Detailed information about this piece
          </p>
        </div>

        <div className="specs-grid">
          {filteredSpecs.map((category, idx) => (
            <div key={idx} className="spec-category">
              <h3 className="category-title bodytext-3--no-margin">
                {category.category}
              </h3>
              <div className="category-items">
                {category.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="spec-row">
                    <span className="spec-label bodytext-4--no-margin">
                      {item.label}
                    </span>
                    <span className="spec-value bodytext-4--no-margin">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section2ProductSpecs;
