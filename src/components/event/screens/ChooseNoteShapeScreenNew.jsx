/**
 * ChooseNoteShapeScreenNew - Step 3: Preview card with 3D flip effect
 * Shows a 3D flip card with front (generated image) and back (card back)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';
import AvatarGenerator, { downloadAvatar } from '@/components/event/ui/AvatarGenerator';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import NavbarV4 from '@/components/navbar/NavbarV4';
import GlassThemeButton from '@/components/common/button/GlassThemeButton';

// Mapping from shape ID (h1, h2...) to diamondShape name for AvatarGenerator
// Must match keys in AvatarGenerator's DIAMONDS object:
// heart, round, emerald, marquise, oval, pear, cushion
const SHAPE_NAME_MAP = {
  // Shape IDs
  h1: 'heart',
  h2: 'oval',
  h3: 'round',
  h4: 'pear',
  h5: 'cushion',
  h6: 'emerald',
  h7: 'marquise',
  // Legacy names (passthrough)
  heart: 'heart',
  oval: 'oval',
  round: 'round',
  pear: 'pear',
  cushion: 'cushion',
  emerald: 'emerald',
  marquise: 'marquise',
};

// Custom gradient for ripple effect (lighter pink)
const RIPPLE_GRADIENT = `radial-gradient(50% 50% at 50% 50%, #F4A5B8 0%, rgba(185, 185, 185, 0.00) 54.33%, #FFF 93.27%, rgba(255, 255, 255, 0.00) 100%)`;

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

  // Flip card state - start with back face
  const [isFlipping, setIsFlipping] = useState(false);
  const [isShowingFront, setIsShowingFront] = useState(false);
  const [status, setStatus] = useState('back');
  const [isDraggingVisual, setIsDraggingVisual] = useState(false);

  // Use refs for values that need to be accessed in event listeners (avoid closure issues)
  const isDraggingRef = useRef(false);
  const isFlippingRef = useRef(false);
  const currentRotation = useRef(180); // Start at back face
  const velocity = useRef(0);
  const targetRotation = useRef(180); // Start at back face
  const animationId = useRef(null);
  const dragHistory = useRef([]);
  const dragLastX = useRef(0);
  const mouseDownTime = useRef(0);
  const mouseDownX = useRef(0);
  const isShowingFrontRef = useRef(false); // Start with back face

  // Physics
  const friction = 0.92;
  const snapStrength = 0.15;

  const {
    user,
    selectedDiamond,
    generatedAvatarUrl,
    generatedForShape,
    setGeneratedAvatar,
  } = useEventStore();

  // Get current shape name
  const currentShape = SHAPE_NAME_MAP[selectedDiamond] || 'heart';

  // Use avatar from store if it matches current shape, otherwise use local state as fallback
  const [localAvatarUrl, setLocalAvatarUrl] = useState('');
  const avatarDataUrl = (generatedForShape === currentShape && generatedAvatarUrl)
    ? generatedAvatarUrl
    : localAvatarUrl;

  // Check if we need to generate (fallback if pre-generation didn't complete)
  const shouldGenerateAvatar = !avatarDataUrl;

  // Callback when avatar is generated (fallback)
  const handleAvatarGenerated = (dataUrl) => {
    setLocalAvatarUrl(dataUrl);
    // Also save to store for consistency
    setGeneratedAvatar(dataUrl, currentShape);
  };

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

  // Snap to nearest 180 degree (front or back face)
  const findNearestRestAngle = useCallback((angle) => {
    return Math.round(angle / 180) * 180;
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

  // Track if animation is at rest to skip unnecessary updates
  const isAtRest = useRef(false);
  const lastRotation = useRef(180);

  // Animation loop
  const animate = useCallback(() => {
    if (!isDraggingRef.current && !isFlippingRef.current) {
      let needsUpdate = false;

      if (Math.abs(velocity.current) > 0.1) {
        velocity.current *= friction;
        currentRotation.current += velocity.current;
        const remainingDistance = velocity.current / (1 - friction);
        const predictedEnd = currentRotation.current + remainingDistance;
        targetRotation.current = findNearestRestAngle(predictedEnd);
        needsUpdate = true;
        isAtRest.current = false;
      } else {
        velocity.current = 0;
        const diff = targetRotation.current - currentRotation.current;
        if (Math.abs(diff) > 0.5) {
          // Smooth easing to target
          currentRotation.current += diff * snapStrength;
          needsUpdate = true;
          isAtRest.current = false;
        } else if (!isAtRest.current) {
          // Snap directly when close enough (only once)
          currentRotation.current = targetRotation.current;
          needsUpdate = true;
          isAtRest.current = true;

          // Update front/back state based on final position
          const normalizedRotation = ((currentRotation.current % 360) + 360) % 360;
          const nowShowingFront = normalizedRotation < 90 || normalizedRotation > 270;
          if (nowShowingFront !== isShowingFrontRef.current) {
            isShowingFrontRef.current = nowShowingFront;
            setIsShowingFront(nowShowingFront);
            setStatus(nowShowingFront ? 'front' : 'back');
          }
        }
      }

      // Only update DOM when something changed
      if (needsUpdate && lastRotation.current !== currentRotation.current) {
        lastRotation.current = currentRotation.current;
        if (cardRef.current) {
          cardRef.current.style.transform = `rotateY(${currentRotation.current}deg)`;
        }
        updateShine(currentRotation.current);
        updateShadow(currentRotation.current);
      }
    }

    animationId.current = requestAnimationFrame(animate);
  }, [findNearestRestAngle, updateShine, updateShadow]);

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
    isAtRest.current = false; // Reset for after flip completes
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
        lastRotation.current = newRotation;
        isAtRest.current = true; // Card is now at rest after flip
        cardRef.current.style.transform = `rotateY(${newRotation}deg)`;
      }
    }, 400);
  }, []);

  // Drag handlers
  const startDrag = useCallback((clientX) => {
    if (isFlippingRef.current) return;

    isDraggingRef.current = true;
    isAtRest.current = false; // Reset so animation updates resume
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
    targetRotation.current = findNearestRestAngle(predictedEnd);

    // Check for click (short press without much movement)
    const clickDistance = Math.abs(clientX - mouseDownX.current);
    const clickDuration = Date.now() - mouseDownTime.current;
    if (clickDistance < 10 && clickDuration < 300) {
      flipCard();
    }
  }, [calculateReleaseVelocity, findNearestRestAngle, flipCard]);

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
      <div className="your-wallpaper" data-navbar-theme="black">
        {/* Background */}
        <div className="your-wallpaper__bg" />

        {/* Header - Title and description at top left */}
        <header className="your-wallpaper__header">
          <h2 className="heading-2--no-margin your-wallpaper__title">Khi giai điệu thành hình</h2>
          <p className="bodytext-6--no-margin your-wallpaper__description">
            Từ đây, MIRROR đã phát triển avatar phản chiếu Nốt Sáng, giai điệu và dấu ấn cá nhân của bạn.
            Bạn có thể tải và chia sẻ khoảnh khắc hiện diện này.
          </p>
        </header>

        {/* Main content - Card preview */}
        <main className="your-wallpaper__main">
          {/* Card container */}
          <div className="your-wallpaper__card-container">
            <div className="flip-card-scene">
              <div
                className={`flip-card-container ${isDraggingVisual ? 'dragging' : ''}`}
                ref={cardContainerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div className="flip-card" ref={cardRef} style={{ transform: 'rotateY(180deg)' }}>
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

            {/* Hint text below card */}
            <p className="your-wallpaper__hint bodytext-6--no-margin">
              {isShowingFront ? 'Giữ và kéo để xoay avatar của bạn' : 'Chạm để khám phá avatar của bạn'}
            </p>

            {/* Action buttons below card - Download + Share */}
            <div className="your-wallpaper__actions">
              <GlassThemeButton
                theme="light"
                onClick={handleDownload}
                className={downloading || !avatarDataUrl ? 'disabled' : ''}
              >
                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 14.9856C0.854118 15.315 1.33441 15.5 1.83521 15.5H13.1648C13.6656 15.5 14.1459 15.315 14.5 14.9856M7.50105 0.5V10.4521M7.50105 10.4521L11.8171 6.64941M7.50105 10.4521L3.18502 6.64941" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {downloading ? 'Đang tải...' : 'Tải xuống'}
              </GlassThemeButton>
              <GlassThemeButton
                theme="light"
                onClick={handleShare}
                icon={<img src={getMediaUrl('dmm/icons/share-icon.svg')} alt="Share" width={18} height={18} />}
              />
            </div>
          </div>
        </main>

        {/* Arrow buttons - fixed position like other pages */}
        <div className="your-wallpaper__arrow your-wallpaper__arrow--left">
          <GlassThemeButton theme="light" onClick={handleGoBack} icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M12.7187 5.70703L0.71875 5.70703M0.71875 5.70703L5.86161 0.707031M0.71875 5.70703L5.86161 10.707" stroke="currentColor" strokeLinecap="square"/>
            </svg>
          } />
        </div>
        <div className="your-wallpaper__arrow your-wallpaper__arrow--right">
          <GlassThemeButton theme="light" onClick={() => navigate(ROUTES.EVENT_THANKYOU)} icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M0.5 5.70703L12.5 5.70703M12.5 5.70703L7.35714 10.707M12.5 5.70703L7.35714 0.707031" stroke="currentColor" strokeLinecap="square"/>
            </svg>
          } />
        </div>

        {/* Footer - actions on tablet/mobile */}
        <footer className="your-wallpaper__footer">
          <div className="your-wallpaper__footer-actions">
            <GlassThemeButton
              theme="light"
              onClick={handleDownload}
              className={downloading || !avatarDataUrl ? 'disabled' : ''}
            >
              <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 14.9856C0.854118 15.315 1.33441 15.5 1.83521 15.5H13.1648C13.6656 15.5 14.1459 15.315 14.5 14.9856M7.50105 0.5V10.4521M7.50105 10.4521L11.8171 6.64941M7.50105 10.4521L3.18502 6.64941" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {downloading ? 'Đang tải...' : 'Tải xuống'}
            </GlassThemeButton>
            <GlassThemeButton
              theme="light"
              onClick={handleShare}
              icon={<img src={getMediaUrl('dmm/icons/share-icon.svg')} alt="Share" width={18} height={18} />}
            />
          </div>
        </footer>

        {/* Hidden Avatar Generator - fallback if pre-generation didn't complete */}
        {shouldGenerateAvatar && (
          <AvatarGenerator
            displayName={user?.displayName || 'Guest'}
            lightNumber={user?.lightNumber || 1}
            diamondShape={currentShape}
            onGenerated={handleAvatarGenerated}
            delay={500}
          />
        )}
      </div>
    </>
  );
};

export default ChooseNoteShapeScreenNew;
