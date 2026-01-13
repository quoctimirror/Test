/**
 * ChooseNoteShapeScreenNew - Step 3: Preview card with 3D flip effect
 * Shows a 3D flip card with front (generated image) and back (card back)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Instagram } from 'lucide-react';
import shareIcon from '@/assets/images/button/share.svg';
import { ROUTES } from '@/constants/routes';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';
import AvatarGenerator, { downloadAvatar } from '@/components/event/ui/AvatarGenerator';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import NavbarV4 from '@/components/navbar/NavbarV4';

// Mapping from shape ID (h1, h2...) to diamondShape name for AvatarGenerator
const SHAPE_NAME_MAP = {
  h1: 'heart',
  h2: 'round',
  h3: 'emerald',
  h4: 'marquise',
  h5: 'pear',
  h6: 'oval',
  h7: 'princess', // Cushion/Asscher
};

// Custom gradient for ripple effect (lighter pink)
const RIPPLE_GRADIENT = `radial-gradient(50% 50% at 50% 50%, #F4A5B8 0%, rgba(185, 185, 185, 0.00) 54.33%, #FFF 93.27%, rgba(255, 255, 255, 0.00) 100%)`;

// Facebook icon component
const FacebookIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// TikTok icon component
const TikTokIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1V9.4c-.26-.03-.52-.05-.79-.05a6.33 6.33 0 0 0-6.33 6.33 6.33 6.33 0 0 0 6.33 6.33 6.33 6.33 0 0 0 6.33-6.33V9.26a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.69z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChooseNoteShapeScreenNew = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  // Flip card refs
  const cardRef = useRef(null);
  const cardContainerRef = useRef(null);
  const shineFrontRef = useRef(null);
  const shineBackRef = useRef(null);
  const shadowRef = useRef(null);
  const rippleRef = useRef(null);

  // Flip card state
  const [isFlipping, setIsFlipping] = useState(false);
  const [isShowingFront, setIsShowingFront] = useState(true);
  const [status, setStatus] = useState('front');
  const [isDraggingVisual, setIsDraggingVisual] = useState(false);

  // Use refs for values that need to be accessed in event listeners (avoid closure issues)
  const isDraggingRef = useRef(false);
  const isFlippingRef = useRef(false);
  const currentRotation = useRef(0);
  const velocity = useRef(0);
  const targetRotation = useRef(0);
  const animationId = useRef(null);
  const dragHistory = useRef([]);
  const dragLastX = useRef(0);
  const mouseDownTime = useRef(0);
  const mouseDownX = useRef(0);
  const isShowingFrontRef = useRef(true);

  // Physics
  const friction = 0.95;
  const snapStrength = 0.08;

  const { user, userNote, selectedDiamond } = useEventStore();
  const [avatarDataUrl, setAvatarDataUrl] = useState('');

  // Helper functions
  const calculateReleaseVelocity = useCallback(() => {
    if (dragHistory.current.length < 2) return 0;
    const recentHistory = dragHistory.current.slice(-5);
    let totalDelta = 0;
    let totalTime = 0;
    for (let i = 1; i < recentHistory.length; i++) {
      totalDelta += recentHistory[i].x - recentHistory[i - 1].x;
      totalTime += recentHistory[i].time - recentHistory[i - 1].time;
    }
    if (totalTime === 0) return 0;
    return (totalDelta / totalTime) * 16;
  }, []);

  const findNearestFrontAngle = useCallback((angle) => {
    return Math.round(angle / 360) * 360;
  }, []);

  const updateShine = useCallback((rotation) => {
    const normalized = ((rotation % 360) + 360) % 360;
    let frontShinePos = normalized <= 90 ? (normalized / 90) * 100 :
      normalized >= 270 ? ((normalized - 270) / 90) * 100 - 100 : 200;
    let backShinePos = (normalized >= 90 && normalized <= 270) ?
      ((normalized - 90) / 180) * 200 - 100 : 200;

    if (shineFrontRef.current) {
      shineFrontRef.current.style.setProperty('--shine-pos', `${frontShinePos}%`);
    }
    if (shineBackRef.current) {
      shineBackRef.current.style.setProperty('--shine-pos', `${backShinePos}%`);
    }
  }, []);

  const updateShadow = useCallback((rotation) => {
    const normalized = ((rotation % 360) + 360) % 360;
    const shadowOffset = Math.sin(normalized * Math.PI / 180) * 40;
    const shadowScale = 0.8 + Math.abs(Math.cos(normalized * Math.PI / 180)) * 0.2;
    const shadowOpacity = 0.3 + Math.abs(Math.cos(normalized * Math.PI / 180)) * 0.3;

    if (shadowRef.current) {
      shadowRef.current.style.transform = `translateX(calc(-50% + ${shadowOffset}px)) rotateX(90deg) scaleX(${shadowScale})`;
      shadowRef.current.style.opacity = shadowOpacity;
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!isDraggingRef.current && !isFlippingRef.current) {
      if (Math.abs(velocity.current) > 0.1) {
        velocity.current *= friction;
        currentRotation.current += velocity.current;
        const remainingDistance = velocity.current / (1 - friction);
        const predictedEnd = currentRotation.current + remainingDistance;
        targetRotation.current = findNearestFrontAngle(predictedEnd);
      } else {
        velocity.current = 0;
        const diff = targetRotation.current - currentRotation.current;
        if (Math.abs(diff) > 0.5) {
          currentRotation.current += diff * snapStrength;
        } else {
          currentRotation.current = targetRotation.current;
        }
      }

      if (cardRef.current) {
        cardRef.current.style.transform = `rotateY(${currentRotation.current}deg)`;
      }
      updateShine(currentRotation.current);
      updateShadow(currentRotation.current);
    }

    animationId.current = requestAnimationFrame(animate);
  }, [findNearestFrontAngle, updateShine, updateShadow]);

  // Start animation loop on mount
  useEffect(() => {
    animate();
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [animate]);

  // Initialize RippleEffect AFTER entrance animation completes (2.5s)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cardContainerRef.current && !rippleRef.current) {
        rippleRef.current = new RippleEffect(cardContainerRef.current, {
          autoRippleCount: 5,
          duration: 10000,
          delay: 2000,
          startSize: 100,
          endSize: 1200,
          opacity: 0.7,
          autoPlay: true,
          clickable: false,
          gradient: RIPPLE_GRADIENT,
        });
      }
    }, 1000); // Wait for entrance animation

    return () => {
      clearTimeout(timer);
      if (rippleRef.current) {
        rippleRef.current.destroy();
        rippleRef.current = null;
      }
    };
  }, []);

  const flipCard = useCallback(() => {
    if (isFlippingRef.current || isDraggingRef.current) return;

    isFlippingRef.current = true;
    setIsFlipping(true);
    velocity.current = 0;

    const willShowBack = isShowingFrontRef.current;

    if (cardRef.current) {
      cardRef.current.classList.remove('flipping-to-back', 'flipping-to-front');
      cardRef.current.style.transform = '';

      if (willShowBack) {
        cardRef.current.classList.add('flipping-to-back');
      } else {
        cardRef.current.classList.add('flipping-to-front');
      }
    }

    isShowingFrontRef.current = !isShowingFrontRef.current;
    setIsShowingFront(isShowingFrontRef.current);
    setStatus(willShowBack ? 'back' : 'front');

    setTimeout(() => {
      isFlippingRef.current = false;
      setIsFlipping(false);
      if (cardRef.current) {
        cardRef.current.classList.remove('flipping-to-back', 'flipping-to-front');
        const newRotation = willShowBack ? 180 : 0;
        currentRotation.current = newRotation;
        targetRotation.current = newRotation;
        cardRef.current.style.transform = `rotateY(${newRotation}deg)`;
      }
    }, 400);
  }, []);

  // Drag handlers
  const startDrag = useCallback((clientX) => {
    if (isFlippingRef.current) return;

    isDraggingRef.current = true;
    setIsDraggingVisual(true);
    setStatus('dragging');
    dragHistory.current = [{ x: clientX, time: performance.now() }];
    dragLastX.current = clientX;
    mouseDownX.current = clientX;
    mouseDownTime.current = Date.now();
    velocity.current = 0;

    if (cardRef.current) {
      cardRef.current.classList.remove('flipping-to-back', 'flipping-to-front');
    }
  }, []);

  const moveDrag = useCallback((clientX) => {
    if (!isDraggingRef.current) return;

    const deltaX = clientX - dragLastX.current;
    currentRotation.current += deltaX * 0.5;
    dragLastX.current = clientX;

    dragHistory.current.push({ x: clientX, time: performance.now() });
    if (dragHistory.current.length > 10) dragHistory.current.shift();

    if (cardRef.current) {
      cardRef.current.style.transform = `rotateY(${currentRotation.current}deg)`;
    }
    updateShine(currentRotation.current);
    updateShadow(currentRotation.current);
  }, [updateShine, updateShadow]);

  const endDrag = useCallback((clientX) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDraggingVisual(false);
    setStatus(isShowingFrontRef.current ? 'front' : 'back');

    velocity.current = calculateReleaseVelocity() * 0.5;
    const remainingDistance = velocity.current / (1 - friction);
    const predictedEnd = currentRotation.current + remainingDistance;
    targetRotation.current = findNearestFrontAngle(predictedEnd);

    // Check for click (short press without much movement)
    const clickDistance = Math.abs(clientX - mouseDownX.current);
    const clickDuration = Date.now() - mouseDownTime.current;
    if (clickDistance < 10 && clickDuration < 300) {
      flipCard();
    }
  }, [calculateReleaseVelocity, findNearestFrontAngle, flipCard]);

  // Mouse events
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    startDrag(e.clientX);
  }, [startDrag]);

  useEffect(() => {
    const handleMouseMove = (e) => moveDrag(e.clientX);
    const handleMouseUp = (e) => endDrag(e.clientX);
    const handleMouseLeave = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDraggingVisual(false);
        setStatus(isShowingFrontRef.current ? 'front' : 'back');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleMouseLeave);
    };
  }, [moveDrag, endDrag]);

  // Touch events
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    startDrag(e.touches[0].clientX);
  }, [startDrag]);

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isDraggingRef.current && e.touches.length > 0) {
        moveDrag(e.touches[0].clientX);
      }
    };
    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      endDrag(touch ? touch.clientX : dragLastX.current);
    };
    const handleTouchCancel = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDraggingVisual(false);
        setStatus(isShowingFrontRef.current ? 'front' : 'back');
      }
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [moveDrag, endDrag]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isDraggingRef.current) {
        e.preventDefault();
        flipCard();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [flipCard]);

  // Navigation - go back to step 2
  const handleGoBack = () => {
    navigate(ROUTES.EVENT_WRITE_MESSAGE);
  };

  // Handle download - download the generated avatar
  const handleDownload = async () => {
    if (!avatarDataUrl) return;
    setDownloading(true);
    const filename = `mirrorthankyou_${user?.displayName || 'guest'}_${Date.now()}.png`;
    downloadAvatar(avatarDataUrl, filename);
    setTimeout(() => {
      setDownloading(false);
    }, 500);
  };

  // Handle share - share the generated image
  const handleShare = async () => {
    if (!avatarDataUrl) return;

    try {
      // Convert dataURL to Blob
      const response = await fetch(avatarDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `mirrorthankyou_${user?.displayName || 'guest'}.png`, { type: 'image/png' });

      // Check if Web Share API supports files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mirror Diamond',
          text: 'Nốt sáng của tôi từ Mirror Diamond ✨',
        });
      } else if (navigator.share) {
        // Fallback: share URL if file sharing not supported
        await navigator.share({
          title: 'Mirror Diamond',
          text: 'Nốt sáng của tôi từ Mirror Diamond ✨',
          url: window.location.href,
        });
      } else {
        // Fallback: download image if share not supported
        downloadAvatar(avatarDataUrl, `mirrorthankyou_${user?.displayName || 'guest'}.png`);
      }
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  };

  return (
    <>
      <NavbarV4 logoOnly />
      <div className="choose-note-shape" data-navbar-theme="black">
        {/* Background */}
        <div className="choose-note-shape__bg" />

        {/* Ambient light effect */}
        <div className="flip-card-ambient-light" />

      {/* Main content */}
      <main className="choose-note-shape__main">
        {/* Left arrow - go back */}
        <div className="choose-note-shape__arrow choose-note-shape__arrow--left">
          <button
            className="glass-button glass-button--circle"
            onClick={handleGoBack}
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Center - 3D Flip Card */}
        <div className="choose-note-shape__card-container">
          <div className="flip-card-scene">
            <div
              className={`flip-card-container ${isDraggingVisual ? 'dragging' : ''}`}
              ref={cardContainerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <div className="flip-card" ref={cardRef}>
                {/* Front face */}
                <div className="flip-card-face flip-card-front">
                  <div className="flip-card-shine" ref={shineFrontRef} />
                  <div className="flip-card-texture" />
                  <div className="flip-card-inner">
                    {avatarDataUrl ? (
                      <img src={avatarDataUrl} alt="Generated Card" className="flip-card-image" />
                    ) : (
                      <div className="flip-card-loading">Đang tạo card...</div>
                    )}
                  </div>
                </div>

                {/* Back face */}
                <div className="flip-card-face flip-card-back">
                  <div className="flip-card-shine" ref={shineBackRef} />
                  <div className="flip-card-texture" />
                  <div className="flip-card-inner">
                    <img src={getMediaUrl('dmm/card_back.svg')} alt="Card Back" className="flip-card-image" />
                  </div>
                </div>

                <div className="flip-card-shadow" ref={shadowRef} />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="flip-card-instructions">
            👆 Click để lật thẻ &nbsp;|&nbsp; ✋ Giữ + kéo để xoay
          </div>

          {/* Action buttons below card */}
          <div className="choose-note-shape__actions">
            <button
              className="glass-button glass-button--pill"
              onClick={handleDownload}
              disabled={downloading || !avatarDataUrl}
            >
              <Download size={20} />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
            <button
              className="glass-button glass-button--circle glass-button--small"
              onClick={handleShare}
              aria-label="Share"
            >
              <img src={shareIcon} alt="Share" width={18} height={18} />
            </button>
          </div>

          {/* Status indicator */}
          <div className={`flip-card-status flip-card-status--${status}`}>
            {status === 'dragging' && '✋ ĐANG KÉO'}
            {status === 'front' && '💎 MẶT TRƯỚC'}
            {status === 'back' && '🔥 MẶT SAU'}
          </div>
        </div>

        {/* Right side - Social icons */}
        <div className="choose-note-shape__social">
          <button className="glass-button glass-button--circle glass-button--small" aria-label="Instagram">
            <Instagram size={20} />
          </button>
          <button className="glass-button glass-button--circle glass-button--small" aria-label="Facebook">
            <FacebookIcon size={20} />
          </button>
          <button className="glass-button glass-button--circle glass-button--small" aria-label="TikTok">
            <TikTokIcon size={20} />
          </button>
        </div>
      </main>

      {/* Footer - bottom left */}
      <footer className="choose-note-shape__footer">
        {/* Progress bar 3/3 */}
        <div className="choose-note-shape__progress">
          <div className="choose-note-shape__progress-step choose-note-shape__progress-step--active" />
          <div className="choose-note-shape__progress-step choose-note-shape__progress-step--active" />
          <div className="choose-note-shape__progress-step choose-note-shape__progress-step--active" />
        </div>
        <h3 className="heading-3--no-margin choose-note-shape__subtitle">Choose the note shape</h3>
        <p className="bodytext-6--no-margin choose-note-shape__description">
          cing elit, sed diam nonummy nibut laoreet dolore
          magna aliquam erat volutpat. cing elit, sed diam
          nonummy nibut nibut laoreet dolore magna aliquam
          erat volutpat.
        </p>
      </footer>

      {/* Hidden Avatar Generator - generates card image real-time */}
      <AvatarGenerator
        displayName={user?.displayName || 'Guest'}
        lightNumber={user?.lightNumber || 1}
        diamondShape={SHAPE_NAME_MAP[selectedDiamond] || 'heart'}
        onGenerated={setAvatarDataUrl}
      />
      </div>
    </>
  );
};

export default ChooseNoteShapeScreenNew;
