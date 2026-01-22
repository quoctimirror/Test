/**
 * ProductFinderPage - Quiz to find the perfect jewelry piece
 * Layout similar to EventChooseShapePage with orbit selection
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import GlassThemeButton from '@/components/common/button/GlassThemeButton';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';

import './ProductFinderPage.css';

// Quiz steps configuration
const QUIZ_STEPS = [
  {
    id: 'diamond',
    title: 'Chọn viên kim cương',
    subtitle: 'Lựa chọn hình dáng kim cương yêu thích',
    options: [
      { id: 'heart', name: 'Heart', image: 'mirror_DMM/HEART-01.webp', gif: 'mirror_DMM/HEART.gif' },
      { id: 'oval', name: 'Oval', image: 'mirror_DMM/HEART-02.webp', gif: 'mirror_DMM/OVAL.gif' },
      { id: 'round', name: 'Round', image: 'mirror_DMM/HEART-03.webp', gif: 'mirror_DMM/ROUND.gif' },
      { id: 'pear', name: 'Pear', image: 'mirror_DMM/HEART-04.webp', gif: 'mirror_DMM/PEAR.gif' },
      { id: 'asscher', name: 'Asscher', image: 'mirror_DMM/HEART-05.webp', gif: 'mirror_DMM/ASSCHER.gif' },
      { id: 'emerald', name: 'Emerald', image: 'mirror_DMM/HEART-06.webp', gif: 'mirror_DMM/EMERALD.gif' },
      { id: 'marquise', name: 'Marquise', image: 'mirror_DMM/HEART-07.webp', gif: 'mirror_DMM/MARQUISE.gif' },
    ],
  },
  {
    id: 'band',
    title: 'Chọn band nhẫn',
    subtitle: 'Lựa chọn kiểu dáng band nhẫn',
    options: [
      { id: 'solitaire', name: 'Solitaire', image: 'products/band-solitaire.webp', icon: '💎' },
      { id: 'pave', name: 'Pavé', image: 'products/band-pave.webp', icon: '✨' },
      { id: 'halo', name: 'Halo', image: 'products/band-halo.webp', icon: '⭕' },
      { id: 'three-stone', name: 'Three Stone', image: 'products/band-three-stone.webp', icon: '◆◆◆' },
      { id: 'vintage', name: 'Vintage', image: 'products/band-vintage.webp', icon: '🏛️' },
    ],
  },
];

const TOTAL_STEPS = QUIZ_STEPS.length;

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

const ProductFinderPage = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [isEntering, setIsEntering] = useState(true);
  const animationRef = useRef(null);

  const currentStep = QUIZ_STEPS[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / TOTAL_STEPS) * 100;
  const orbitAngles = getOrbitAngles(currentStep.options.length);

  // Calculate angle for each shape
  const getShapeAngle = (index) => {
    const baseAngle = orbitAngles[index];
    let angle = baseAngle - rotationOffset + 90;
    angle = ((angle % 360) + 360) % 360;
    return angle;
  };

  // Animate rotation when currentIndex changes
  useEffect(() => {
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
  }, [currentIndex, orbitAngles]);

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

    setTimeout(() => {
      setIsAnimating(false);
      setPrevIndex(null);
    }, 600);
  };

  // Handle back
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setCurrentIndex(0);
      setRotationOffset(0);
    } else {
      navigate(-1);
    }
  };

  // Handle next
  const handleNext = () => {
    // Save current selection if not already saved
    if (!selections[currentStep.id]) {
      const option = currentStep.options[currentIndex];
      setSelections(prev => ({
        ...prev,
        [currentStep.id]: option.id
      }));
    }

    if (currentStepIndex < TOTAL_STEPS - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setCurrentIndex(0);
      setRotationOffset(0);
    } else {
      // Quiz completed
      navigate(ROUTES.PRODUCT_FINDER_RESULT, {
        state: { selections: { ...selections, [currentStep.id]: currentStep.options[currentIndex].id } }
      });
    }
  };

  const currentOption = currentStep.options[currentIndex];

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

      {/* Title */}
      <h1 className="product-finder__title heading-3--no-margin">
        {currentOption.name}
      </h1>

      {/* Main Content Area */}
      <div className={`product-finder__main ${isEntering ? 'product-finder__main--entering' : ''}`}>
        {/* Center Diamond Display */}
        <div className="product-finder__center">
          {/* Old shape - animating out */}
          {isAnimating && prevIndex !== null && (
            <div className="product-finder__diamond product-finder__diamond--exit">
              <img
                src={getMediaUrl(currentStep.options[prevIndex].gif || currentStep.options[prevIndex].image)}
                alt={currentStep.options[prevIndex].name}
                className="product-finder__diamond-img"
              />
            </div>
          )}
          {/* Current shape - animating in or static */}
          <div className={`product-finder__diamond ${isAnimating ? 'product-finder__diamond--enter' : ''}`}>
            <img
              src={getMediaUrl(currentOption.gif || currentOption.image)}
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
