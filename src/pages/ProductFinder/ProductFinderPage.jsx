/**
 * ProductFinderPage - Quiz to find the perfect jewelry piece
 * 3 Steps: Main Stone → Band → Side Stone → Result
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import GlassThemeButton from '@/components/common/button/GlassThemeButton';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import { formatPrice } from '@/utils/formatPrice';
import { productFinderAPI } from '@/services/api';
import { getProductFinderConfig } from '@/components/productsV2/shapeConfig';

import './ProductFinderPage.css';

// Orbit configuration
const orbitRadii = {
  1: { rx: 333, ry: 56 },
  2: { rx: 539, ry: 80 },
  3: { rx: 821, ry: 113.5 },
};

const VIEWBOX_WIDTH = 1700;
const VIEWBOX_HEIGHT = 280;
const CENTER_X = 850;
const CENTER_Y = 140;

const getPositionOnOrbit = (orbit, angleDeg) => {
  const { rx, ry } = orbitRadii[orbit];
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = rx * Math.cos(angleRad);
  const y = ry * Math.sin(angleRad);
  const percentX = ((CENTER_X + x) / VIEWBOX_WIDTH) * 100;
  const percentY = ((CENTER_Y + y) / VIEWBOX_HEIGHT) * 100;
  return { percentX, percentY };
};

const getOrbitAngles = (count) => {
  const angles = [];
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    angles.push(i * step);
  }
  return angles;
};

const getIndexFromSelection = (options, selectionId) => {
  if (!options || !selectionId) return 0;
  const index = options.findIndex(opt => opt.id === selectionId);
  return index >= 0 ? index : 0;
};

// Step URL mapping
const STEP_MAP = {
  'choose-shape': 0,
  'choose-band': 1,
  'choose-sidestone': 2,
};

const ProductFinderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams();
  const currentStepIndex = STEP_MAP[step] ?? 0;

  // API data states
  const [diamondShapes, setDiamondShapes] = useState([]);
  const [bandStyles, setBandStyles] = useState([]);
  const [sideStones, setSideStones] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Read saved state from navigation
  const savedSelections = location.state?.selections || {};
  const savedPrices = location.state?.prices || {};

  const [selections, setSelections] = useState(savedSelections);
  const [selectedPrices, setSelectedPrices] = useState({
    diamond: savedPrices.diamond || 0,
    band: savedPrices.band || 0,
    sidestone: savedPrices.sidestone || 0,
  });
  const [selectedIndices, setSelectedIndices] = useState({
    diamond: 0,
    band: 0,
    sidestone: 0,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [isEntering, setIsEntering] = useState(true);
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
    if (apiLoading) return;
    if (step === 'choose-band' && !selections.diamond) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
    }
    if (step === 'choose-sidestone' && (!selections.diamond || !selections.band)) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
    }
  }, [step, selections, apiLoading, navigate]);

  // Guard: invalid step
  useEffect(() => {
    if (!['choose-shape', 'choose-band', 'choose-sidestone'].includes(step)) {
      navigate(ROUTES.PRODUCT_FINDER_CHOOSE_SHAPE, { replace: true });
    }
  }, [step, navigate]);

  // Fetch all options from API
  useEffect(() => {
    const abortController = new AbortController();

    const loadOptions = async () => {
      try {
        // Fetch all 3 data sets in parallel
        const [shapesRes, bandsRes, stonesRes] = await Promise.all([
          productFinderAPI.getDiamondShapes({ signal: abortController.signal }),
          productFinderAPI.getBandStyles({ signal: abortController.signal }),
          productFinderAPI.getSideStones({ signal: abortController.signal }),
        ]);
        if (abortController.signal.aborted) return;

        // Diamond shapes from API - use isActive from backend
        const shapes = (shapesRes.data || []).map(s => ({
          id: s.id,
          name: s.name,
          price: s.price || 0,
          image: s.image,
          gif: s.gif,
          isActive: s.isActive !== false,
        }));
        setDiamondShapes(shapes);

        // Band styles from API - use isActive from backend
        const bands = (bandsRes.data || []).map(b => ({
          id: b.id,
          name: b.name,
          price: b.price || 0,
          image: b.image || `/product-finder/bands/${b.id}.png`,
          isActive: b.isActive !== false,
        }));
        setBandStyles(bands);

        // Side stones from API - use isActive from backend
        const stones = (stonesRes.data || []).map(s => ({
          id: s.id,
          name: s.name,
          price: s.price || 0,
          image: s.image || `/product-finder/sidestones/${s.id}.png`,
          isActive: s.isActive !== false,
        }));
        setSideStones(stones);

        // Restore saved indices
        const diamondIdx = getIndexFromSelection(shapes, savedSelections.diamond);
        const bandIdx = getIndexFromSelection(bands, savedSelections.band);
        const sidestoneIdx = getIndexFromSelection(stones, savedSelections.sidestone);
        setSelectedIndices({ diamond: diamondIdx, band: bandIdx, sidestone: sidestoneIdx });
        setCurrentIndex(diamondIdx);
        setSelectedPrices({
          diamond: savedPrices.diamond || shapes[diamondIdx]?.price || 0,
          band: savedPrices.band || bands[bandIdx]?.price || 0,
          sidestone: savedPrices.sidestone || stones[sidestoneIdx]?.price || 0,
        });
      } catch (error) {
        if (abortController.signal.aborted) return;
        console.error('Failed to load product finder options:', error);
        setApiError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        if (!abortController.signal.aborted) setApiLoading(false);
      }
    };
    loadOptions();

    return () => abortController.abort();
  }, []);

  // Build quiz steps
  const quizSteps = [
    { id: 'diamond', title: 'Chọn viên kim cương', options: diamondShapes },
    { id: 'band', title: 'Chọn đai nhẫn', options: bandStyles },
    { id: 'sidestone', title: 'Chọn đá phụ', options: sideStones },
  ];

  const TOTAL_STEPS = quizSteps.length;
  const currentStep = quizSteps[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / TOTAL_STEPS) * 100;
  const orbitAngles = getOrbitAngles(currentStep?.options?.length || 1);

  // Calculate estimated total
  const calculateEstimatedTotal = () => {
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
  };

  const estimatedTotal = calculateEstimatedTotal();

  // Get angle for shape
  const getShapeAngle = (index) => {
    const baseAngle = orbitAngles[index];
    let angle = baseAngle - rotationOffset + 90;
    angle = ((angle % 360) + 360) % 360;
    return angle;
  };

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

  // Get center preview for animation
  const getCenterPreview = (option) => {
    if (currentStepIndex === 0) {
      return getMediaUrl(option.gif || option.image);
    } else if (currentStepIndex === 1) {
      // Step 2: Band - dùng hình combo làm placeholder
      const mainStone = selections.diamond || 'round';
      return `/product-finder/a1_${option.id}_${mainStone}_baguette.png`;
    } else {
      // Step 3: Full combo images
      const mainStone = selections.diamond || 'round';
      const band = selections.band || 'single';
      return `/product-finder/a1_${band}_${mainStone}_${option.id}.png`;
    }
  };

  const currentOption = currentStep?.options?.[currentIndex];

  // Loading state
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

  // Error state
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
          <div className={`product-finder__diamond ${isAnimating ? (currentStepIndex > 0 ? 'product-finder__diamond--reveal-bottom' : 'product-finder__diamond--enter') : ''} ${isLocked ? 'product-finder__diamond--locked' : ''}`}>
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
          <ellipse cx="850" cy="140" rx={orbitRadii[3].rx} ry={orbitRadii[3].ry} fill="url(#finderOrbitGlow3)" stroke="url(#finderOrbitStroke3)" strokeWidth="1.5" opacity="0.1"/>
          <ellipse cx="850" cy="140" rx={orbitRadii[2].rx} ry={orbitRadii[2].ry} fill="url(#finderOrbitGlow2)" stroke="url(#finderOrbitStroke2)" strokeWidth="1.5" opacity="0.5"/>
          <ellipse cx="850" cy="140" rx={orbitRadii[1].rx} ry={orbitRadii[1].ry} fill="url(#finderOrbitGlow1)" stroke="none"/>
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
                  src={currentStepIndex === 0 ? getMediaUrl(option.gif || option.image) : option.image}
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

export default ProductFinderPage;
