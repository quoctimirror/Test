import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "@/services/api";
import { getProductDetailRoute } from "@/constants/routes";
import "./Section5RelatedProducts.css";

const Section5RelatedProducts = ({ product }) => {
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.collectionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productsAPI.getByCollection(product.collectionId);
        // Filter out current product and limit to 4 products
        const filtered = response.data
          .filter(p => p.id !== product.id)
          .slice(0, 4);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product?.collectionId, product?.id]);

  if (loading) {
    return (
      <div className="section5-related-products" data-navbar-theme="black">
        <div className="related-products-container">
          <div className="loading-state">Loading related products...</div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  const handleProductClick = (productId) => {
    navigate(getProductDetailRoute(productId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    if (!price) return "Contact for price";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="section5-related-products" data-navbar-theme="black">
      <div className="related-products-container">
        {/* Header */}
        <div className="related-header">
          <h2 className="related-title heading-2--no-margin">
            From The Same Collection
          </h2>
          <p className="related-subtitle bodytext-4--no-margin">
            Explore more pieces from {product?.collectionName || "this collection"}
          </p>
        </div>

        {/* Products Grid */}
        <div className="related-products-grid">
          {relatedProducts.map((relatedProduct) => {
            // Get first valid image, filtering out example.com
            const getValidImage = (product) => {
              if (product?.imageUrls && product.imageUrls.length > 0) {
                const validUrl = product.imageUrls.find(url => url && !url.includes('example.com'));
                if (validUrl) return validUrl;
              }
              if (product?.imageUrl && !product.imageUrl.includes('example.com')) {
                return product.imageUrl;
              }
              return null;
            };
            const image = getValidImage(relatedProduct);

            return (
              <div
                key={relatedProduct.id}
                className="related-product-card"
                onClick={() => handleProductClick(relatedProduct.id)}
              >
                <div className="product-card-image">
                  {image ? (
                    <img src={image} alt={relatedProduct.name} />
                  ) : (
                    <div className="product-card-placeholder">
                      No Image
                    </div>
                  )}
                </div>

                <div className="product-card-info">
                  <h3 className="product-card-name bodytext-3--no-margin">
                    {relatedProduct.name}
                  </h3>
                  <p className="product-card-sku bodytext-4--no-margin">
                    {relatedProduct.skuCode}
                  </p>
                  <p className="product-card-price bodytext-3--no-margin">
                    {formatPrice(relatedProduct.salePrice)}
                  </p>
                </div>

                <button className="product-card-button">
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Section5RelatedProducts;
