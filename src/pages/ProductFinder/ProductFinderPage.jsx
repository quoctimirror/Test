/**
 * ProductFinderPage - Quiz to find the perfect jewelry piece
 * Layout similar to EventChooseShapePage with orbit selection
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import GlassThemeButton from '@/components/common/button/GlassThemeButton';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import { productFinderAPI } from '@/services/api';

import './ProductFinderPage.css';

// Helper to format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Orbit configuration - similar to EventChooseShapePage
const orbitRadii = {
  1: { rx: 333, ry: 56 },
  2: { rx: 539, ry: 80 },
  3: { rx: 821, ry: 113.5 },
};

// ViewBox dimensions
const VIEWBOX_WIDTH = 1700;
const VIEWBOX_HEIGHT = 280;
const CENTER_X = 850;
const CENTER_Y = 140;

// Calculate position on ellipse
const getPositionOnOrbit = (orbit, angleDeg) => {
  const { rx, ry } = orbitRadii[orbit];
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = rx * Math.cos(angleRad);
  const y = ry * Math.sin(angleRad);
  const percentX = ((CENTER_X + x) / VIEWBOX_WIDTH) * 100;
  const percentY = ((CENTER_Y + y) / VIEWBOX_HEIGHT) * 100;
  return { percentX, percentY };
};

// Generate orbit angles based on number of items
const getOrbitAngles = (count) => {
  const angles = [];
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    angles.push(i * step);
  }
  return angles;
};

// Helper to find index by selection id
const getIndexFromSelection = (options, selectionId) => {
  if (!options || !selectionId) return 0;
  const index = options.findIndex(opt => opt.id === selectionId);
  return index >= 0 ? index : 0;
};

// Combo preview images (from public/product-finder/)
const COMBO_PREVIEWS = {
  'solitaire': '/product-finder/cadillac_a1.png',
  'knife-edge-solitaire': '/product-finder/baguette_a1.png',
};

const ProductFinderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams();
  const currentStepIndex = step === 'choose-band' ? 1 : 0;

  // API data states
  const [diamondShapes, setDiamondShapes] = useState([]);
  const [bandStyles, setBandStyles] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Read saved state from navigation (when coming back from result page)
  const savedSelections = location.state?.selections || {};
  const savedPrices = location.state?.prices || {};

  const [selections, setSelections] = useState(savedSelections);
  const [selectedPrices, setSelectedPrices] = useState({
    diamond: savedPrices.diamond || 0,
    band: savedPrices.band || 0,
  });
  const [selectedIndices, setSelectedIndices] = useState({
    diamond: 0,
    band: 0,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [isEntering, setIsEntering] = useState(true);
  const [showIdleRipple, setShowIdleRipple] = useState(false);
  const animationRef = useRef(null);
  const idleTimerRef = useRef(null);

  // Remove entering class after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Idle ripple effect - show after 5 seconds of inactivity
  useEffect(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    setShowIdleRipple(false);

    idleTimerRef.current = setTimeout(() => {
      setShowIdleRipple(true);
    }, 5000);

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [currentIndex]);

  // Sync currentIndex and rotationOffset when URL step changes (component doesn't remount)
  const prevStepRef = useRef(step);
  useEffect(() => {
    if (prevStepRef.current !== step) {
      prevStepRef.current = step;
      const stepId = currentStepIndex === 1 ? 'band' : 'diamond';
      setCurrentIndex(selectedIndices[stepId] || 0);
      setRotationOffset(0);
    }
  }, [step]);

  // Guard: direct access to choose-band without selecting diamond first
  useEffect(() => {
    if (step === 'choose-band' && !selections.diamond && !apiLoading) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
    }
  }, [step, selections.diamond, apiLoading]);

  // Guard: redirect invalid step values to choose-shape
  useEffect(() => {
    if (step !== 'choose-shape' && step !== 'choose-band') {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
    }
  }, [step]);

  // Fetch options from API on mount
  useEffect(() => {
    const abortController = new AbortController();

    const loadOptions = async () => {
      try {
        const [shapesRes, bandsRes] = await Promise.all([
          productFinderAPI.getDiamondShapes({ signal: abortController.signal }),
          productFinderAPI.getBandStyles({ signal: abortController.signal }),
        ]);
        if (abortController.signal.aborted) return;

        // TODO: re-enable Cushion, Princess, Radiant when ready
        const HIDDEN_SHAPES = ['cushion', 'princess', 'radiant'];
        const shapes = (shapesRes.data || []).filter(
          s => !HIDDEN_SHAPES.includes(s.id?.toLowerCase()) && !HIDDEN_SHAPES.includes(s.name?.toLowerCase())
        );
        const bands = bandsRes.data || [];
        setDiamondShapes(shapes);
        setBandStyles(bands);

        // Restore saved indices if coming back from result page
        const diamondIdx = getIndexFromSelection(shapes, savedSelections.diamond);
        const bandIdx = getIndexFromSelection(bands, savedSelections.band);
        setSelectedIndices({ diamond: diamondIdx, band: bandIdx });
        setCurrentIndex(diamondIdx);
        setSelectedPrices(prev => ({
          diamond: savedPrices.diamond || shapes[diamondIdx]?.price || 0,
          band: savedPrices.band || 0,
        }));
      } catch (error) {
        if (abortController.signal.aborted) return;
        console.error('Failed to load product finder options:', error);
        setApiError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        if (!abortController.signal.aborted) {
          setApiLoading(false);
        }
      }
    };
    loadOptions();

    return () => {
      abortController.abort();
    };
  }, []);

  // Build quiz steps dynamically from API data
  const quizSteps = [
    { id: 'diamond', title: 'Chọn viên kim cương', subtitle: 'Lựa chọn hình dáng kim cương yêu thích', options: diamondShapes },
    { id: 'band', title: 'Chọn band nhẫn', subtitle: 'Lựa chọn kiểu dáng band nhẫn', options: bandStyles },
  ];

  const TOTAL_STEPS = quizSteps.length;
  const currentStep = quizSteps[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / TOTAL_STEPS) * 100;
  const orbitAngles = getOrbitAngles(currentStep.options.length);

  // Calculate estimated total (sum of all previous selections + current selection)
  const calculateEstimatedTotal = () => {
    let total = 0;
    for (let i = 0; i < currentStepIndex; i++) {
      const stepId = quizSteps[i].id;
      total += selectedPrices[stepId] || 0;
    }
    const currentOption = currentStep.options[currentIndex];
    total += currentOption?.price || 0;
    return total;
  };

  const estimatedTotal = calculateEstimatedTotal();

  // Calculate angle for each shape
  const getShapeAngle = (index) => {
    const baseAngle = orbitAngles[index];
    let angle = baseAngle - rotationOffset + 90;
    angle = ((angle % 360) + 360) % 360;
    return angle;
  };

  // Animate rotation when currentIndex changes
  useEffect(() => {
    // Guard: skip if no data yet (orbitAngles empty → targetOffset would be undefined → NaN)
    if (orbitAngles.length === 0) return;

    const targetOffset = orbitAngles[currentIndex];
    let normalizedStart = rotationOffset % 360;
    if (normalizedStart < 0) normalizedStart += 360;

    let diff = targetOffset - normalizedStart;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const duration = 1200;
    const startTime = performance.now();
    const animStartOffset = rotationOffset;
    const animTargetOffset = animStartOffset + diff;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutBounce = (t) => {
        if (t < 0.9) {
          return 1.008 * (1 - Math.pow(1 - t / 0.9, 3));
        } else {
          const bounceProgress = (t - 0.9) / 0.1;
          return 1.008 - 0.008 * (1 - Math.pow(1 - bounceProgress, 2));
        }
      };

      const eased = easeOutBounce(progress);
      const currentOffset = animStartOffset + (animTargetOffset - animStartOffset) * eased;
      setRotationOffset(currentOffset);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, currentStepIndex, orbitAngles.length]);

  // Handle option click
  const handleOptionClick = (index) => {
    if (index === currentIndex || isAnimating) return;

    setPrevIndex(currentIndex);
    setIsAnimating(true);
    setCurrentIndex(index);

    const option = currentStep.options[index];
    setSelections(prev => ({
      ...prev,
      [currentStep.id]: option.id
    }));

    // Update selected price for current step
    setSelectedPrices(prev => ({
      ...prev,
      [currentStep.id]: option.price || 0
    }));

    // Save selected index for current step
    setSelectedIndices(prev => ({
      ...prev,
      [currentStep.id]: index
    }));

    setTimeout(() => {
      setIsAnimating(false);
      setPrevIndex(null);
    }, 600);
  };

  // Handle back
  const handleBack = () => {
    if (currentStepIndex > 0) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE);
    } else {
      navigate(-1);
    }
  };

  // Handle next
  const handleNext = () => {
    // Save current selection and index
    const option = currentStep.options[currentIndex];
    setSelections(prev => ({
      ...prev,
      [currentStep.id]: option.id
    }));
    setSelectedPrices(prev => ({
      ...prev,
      [currentStep.id]: option.price || 0
    }));
    setSelectedIndices(prev => ({
      ...prev,
      [currentStep.id]: currentIndex
    }));

    if (currentStepIndex === 0) {
      // Shape → Band: navigate to choose-band
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_BAND);
    } else {
      // Band → Result: navigate to result
      const finalSelections = { ...selections, [currentStep.id]: option.id };
      const finalPrices = { ...selectedPrices, [currentStep.id]: option.price || 0 };
      navigate(ROUTES.PRODUCT_FINDER_RESULT, {
        state: {
          diamond: finalSelections.diamond,
          band: finalSelections.band,
          selections: finalSelections,
          prices: finalPrices,
          estimatedTotal: estimatedTotal
        }
      });
    }
  };

  const currentOption = currentStep.options[currentIndex];

  // Show loading while fetching API data
  if (apiLoading) {
    return (
      <div className="product-finder" data-navbar-theme="black">
        <div className="product-finder__loading">
          <motion.div
            className="product-finder__loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  // Show error if API failed or no data loaded
  if (apiError || !currentOption) {
    return (
      <div className="product-finder" data-navbar-theme="black">
        <div className="product-finder__loading">
          <p className="bodytext-5--no-margin">{apiError || 'Không có dữ liệu'}</p>
          <GlassThemeButton theme="event_dark" onClick={() => window.location.reload()}>
            Thử lại
          </GlassThemeButton>
        </div>
      </div>
    );
  }

  return (
    <div className="product-finder" data-navbar-theme="black">
      {/* Progress Bar */}
      <div className="product-finder__progress">
        <motion.div
          className="product-finder__progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step indicator */}
      <div className="product-finder__step-indicator">
        {currentStepIndex + 1} / {TOTAL_STEPS}
      </div>

      {/* Price Panel - Right side */}
      <div className="product-finder__price-panel">
        {/* Current selection price */}
        <div className="product-finder__current-price">
          <span className="product-finder__current-name">{currentOption.name}</span>
          <span className="product-finder__current-value">{formatPrice(currentOption.price || 0)}</span>
        </div>

        {/* Estimated Total */}
        <div className="product-finder__estimated-total">
          <span className="product-finder__estimated-label">Estimated Total</span>
          <span className="product-finder__estimated-price">{formatPrice(estimatedTotal)}</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="product-finder__title heading-3--no-margin">
        {currentOption.name}
      </h1>

      {/* Main Content Area */}
      <div className={`product-finder__main ${isEntering ? 'product-finder__main--entering' : ''}`}>
        {/* Center Diamond Display */}
        <div className="product-finder__center">
          {/* Old image - animating out */}
          {isAnimating && prevIndex !== null && (() => {
            const prevOption = currentStep.options[prevIndex];
            const prevSrc = (currentStep.id === 'band' && COMBO_PREVIEWS[prevOption.id])
              ? COMBO_PREVIEWS[prevOption.id]
              : getMediaUrl(prevOption.gif || prevOption.image);
            const exitClass = currentStep.id === 'band' ? 'product-finder__diamond--fade-out' : 'product-finder__diamond--exit';
            return (
              <div className={`product-finder__diamond ${exitClass}`}>
                <img src={prevSrc} alt={prevOption.name} className="product-finder__diamond-img" />
              </div>
            );
          })()}
          {/* Current image - enter (diamond) or reveal-bottom (band) */}
          <div className={`product-finder__diamond ${isAnimating ? (currentStep.id === 'band' ? 'product-finder__diamond--reveal-bottom' : 'product-finder__diamond--enter') : ''}`}>
            <img
              src={
                (currentStep.id === 'band' && COMBO_PREVIEWS[currentOption.id])
                  ? COMBO_PREVIEWS[currentOption.id]
                  : getMediaUrl(currentOption.gif || currentOption.image)
              }
              alt={currentOption.name}
              className="product-finder__diamond-img"
            />
          </div>
        </div>
      </div>

      {/* Orbits Section */}
      <div className={`product-finder__orbits-container ${isEntering ? 'product-finder__orbits-container--entering' : ''}`}>
        {/* SVG Orbits */}
        <svg
          className="product-finder__orbits-svg"
          viewBox="0 0 1700 280"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="finderOrbitGlow1" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#FFFFFF"/>
              <stop offset="33.65%" stopColor="#FCE8EE" stopOpacity="0.6"/>
              <stop offset="54.33%" stopColor="#F6EDEF"/>
              <stop offset="93.27%" stopColor="#FFFFFF" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#FFFFFF"/>
            </radialGradient>
            <radialGradient id="finderOrbitGlow2" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#EFBCCA"/>
              <stop offset="54.33%" stopColor="#FFE3EA"/>
              <stop offset="82.21%" stopColor="#FFF7F9" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#FFFFFF"/>
            </radialGradient>
            <radialGradient id="finderOrbitGlow3" cx="0.5" cy="0.5" r="0.5">
              <stop offset="77.88%" stopColor="#FFFDFE"/>
              <stop offset="87.5%" stopColor="#FFF5F8"/>
              <stop offset="96.63%" stopColor="#BC224C"/>
              <stop offset="100%" stopColor="#FFFFFF"/>
            </radialGradient>
            <linearGradient id="finderOrbitStroke2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8"/>
              <stop offset="29.3%" stopColor="#FFD9E3" stopOpacity="0.2"/>
              <stop offset="71.6%" stopColor="#FFD9E3" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8"/>
            </linearGradient>
            <linearGradient id="finderOrbitStroke3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6"/>
              <stop offset="29.3%" stopColor="#FFD9E3" stopOpacity="0.1"/>
              <stop offset="71.6%" stopColor="#FFD9E3" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.6"/>
            </linearGradient>
          </defs>

          {/* 3 Orbits */}
          <ellipse
            cx="850" cy="140"
            rx={orbitRadii[3].rx} ry={orbitRadii[3].ry}
            fill="url(#finderOrbitGlow3)"
            stroke="url(#finderOrbitStroke3)"
            strokeWidth="1.5"
            opacity="0.1"
          />
          <ellipse
            cx="850" cy="140"
            rx={orbitRadii[2].rx} ry={orbitRadii[2].ry}
            fill="url(#finderOrbitGlow2)"
            stroke="url(#finderOrbitStroke2)"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <ellipse
            cx="850" cy="140"
            rx={orbitRadii[1].rx} ry={orbitRadii[1].ry}
            fill="url(#finderOrbitGlow1)"
            stroke="none"
          />
        </svg>

        {/* Options on orbit */}
        <div className="product-finder__orbit-shapes">
          {currentStep.options.map((option, index) => {
            const angle = getShapeAngle(index);
            const pos = getPositionOnOrbit(1, angle);
            const isSelected = index === currentIndex;
            const rightShapeIndex = (currentIndex - 1 + currentStep.options.length) % currentStep.options.length;
            const showRippleOnThis = index === rightShapeIndex && showIdleRipple;

            return (
              <div
                key={option.id}
                className={`product-finder__orbit-shape ${isSelected ? 'product-finder__orbit-shape--selected' : 'product-finder__orbit-shape--blurred'}`}
                style={{
                  left: `${pos.percentX}%`,
                  top: `${pos.percentY}%`,
                  transform: 'translate(-50%, -100%)'
                }}
                onClick={() => handleOptionClick(index)}
              >
                <img
                  src={getMediaUrl(option.image)}
                  alt={option.name}
                  className="product-finder__orbit-shape-img"
                  draggable="false"
                />
                {showRippleOnThis && (
                  <div className="product-finder__idle-ripple">
                    <span className="product-finder__idle-ripple-ring"></span>
                    <span className="product-finder__idle-ripple-ring"></span>
                    <span className="product-finder__idle-ripple-ring"></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Select text - bottom center */}
      <p className="product-finder__select-text bodytext-6--no-margin">
        Chọn {currentStep.id === 'diamond' ? 'hình dáng kim cương' : 'kiểu band nhẫn'} của bạn
      </p>

      {/* Navigation Buttons */}
      <div className="product-finder__nav">
        {currentStepIndex > 0 && (
          <GlassThemeButton
            theme="event_dark"
            onClick={handleBack}
            className="product-finder__nav-btn product-finder__nav-btn--back"
          >
            Quay lại
          </GlassThemeButton>
        )}

        <GlassThemeButton
          theme="event_dark"
          onClick={handleNext}
          className="product-finder__nav-btn product-finder__nav-btn--next"
        >
          {currentStepIndex === TOTAL_STEPS - 1 ? 'Xem kết quả' : 'Tiếp tục'}
        </GlassThemeButton>
      </div>
    </div>
  );
};

export default ProductFinderPage;
