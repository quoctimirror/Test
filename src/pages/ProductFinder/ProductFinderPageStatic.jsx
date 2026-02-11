/**
 * ProductFinderPageStatic - Frontend-only version (no backend API required)
 * Quiz to find the perfect jewelry piece
 * 3 Steps: Main Stone → Band → Side Stone → Result
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import GlassThemeButton from '@/components/common/button/GlassThemeButton';
// Note: Not using getMediaUrl - all URLs are hardcoded for static version
import { formatPrice } from '@/utils/formatPrice';
import { getProductFinderConfig } from '@/components/productsV2/shapeConfig';
import {
  ORBIT_RADII,
  getPositionOnOrbit,
  getOrbitAngles,
  getIndexFromSelection,
  STEP_MAP,
  buildImagePath,
} from './utils/orbitUtils';

import './ProductFinderPage.css';

// ==================== STATIC DATA (No API needed) ====================

// Cloudflare R2 base URL - same as backend uses
const CLOUDFLARE_BASE = 'https://pub-0d0ac1b25b8f4a6ab2a01fcdb1dd59b0.r2.dev/media-webp';

const STATIC_DIAMOND_SHAPES = [
  {
    id: 'round',
    name: 'Round',
    price: 0,
    image: `${CLOUDFLARE_BASE}/mirror_DMM/ROUND-01.webp`,
    gif: `${CLOUDFLARE_BASE}/mirror_DMM/ROUND.gif`,
    isActive: true,
  },
  {
    id: 'oval',
    name: 'Oval',
    price: 0,
    image: `${CLOUDFLARE_BASE}/mirror_DMM/OVAL-01.webp`,
    gif: `${CLOUDFLARE_BASE}/mirror_DMM/OVAL.gif`,
    isActive: true,
  },
  {
    id: 'pear',
    name: 'Pear',
    price: 0,
    image: `${CLOUDFLARE_BASE}/mirror_DMM/PEAR-01.webp`,
    gif: `${CLOUDFLARE_BASE}/mirror_DMM/PEAR.gif`,
    isActive: true,
  },
  {
    id: 'emerald',
    name: 'Emerald',
    price: 0,
    image: `${CLOUDFLARE_BASE}/mirror_DMM/EMERALD-01.webp`,
    gif: `${CLOUDFLARE_BASE}/mirror_DMM/EMERALD.gif`,
    isActive: true,
  },
  {
    id: 'radiant',
    name: 'Radiant',
    price: 0,
    image: `${CLOUDFLARE_BASE}/mirror_DMM/RADIANT-01.webp`,
    gif: `${CLOUDFLARE_BASE}/mirror_DMM/RADIANT.gif`,
    isActive: true,
  },
];

const STATIC_BAND_STYLES = [
  {
    id: 'single',
    name: 'Single',
    price: 0,
    image: '/product-finder/bands/single.png',
    isActive: true,
  },
  {
    id: 'double',
    name: 'Double',
    price: 0,
    image: '/product-finder/bands/double.png',
    isActive: true,
  },
];

const STATIC_SIDE_STONES = [
  {
    id: 'noside',
    name: 'No Side',
    price: 0,
    image: '/product-finder/sidestones/noside.png',
    isActive: true,
  },
  {
    id: 'baguette',
    name: 'Baguette',
    price: 0,
    image: '/product-finder/sidestones/baguette.png',
    isActive: true,
  },
  {
    id: 'halfmoon',
    name: 'Half Moon',
    price: 0,
    image: '/product-finder/sidestones/halfmoon.png',
    isActive: true,
  },
];

// =====================================================================

const ProductFinderPageStatic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams();
  const currentStepIndex = STEP_MAP[step] ?? 0;

  // Static data - no API calls needed
  const diamondShapes = STATIC_DIAMOND_SHAPES;
  const bandStyles = STATIC_BAND_STYLES;
  const sideStones = STATIC_SIDE_STONES;

  // Read saved state from navigation
  const savedSelections = location.state?.selections || {};
  const savedPrices = location.state?.prices || {};

  const [selections, setSelections] = useState(savedSelections);
  const [selectedPrices, setSelectedPrices] = useState({
    diamond: savedPrices.diamond || 0,
    band: savedPrices.band || 0,
    sidestone: savedPrices.sidestone || 0,
  });

  // Initialize selected indices from saved selections
  const initialDiamondIdx = getIndexFromSelection(diamondShapes, savedSelections.diamond);
  const initialBandIdx = getIndexFromSelection(bandStyles, savedSelections.band);
  const initialSidestoneIdx = getIndexFromSelection(sideStones, savedSelections.sidestone);

  const [selectedIndices, setSelectedIndices] = useState({
    diamond: initialDiamondIdx,
    band: initialBandIdx,
    sidestone: initialSidestoneIdx,
  });
  const [currentIndex, setCurrentIndex] = useState(initialDiamondIdx);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const [showIdleRipple, setShowIdleRipple] = useState(false);
  const animationRef = useRef(null);
  const idleTimerRef = useRef(null);

  // Remove entering class after animation
  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Idle ripple effect
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setShowIdleRipple(false);
    idleTimerRef.current = setTimeout(() => setShowIdleRipple(true), 5000);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [currentIndex]);

  // Sync currentIndex when step changes
  const prevStepRef = useRef(step);
  useEffect(() => {
    if (prevStepRef.current !== step) {
      prevStepRef.current = step;
      const stepIds = ['diamond', 'band', 'sidestone'];
      const stepId = stepIds[currentStepIndex] || 'diamond';
      setCurrentIndex(selectedIndices[stepId] || 0);
      setRotationOffset(0);
    }
  }, [step, currentStepIndex, selectedIndices]);

  // Guard: direct access without previous selections
  useEffect(() => {
    if (step === 'choose-band' && !selections.diamond) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
    }
    if (step === 'choose-sidestone' && (!selections.diamond || !selections.band)) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
    }
  }, [step, selections, navigate]);

  // Guard: invalid step
  useEffect(() => {
    if (!['choose-shape', 'choose-band', 'choose-sidestone'].includes(step)) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
    }
  }, [step, navigate]);

  // Build quiz steps - memoized to prevent recalculation on every render
  const quizSteps = useMemo(() => [
    { id: 'diamond', title: 'Chọn viên kim cương', options: diamondShapes },
    { id: 'band', title: 'Chọn đai nhẫn', options: bandStyles },
    { id: 'sidestone', title: 'Chọn đá phụ', options: sideStones },
  ], [diamondShapes, bandStyles, sideStones]);

  const TOTAL_STEPS = quizSteps.length;
  const currentStep = quizSteps[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / TOTAL_STEPS) * 100;

  // Memoize orbit angles calculation
  const orbitAngles = useMemo(
    () => getOrbitAngles(currentStep?.options?.length || 1),
    [currentStep?.options?.length]
  );

  // Calculate estimated total - memoized
  const estimatedTotal = useMemo(() => {
    let total = 0;
    for (let i = 0; i < currentStepIndex; i++) {
      const stepId = quizSteps[i].id;
      total += selectedPrices[stepId] || 0;
    }
    const currentOption = currentStep?.options?.[currentIndex];
    if (currentOption?.isActive !== false) {
      total += currentOption?.price || 0;
    }
    return total;
  }, [currentStepIndex, quizSteps, selectedPrices, currentStep?.options, currentIndex]);

  // Get angle for shape - memoized callback
  const getShapeAngle = useCallback((index) => {
    const baseAngle = orbitAngles[index];
    // Step 1 (choose-band): use horizontal layout (left/right)
    // Other steps: use vertical layout (top/bottom)
    const offsetAngle = currentStepIndex === 1 ? 0 : 90;
    let angle = baseAngle - rotationOffset + offsetAngle;
    angle = ((angle % 360) + 360) % 360;
    return angle;
  }, [orbitAngles, rotationOffset, currentStepIndex]);

  // Animate rotation
  useEffect(() => {
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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [currentIndex, currentStepIndex, orbitAngles.length]);

  // Handle option click
  const handleOptionClick = (index) => {
    const option = currentStep.options[index];
    // Don't allow selecting locked items
    if (option.isActive === false) return;
    if (index === currentIndex || isAnimating) return;

    setPrevIndex(currentIndex);
    setIsAnimating(true);
    setCurrentIndex(index);

    setSelections(prev => ({ ...prev, [currentStep.id]: option.id }));
    setSelectedPrices(prev => ({ ...prev, [currentStep.id]: option.price || 0 }));
    setSelectedIndices(prev => ({ ...prev, [currentStep.id]: index }));

    setTimeout(() => {
      setIsAnimating(false);
      setPrevIndex(null);
    }, 600);
  };

  // Handle back
  const handleBack = () => {
    if (currentStepIndex === 2) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_BAND, { state: { selections, prices: selectedPrices } });
    } else if (currentStepIndex === 1) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { state: { selections, prices: selectedPrices } });
    } else {
      navigate(-1);
    }
  };

  // Handle next
  const handleNext = () => {
    const option = currentStep.options[currentIndex];
    // Don't proceed if locked
    if (option.isActive === false) return;

    const newSelections = { ...selections, [currentStep.id]: option.id };
    const newPrices = { ...selectedPrices, [currentStep.id]: option.price || 0 };
    const newIndices = { ...selectedIndices, [currentStep.id]: currentIndex };

    setSelections(newSelections);
    setSelectedPrices(newPrices);
    setSelectedIndices(newIndices);

    if (currentStepIndex === 0) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_BAND, { state: { selections: newSelections, prices: newPrices } });
    } else if (currentStepIndex === 1) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SIDESTONE, { state: { selections: newSelections, prices: newPrices } });
    } else {
      // Step 3 → Result
      const modelKey = `${newSelections.band}_${newSelections.diamond}_${newSelections.sidestone}`;
      const config = getProductFinderConfig(newSelections.band, newSelections.diamond, newSelections.sidestone);
      navigate(ROUTES.PRODUCT_FINDER_RESULT, {
        state: {
          diamond: newSelections.diamond,
          band: newSelections.band,
          sidestone: newSelections.sidestone,
          selections: newSelections,
          prices: newPrices,
          estimatedTotal: estimatedTotal,
          modelKey: modelKey,
          modelId: config?.modelId || null,
        }
      });
    }
  };

  // Get center preview for animation - memoized callback
  const getCenterPreview = useCallback((option) => {
    if (currentStepIndex === 0) {
      // URLs are already absolute (Cloudflare) or local path
      return option.gif || option.image;
    } else if (currentStepIndex === 1) {
      // Step 2: Band - use combo image without sidestone as placeholder
      const mainStone = selections.diamond || 'round';
      return buildImagePath(option.id, mainStone, 'noside');
    } else {
      // Step 3: Full combo images
      const mainStone = selections.diamond || 'round';
      const band = selections.band || 'single';
      return buildImagePath(band, mainStone, option.id);
    }
  }, [currentStepIndex, selections.diamond, selections.band]);

  const currentOption = currentStep?.options?.[currentIndex];

  // No loading state needed for static version
  if (!currentOption) {
    return (
      <div className="product-finder" data-navbar-theme="black">
        <div className="product-finder__loading">
          <p className="bodytext-5--no-margin">Không có dữ liệu</p>
          <GlassThemeButton theme="event_dark" onClick={() => window.location.reload()}>
            Thử lại
          </GlassThemeButton>
        </div>
      </div>
    );
  }

  const isLocked = currentOption.isActive === false;

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

      {/* Price Panel */}
      <div className="product-finder__price-panel">
        <div className="product-finder__current-price">
          <span className="product-finder__current-name">{currentOption.name}</span>
          <span className="product-finder__current-value">
            {formatPrice(currentOption.price || 0)}
          </span>
        </div>
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
        <div className="product-finder__center">
          {/* Old image - animating out */}
          {isAnimating && prevIndex !== null && (() => {
            const prevOption = currentStep.options[prevIndex];
            const prevSrc = getCenterPreview(prevOption);
            const exitClass = currentStepIndex > 0 ? 'product-finder__diamond--fade-out' : 'product-finder__diamond--exit';
            return (
              <div className={`product-finder__diamond ${exitClass}`}>
                <img src={prevSrc} alt={prevOption.name} className="product-finder__diamond-img" />
              </div>
            );
          })()}
          {/* Current image */}
          <div className={`product-finder__diamond ${isAnimating ? (currentStepIndex === 0 ? 'product-finder__diamond--enter' : currentStepIndex === 1 ? 'product-finder__diamond--reveal-bottom' : 'product-finder__diamond--reveal-center') : ''} ${isLocked ? 'product-finder__diamond--locked' : ''}`}>
            <img
              src={getCenterPreview(currentOption)}
              alt={currentOption.name}
              className="product-finder__diamond-img"
            />
          </div>
        </div>
      </div>

      {/* Orbits Section */}
      <div className={`product-finder__orbits-container ${isEntering ? 'product-finder__orbits-container--entering' : ''}`}>
        <svg className="product-finder__orbits-svg" viewBox="0 0 1700 280" preserveAspectRatio="xMidYMid meet">
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
          <ellipse cx="850" cy="140" rx={ORBIT_RADII[3].rx} ry={ORBIT_RADII[3].ry} fill="url(#finderOrbitGlow3)" stroke="url(#finderOrbitStroke3)" strokeWidth="1.5" opacity="0.1"/>
          <ellipse cx="850" cy="140" rx={ORBIT_RADII[2].rx} ry={ORBIT_RADII[2].ry} fill="url(#finderOrbitGlow2)" stroke="url(#finderOrbitStroke2)" strokeWidth="1.5" opacity="0.5"/>
          <ellipse cx="850" cy="140" rx={ORBIT_RADII[1].rx} ry={ORBIT_RADII[1].ry} fill="url(#finderOrbitGlow1)" stroke="none"/>
        </svg>

        {/* Options on orbit */}
        <div className="product-finder__orbit-shapes">
          {currentStep.options.map((option, index) => {
            const angle = getShapeAngle(index);
            const pos = getPositionOnOrbit(1, angle);
            const isSelected = index === currentIndex;
            const optionLocked = option.isActive === false;
            const rightShapeIndex = (currentIndex - 1 + currentStep.options.length) % currentStep.options.length;
            const showRippleOnThis = index === rightShapeIndex && showIdleRipple && !optionLocked;

            return (
              <div
                key={option.id}
                className={`product-finder__orbit-shape ${isSelected ? 'product-finder__orbit-shape--selected' : 'product-finder__orbit-shape--blurred'} ${optionLocked ? 'product-finder__orbit-shape--locked' : ''}`}
                style={{
                  left: `${pos.percentX}%`,
                  top: `${pos.percentY}%`,
                  transform: 'translate(-50%, -100%)'
                }}
                onClick={() => handleOptionClick(index)}
              >
                <img
                  src={currentStepIndex === 0 ? (option.gif || option.image) : getCenterPreview(option)}
                  alt={option.name}
                  className="product-finder__orbit-shape-img"
                  draggable="false"
                />
                {currentStepIndex > 0 && (
                  <span className="product-finder__orbit-shape-label">{option.name}</span>
                )}
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

      {/* Select text */}
      <p className="product-finder__select-text bodytext-6--no-margin">
        {currentStepIndex === 0 && 'Chọn hình dáng kim cương của bạn'}
        {currentStepIndex === 1 && 'Chọn kiểu đai nhẫn của bạn'}
        {currentStepIndex === 2 && 'Chọn loại đá phụ của bạn'}
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
          disabled={isLocked}
          className={`product-finder__nav-btn product-finder__nav-btn--next ${isLocked ? 'product-finder__nav-btn--disabled' : ''}`}
        >
          {currentStepIndex === TOTAL_STEPS - 1 ? 'Xem kết quả' : 'Tiếp tục'}
        </GlassThemeButton>
      </div>
    </div>
  );
};

export default ProductFinderPageStatic;
