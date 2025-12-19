import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "@/services/api";
import Section1ProductHero from "@components/product-detail/Section1ProductHero";
import Section2ProductSpecs from "@components/product-detail/Section2ProductSpecs";
import Section3ProductDescription from "@components/product-detail/Section3ProductDescription";
import Section4ProductMedia from "@components/product-detail/Section4ProductMedia";
import Section5RelatedProducts from "@components/product-detail/Section5RelatedProducts";
import Section6ProductCTA from "@components/product-detail/Section6ProductCTA";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import OrderFormModal from "@components/productsV2/OrderFormModal";
import OrderSuccessModal from "@components/productsV2/OrderSuccessModal";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import { ROUTES } from "@/constants/routes";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '.footer',
  });
  const { theme: arrowTheme } = useBottomTheme();

  // Product data state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order modal states
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getById(productId);
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Detect scroll (removed immersive button functionality)

  // Order handlers
  const handleOrderNow = () => {
    setShowOrderForm(true);
  };

  const handleOrderSuccess = (order) => {
    setOrderDetails(order);
    setShowOrderForm(false);
    setShowOrderSuccess(true);
  };

  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
  };

  const handleCloseOrderSuccess = () => {
    setShowOrderSuccess(false);
    setOrderDetails(null);
  };

  // Prepare product details for order form
  const getProductDetailsForOrder = () => {
    if (!product) return null;
    return {
      id: product.id,
      name: product.itemName || product.name || "Product",
      price: product.salePrice || product.price || 0,
      quantity: 1,
      // Product specs for regular products (not configurable)
      isRegularProduct: true,
      skuCode: product.skuCode,
      category: product.categoryName,
      metalType: product.metalType,
      metalPurity: product.metalPurity,
      stoneType: product.stoneType,
      weightGrams: product.weightGrams,
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-detail-error">
        <h2>Error Loading Product</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="error-back-button">
          Go Back
        </button>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate(-1)} className="error-back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-wrapper">
      {/* Section 1: Product Hero */}
      <Section1ProductHero product={product} onOrderNow={handleOrderNow} />

      {/* Section 2: Product Specifications */}
      <Section2ProductSpecs product={product} />

      {/* Section 3: Product Description */}
      <Section3ProductDescription product={product} />

      {/* Section 4: Product Media (Photos, Videos, AR View, AR Try-On) */}
      <Section4ProductMedia product={product} />

      {/* Section 5: Related Products */}
      <Section5RelatedProducts product={product} />

      {/* Section 6: Product CTA */}
      <Section6ProductCTA product={product} />

      {/* Fixed Arrow Button */}
      {isArrowVisible && (
        <div className="fixed-arrow-container">
          <ScrollDownArrow theme={arrowTheme} onClick={handleArrowClick} />
        </div>
      )}

      {/* Order Form Modal */}
      <OrderFormModal
        isOpen={showOrderForm}
        onClose={handleCloseOrderForm}
        productDetails={getProductDetailsForOrder()}
        onSuccess={handleOrderSuccess}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={showOrderSuccess}
        onClose={handleCloseOrderSuccess}
        orderDetails={orderDetails}
      />
    </div>
  );
};

export default ProductDetailPage;
