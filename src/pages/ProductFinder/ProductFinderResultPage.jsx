/**
 * ProductFinderResultPage - Shows recommended product based on quiz answers
 * Layout: Large product image left, info right
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import GlassThemeButton from '@/components/common/button/GlassThemeButton';

import './ProductFinderResultPage.css';

// Diamond shape mapping
const DIAMOND_DATA = {
  heart: { name: 'Heart', image: 'mirror_DMM/HEART-01.webp' },
  oval: { name: 'Oval', image: 'mirror_DMM/HEART-02.webp' },
  round: { name: 'Round', image: 'mirror_DMM/HEART-03.webp' },
  pear: { name: 'Pear', image: 'mirror_DMM/HEART-04.webp' },
  asscher: { name: 'Asscher', image: 'mirror_DMM/HEART-05.webp' },
  emerald: { name: 'Emerald', image: 'mirror_DMM/HEART-06.webp' },
  marquise: { name: 'Marquise', image: 'mirror_DMM/HEART-07.webp' },
};

// Band mapping
const BAND_DATA = {
  solitaire: { name: 'Solitaire' },
  pave: { name: 'Pavé' },
  halo: { name: 'Halo' },
  'three-stone': { name: 'Three Stone' },
  vintage: { name: 'Vintage' },
};

// Mock product recommendations based on selections
const getRecommendedProduct = (selections) => {
  const diamond = DIAMOND_DATA[selections.diamond] || DIAMOND_DATA.round;
  const band = BAND_DATA[selections.band] || BAND_DATA.solitaire;

  return {
    id: 'prod-001',
    name: 'Lumina Olivia',
    description: `The Lumina Olivia rings in 18K gold, ${diamond.name.toLowerCase()} diamond shape. The Lumina Olivia rings in 18K gold, ${diamond.name.toLowerCase()} diamond shape.`,
    price: '$15.600',
    image: 'products/ring-result.webp', // Placeholder - replace with actual ring image
    diamond: diamond,
    band: band,
  };
};

const ProductFinderResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const selections = location.state?.selections || {};

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const recommended = getRecommendedProduct(selections);
      setProduct(recommended);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selections]);

  const handleBookAppointment = () => {
    navigate(ROUTES.BOOK_APPOINTMENT);
  };

  const handlePreOrder = () => {
    // Navigate to pre-order or product detail
    if (product?.id) {
      navigate(ROUTES.CONTACT);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleRetake = () => {
    navigate(ROUTES.PRODUCT_FINDER);
  };

  if (loading) {
    return (
      <div className="product-finder-result" data-navbar-theme="black">
        <div className="product-finder-result__loading">
          <motion.div
            className="product-finder-result__loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="bodytext-5--no-margin">Đang tìm sản phẩm phù hợp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-finder-result" data-navbar-theme="black">
      <div className="product-finder-result__container">
        {/* Product Image - Left */}
        <motion.div
          className="product-finder-result__image-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={getMediaUrl(product.image)}
            alt={product.name}
            className="product-finder-result__image"
          />
        </motion.div>

        {/* Product Info - Right */}
        <motion.div
          className="product-finder-result__info-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="product-finder-result__info-content">
            <h1 className="product-finder-result__name">
              {product.name}
            </h1>

            <p className="product-finder-result__description bodytext-5--no-margin">
              {product.description}
            </p>

            <p className="product-finder-result__price">
              {product.price}
            </p>

            {/* Action Buttons */}
            <div className="product-finder-result__actions">
              <GlassThemeButton
                theme="event_dark"
                onClick={handleBookAppointment}
                className="product-finder-result__btn-appointment"
              >
                Book An Appointment
              </GlassThemeButton>
              <button
                className={`product-finder-result__btn-wishlist ${isWishlisted ? 'product-finder-result__btn-wishlist--active' : ''}`}
                onClick={handleWishlist}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            <GlassThemeButton
              theme="event_spec"
              onClick={handlePreOrder}
              className="product-finder-result__btn-preorder"
            >
              Pre-order now
            </GlassThemeButton>

            {/* Links */}
            <div className="product-finder-result__links">
              <a href="#" className="product-finder-result__link">
                Complimentary shipping & returns
              </a>
              <a href="#" className="product-finder-result__link" onClick={(e) => { e.preventDefault(); navigate(ROUTES.CONTACT); }}>
                Contact us
              </a>
            </div>

            {/* Change Selection */}
            <button
              className="product-finder-result__retake"
              onClick={handleRetake}
            >
              ← Thay đổi lựa chọn
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductFinderResultPage;
