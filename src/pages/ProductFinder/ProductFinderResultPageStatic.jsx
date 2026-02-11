/**
 * ProductFinderResultPageStatic - Frontend-only version (no backend API required)
 * Shows recommended product based on quiz answers
 * Layout: Large product image left, info right
 */
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/utils/formatPrice';
import GlassThemeButton from '@/components/common/button/GlassThemeButton';
import { getProductFinderConfigByKey } from '@/components/productsV2/shapeConfig';

import './ProductFinderResultPage.css';

const ProductFinderResultPageStatic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const viewerContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const isViewerInitializedRef = useRef(false);
  const colorChangeHandlerRef = useRef(null);
  const colorsRef = useRef({ main: null, side: null, band: null });

  // Get selections from location state
  const diamond = location.state?.diamond;
  const band = location.state?.band;
  const sidestone = location.state?.sidestone;
  const savedSelections = location.state?.selections || {};
  const savedPrices = location.state?.prices || {};
  const savedEstimatedTotal = location.state?.estimatedTotal || 0;
  const modelKey = location.state?.modelKey;
  const passedModelId = location.state?.modelId;

  useEffect(() => {
    // Require all 3 selections
    if (!diamond || !band || !sidestone) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
      return;
    }

    // Build product from local config (no API call)
    const config = modelKey ? getProductFinderConfigByKey(modelKey) : null;

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    setProduct({
      name: config?.name || `${capitalize(band)} ${capitalize(diamond)} ${capitalize(sidestone)} Ring`,
      description: `${capitalize(diamond)} diamond with ${band} band and ${sidestone} side stones.`,
      estimatedTotal: savedEstimatedTotal,
      estimatedTotalFormatted: formatPrice(savedEstimatedTotal),
      modelId: passedModelId || config?.modelId,
      images: [],
    });
  }, [diamond, band, sidestone, navigate, passedModelId, modelKey, savedEstimatedTotal]);

  // iJewel SDK: load 3D model with configurator
  useEffect(() => {
    const modelId = product?.modelId;
    if (!modelId || !viewerContainerRef.current) return;
    if (!window.ijewelViewer?.loadModelById) {
      console.error('iJewel SDK not loaded');
      return;
    }

    // Prevent double initialization for same model
    if (isViewerInitializedRef.current === modelId) return;
    isViewerInitializedRef.current = modelId;

    let cancelled = false;

    const handleViewerReady = (event) => {
      if (cancelled) return;

      const viewer = event.detail.viewer;
      viewerRef.current = viewer;

      setTimeout(() => {
        if (cancelled) return;

        const configurator = viewer.plugins?.MaterialConfiguratorPlugin;
        if (!configurator?.variations) return;

        const materialToTab = {};
        configurator.variations.forEach(v => {
          materialToTab[v.uuid] = v.title;
        });

        const getMaterials = () => {
          const materials = [];
          viewer.traverseSceneObjects((obj) => {
            if (obj.material) {
              materials.push({
                name: obj.material.name,
                color: obj.material.color?.getHexString?.() || 'N/A',
              });
            }
          });
          return materials;
        };

        const materials = getMaterials();
        const lastTabColors = {};
        Object.keys(materialToTab).forEach(uuid => {
          const mat = materials.find(m => m.name === uuid);
          if (mat) {
            lastTabColors[materialToTab[uuid]] = mat.color;
            colorsRef.current[materialToTab[uuid]] = '#' + mat.color;
          }
        });

        const handleColorChange = () => {
          setTimeout(() => {
            const currentMaterials = getMaterials();
            Object.keys(materialToTab).forEach(uuid => {
              const tabName = materialToTab[uuid];
              const mat = currentMaterials.find(m => m.name === uuid);
              if (mat && mat.color !== lastTabColors[tabName]) {
                lastTabColors[tabName] = mat.color;
                colorsRef.current[tabName] = '#' + mat.color;
              }
            });
          }, 200);
        };
        colorChangeHandlerRef.current = handleColorChange;
        document.addEventListener('click', handleColorChange);
      }, 4000);
    };

    window.addEventListener('ijewel-viewer-ready', handleViewerReady);

    const initViewer = async () => {
      try {
        await window.ijewelViewer.loadModelById(
          product.modelId,
          'drive',
          viewerContainerRef.current,
          {
            showUiButtons: false,
            showConfigurator: true,
            hideNameNumbers: true
          }
        );
      } catch (err) {
        console.error('iJewel loadModelById failed:', err);
      }
    };

    initViewer();

    return () => {
      cancelled = true;
      window.removeEventListener('ijewel-viewer-ready', handleViewerReady);
      if (colorChangeHandlerRef.current) {
        document.removeEventListener('click', colorChangeHandlerRef.current);
        colorChangeHandlerRef.current = null;
      }
      if (viewerRef.current?.dispose) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
      isViewerInitializedRef.current = null;
      if (viewerContainerRef.current) {
        viewerContainerRef.current.innerHTML = '';
      }
    };
  }, [product?.modelId]);

  const handleBookAppointment = () => {
    navigate(ROUTES.BOOK_APPOINTMENT);
  };

  const handlePreOrder = () => {
    // Static version: just navigate to contact
    navigate(ROUTES.CONTACT);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleRetake = () => {
    navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, {
      state: {
        selections: savedSelections,
        prices: savedPrices,
        estimatedTotal: savedEstimatedTotal
      }
    });
  };

  if (!product) {
    return (
      <div className="product-finder-result" data-navbar-theme="black">
        <div className="product-finder-result__loading">
          <div className="product-finder-result__loading-spinner" />
          <p className="bodytext-5--no-margin">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-finder-result" data-navbar-theme="black">
      <div className="product-finder-result__container">
        {/* Product Image - Left */}
        <div className="product-finder-result__image-section">
          {product.modelId ? (
            <div
              ref={viewerContainerRef}
              className="product-finder-result__viewer"
            />
          ) : (
            <div className="product-finder-result__no-image">
              <img
                src={`/product-finder/a1_${band}_${diamond}_${sidestone}.png`}
                alt={product.name}
                className="product-finder-result__image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<p>No image available</p>';
                }}
              />
            </div>
          )}
        </div>

        {/* Product Info - Right */}
        <div className="product-finder-result__info-section">
          <div className="product-finder-result__info-content">
            <h1 className="product-finder-result__name">
              {product.name}
            </h1>

            <p className="product-finder-result__description bodytext-5--no-margin">
              {product.description}
            </p>

            {/* Selection Summary */}
            <div className="product-finder-result__selections">
              <div className="product-finder-result__selection-item">
                <span className="product-finder-result__selection-label">Main Stone:</span>
                <span className="product-finder-result__selection-value">{diamond}</span>
              </div>
              <div className="product-finder-result__selection-item">
                <span className="product-finder-result__selection-label">Band:</span>
                <span className="product-finder-result__selection-value">{band}</span>
              </div>
              <div className="product-finder-result__selection-item">
                <span className="product-finder-result__selection-label">Side Stones:</span>
                <span className="product-finder-result__selection-value">{sidestone}</span>
              </div>
            </div>

            <p className="product-finder-result__price">
              {product.estimatedTotalFormatted}
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
              <button type="button" className="product-finder-result__link" onClick={() => {}}>
                Complimentary shipping & returns
              </button>
              <button type="button" className="product-finder-result__link" onClick={() => navigate(ROUTES.CONTACT)}>
                Contact us
              </button>
            </div>

            {/* Change Selection */}
            <button
              className="product-finder-result__retake"
              onClick={handleRetake}
            >
              ← Thay đổi lựa chọn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFinderResultPageStatic;
