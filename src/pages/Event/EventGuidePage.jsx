/**
 * EventGuidePage - Landing page for Mirror Diamond Symphony Event
 * Design based on provided mockup
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import { useBottomTheme } from '@/hooks/useBottomTheme';
import NavbarV4 from '@/components/navbar/NavbarV4';
import ShineGlassButton from '@components/common/button/ShineGlassButton';
import GlassThemeButton from '@/components/common/button/GlassThemeButton';
import RippleEffect from '@/components/event/effects/ripple-effect';
import titleSvg from '@/assets/images/icons/title.svg';
import lineSvg from '@/assets/images/dmm/line.svg';
import '@styles/grid-system.css';

import './EventGuidePage.css';

// Note position Y values (middle position = index 3, center of 328px)
const NOTE_POSITION_Y = 164; // Middle line position

// Target date: March 7, 2026
const TARGET_DATE = new Date('2026-03-07T00:00:00');

const EventGuidePage = () => {
  const navigate = useNavigate();
  const { theme: arrowTheme } = useBottomTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [luckyFadePhase, setLuckyFadePhase] = useState('light'); // light, dark
  const musicContentRef = useRef(null);
  const musicSectionRef = useRef(null);
  const rippleRef = useRef(null);
  const staffNoteRef = useRef(null);
  const staffRippleRef = useRef(null);
  const staffSectionRef = useRef(null);
  const avatarSectionRef = useRef(null);
  const luckySectionRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  // Cleanup scroll lock on unmount (prevent stuck scroll lock)
  useEffect(() => {
    return () => {
      // Clear transition timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      // Always restore scroll on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
    };
  }, []);

  // Force scroll to top when step changes to 2
  useEffect(() => {
    if (currentStep === 2) {
      // Multiple attempts to ensure scroll to top on mobile
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Also try after a micro delay
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    }
  }, [currentStep]);

  // Show scroll to top button after scrolling (or always in step 2)
  useEffect(() => {
    const handleScrollButtons = () => {
      // In step 2, always show the button
      // In step 1, show after scrolling 500px
      if (currentStep === 2) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(window.scrollY > 500);
      }
    };
    window.addEventListener('scroll', handleScrollButtons, { passive: true });
    handleScrollButtons();
    return () => window.removeEventListener('scroll', handleScrollButtons);
  }, [currentStep]);

  // Fade effect when scrolling through avatar-lucky wrapper
  useEffect(() => {
    if (currentStep !== 2) return;

    const handleLuckyFade = () => {
      if (!avatarSectionRef.current) return;

      const avatarRect = avatarSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Fade to dark only when avatar section bottom is near middle of viewport
      // (user has scrolled well into the transition area)
      if (avatarRect.bottom <= windowHeight * 0.5) {
        setLuckyFadePhase('dark');
      } else {
        setLuckyFadePhase('light');
      }
    };

    window.addEventListener('scroll', handleLuckyFade, { passive: true });
    handleLuckyFade();
    return () => window.removeEventListener('scroll', handleLuckyFade);
  }, [currentStep]);

  // Hero to Music transition scroll effect with auto-scroll
  useEffect(() => {
    if (currentStep !== 1) return;

    let isAutoScrolling = false;
    let lastScrollProgress = 0;
    let currentPhase = 'hero'; // 'hero' or 'music'

    const handleHeroMusicScroll = () => {
      const wrapper = document.querySelector('.event-guide__hero-music-wrapper');
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const scrollProgress = Math.min(Math.max(-rect.top / window.innerHeight, 0), 1);

      // Update CSS custom properties
      wrapper.style.setProperty('--hero-opacity', String(1 - scrollProgress));
      wrapper.style.setProperty('--music-opacity', String(scrollProgress));
      wrapper.style.setProperty('--hero-pointer', scrollProgress > 0.5 ? 'none' : 'auto');
      wrapper.style.setProperty('--music-pointer', scrollProgress > 0.5 ? 'auto' : 'none');

      if (isAutoScrolling) {
        lastScrollProgress = scrollProgress;
        return;
      }

      const isScrollingDown = scrollProgress > lastScrollProgress;
      const isScrollingUp = scrollProgress < lastScrollProgress;

      // Auto-scroll DOWN to music (when in hero phase and scrolling down)
      if (currentPhase === 'hero' && isScrollingDown && scrollProgress > 0.05 && scrollProgress < 0.95) {
        isAutoScrolling = true;
        currentPhase = 'music';

        const targetScroll = wrapper.offsetTop + window.innerHeight;
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });

        setTimeout(() => {
          isAutoScrolling = false;
        }, 1000);
      }

      // Auto-scroll UP to hero (when in music phase and scrolling up)
      if (currentPhase === 'music' && isScrollingUp && scrollProgress > 0.05 && scrollProgress < 0.95) {
        isAutoScrolling = true;
        currentPhase = 'hero';

        const targetScroll = wrapper.offsetTop;
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });

        setTimeout(() => {
          isAutoScrolling = false;
        }, 1000);
      }

      lastScrollProgress = scrollProgress;
    };

    window.addEventListener('scroll', handleHeroMusicScroll, { passive: true });
    handleHeroMusicScroll();
    return () => window.removeEventListener('scroll', handleHeroMusicScroll);
  }, [currentStep]);

  const handleGetStarted = () => {
    navigate(ROUTES.EVENT_LOGIN, { state: { fromGuide: true } });
  };

  const scrollToContent = () => {
    const section = document.querySelector('.event-guide__about');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  // Countdown timer to March 7, 2026
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const diff = TARGET_DATE - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setCountdown({ days, hours });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Handle transition to step 2 with crossfade animation (triggered by scroll overscroll)
  const handleMusicContentClick = () => {
    if (isTransitioning) return;

    // CRITICAL: Create overlay IMMEDIATELY with vanilla JS - don't wait for React
    const overlay = document.createElement('div');
    overlay.id = 'transition-overlay-instant';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background-color: #F6F6F6;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);

    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Now trigger React state
    setIsTransitioning(true);
    setHasAnimated(true);

    // Change step after short delay
    setTimeout(() => {
      setCurrentStep(2);

      // Fade out overlay
      if (overlay && overlay.parentNode) {
        overlay.style.transition = 'opacity 0.6s ease-out';
        overlay.style.opacity = '0';

        // Remove after fade
        setTimeout(() => {
          if (overlay && overlay.parentNode) {
            overlay.remove();
          }
        }, 600);
      }
    }, 50);

    // Lock scroll for mobile
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0';

    // Unlock scroll after animation
    transitionTimeoutRef.current = setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      setIsTransitioning(false);

      // Ensure at top after render
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 0);
    }, 600);
  };

  // State for back transition (step 2 -> step 1)
  const [isGoingBack, setIsGoingBack] = useState(false);

  // Handle transition back to step 1 (triggered by scroll up at top)
  const handleBackToStep1 = () => {
    if (isTransitioning || isGoingBack) return;

    setIsGoingBack(true);
    window.scrollTo(0, 0);

    // After fade animation completes, change step
    setTimeout(() => {
      setCurrentStep(1);
      setIsGoingBack(false);
    }, 600);
  };

  // Detect scroll up at top of step 2 to go back to step 1
  useEffect(() => {
    if (currentStep !== 2 || isTransitioning || isGoingBack) return;

    let overscrollUpCount = 0;
    let lastWheelTime = 0;

    const handleWheelUp = (e) => {
      const isAtTop = window.scrollY <= 10;
      const isScrollingUp = e.deltaY < 0;

      if (isAtTop && isScrollingUp) {
        const now = Date.now();
        if (now - lastWheelTime >= 400) {
          lastWheelTime = now;
          overscrollUpCount++;

          if (overscrollUpCount >= 3) {
            handleBackToStep1();
          }
        }
      } else if (!isAtTop) {
        overscrollUpCount = 0;
      }
    };

    window.addEventListener('wheel', handleWheelUp, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheelUp);
    };
  }, [currentStep, isTransitioning]);

  // Initialize RippleEffect (without auto-play)
  useEffect(() => {
    if (currentStep === 1 && musicContentRef.current && !rippleRef.current) {
      rippleRef.current = new RippleEffect(musicContentRef.current, {
        autoRippleCount: 6,
        duration: 6000,
        delay: 1000,
        startSize: 500,
        endSize: 1200,
        opacity: 0.65,
        autoPlay: false,
        clickable: false,
        clickRippleCount: 1, // Only 1 ripple per trigger
      });
    }

    return () => {
      if (rippleRef.current && currentStep !== 1) {
        rippleRef.current.destroy();
        rippleRef.current = null;
      }
    };
  }, [currentStep]);

  // Create large ripples on scroll and detect overscroll to trigger transition
  useEffect(() => {
    if (currentStep !== 1 || isTransitioning) return;

    let lastRippleTime = 0;
    const RIPPLE_INTERVAL = 1000; // For normal scroll
    const OVERSCROLL_RIPPLE_INTERVAL = 400; // Faster for overscroll (scroll nhanh = ripple nhanh)
    let overscrollRippleCount = 0;
    let touchStartY = 0;
    let lastScrollY = 0;

    const createLargeRipple = () => {
      if (!musicContentRef.current) return;

      const container = musicContentRef.current;
      let rippleArea = container.querySelector('.ripple-effect-area');

      if (!rippleArea) {
        rippleArea = document.createElement('div');
        rippleArea.className = 'ripple-effect-area';
        container.appendChild(rippleArea);
      }

      const ring = document.createElement('div');
      ring.className = 'ripple-effect-continuous scroll-ripple';
      ring.style.animationIterationCount = '1';
      rippleArea.appendChild(ring);

      setTimeout(() => ring.remove(), 6500);
    };

    // Handle scroll for ripple creation (when not at bottom)
    const handleScroll = () => {
      if (!musicSectionRef.current) return;

      const rect = musicSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isVisible = rect.top < windowHeight && rect.bottom > 0;
      const isAtBottom = rect.bottom <= windowHeight + 50;

      // Only create ripples from scroll when NOT at bottom (overscroll handles bottom)
      if (!isVisible || isAtBottom) return;

      // Throttle ripple creation
      const now = Date.now();
      if (now - lastRippleTime >= RIPPLE_INTERVAL) {
        createLargeRipple();
        lastRippleTime = now;
      }
    };

    // Handle wheel for overscroll detection - create ripple and count (Desktop)
    const handleWheel = (e) => {
      if (!musicSectionRef.current) return;

      const rect = musicSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isVisible = rect.top < windowHeight && rect.bottom > 0;

      // Check if at bottom of music section
      const isAtBottom = rect.bottom <= windowHeight + 50;
      const isScrollingDown = e.deltaY > 0;

      // If at bottom and scrolling down, create ripple and count
      if (isAtBottom && isScrollingDown && isVisible) {
        const now = Date.now();
        // Faster throttle for overscroll - scroll nhanh = ripple nhanh
        if (now - lastRippleTime >= OVERSCROLL_RIPPLE_INTERVAL) {
          createLargeRipple();
          lastRippleTime = now;
          overscrollRippleCount++;

          // Trigger transition after 3 ripples at bottom
          if (overscrollRippleCount >= 3) {
            handleMusicContentClick();
            return;
          }
        }
      } else if (!isAtBottom) {
        overscrollRippleCount = 0; // Reset if not at bottom
      }
    };

    // Handle touch start (Mobile/Tablet)
    const handleTouchStart = (e) => {
      if (isTransitioning) return;
      touchStartY = e.touches[0].clientY;
      lastScrollY = window.scrollY;
    };

    // Handle touch move for overscroll detection (Mobile/Tablet)
    const handleTouchMove = (e) => {
      if (isTransitioning) return;
      if (!musicSectionRef.current) return;

      const rect = musicSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isVisible = rect.top < windowHeight && rect.bottom > 0;

      // Check if at bottom of music section
      const isAtBottom = rect.bottom <= windowHeight + 50;
      const currentY = e.touches[0].clientY;
      const currentScrollY = window.scrollY;
      const isScrollingDown = touchStartY > currentY;

      // Detect overscroll attempt: at bottom, trying to scroll down
      if (isAtBottom && isScrollingDown && isVisible && currentScrollY >= lastScrollY) {
        const now = Date.now();
        if (now - lastRippleTime >= OVERSCROLL_RIPPLE_INTERVAL) {
          createLargeRipple();
          lastRippleTime = now;
          overscrollRippleCount++;

          // Trigger transition after 3 ripples at bottom
          if (overscrollRippleCount >= 3) {
            handleMusicContentClick();
            return;
          }
        }
      } else if (!isAtBottom) {
        overscrollRippleCount = 0; // Reset if not at bottom
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [currentStep, isTransitioning]);

  
  // Initialize RippleEffect on staff note (step 2) - delayed to avoid animation conflicts
  useEffect(() => {
    let timeoutId;

    if (currentStep === 2 && staffNoteRef.current && !staffRippleRef.current) {
      // Delay ripple initialization until after heartGrow animation completes (1.6s)
      timeoutId = setTimeout(() => {
        if (staffNoteRef.current && !staffRippleRef.current) {
          staffRippleRef.current = new RippleEffect(staffNoteRef.current, {
            autoRippleCount: 4,
            duration: 7000,
            delay: 1800,
            startSize: 80,
            endSize: 750,
            opacity: 0.65,
            autoPlay: true,
            clickable: false,
          });
        }
      }, 500); // Wait for animation to stabilize
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (staffRippleRef.current) {
        staffRippleRef.current.destroy();
        staffRippleRef.current = null;
      }
    };
  }, [currentStep]);

  return (
    <>
      <NavbarV4 logoOnly showDmmLogo />

      <div className={`event-guide ${currentStep === 2 ? 'event-guide--step2' : ''} ${isTransitioning ? 'event-guide--transitioning' : ''}`} data-navbar-theme="white">
        {/* Step 2 appears behind during transition */}
        {(currentStep === 2 || isTransitioning || isGoingBack) && (
          <div className={`event-guide__step2 ${hasAnimated ? 'event-guide__step2--animated' : ''} ${isGoingBack ? 'event-guide__step2--fading-out' : ''}`}>
            {/* Music Staff Section */}
            <section ref={staffSectionRef} className="event-guide__staff-section" data-navbar-theme="black">
              <h2 className="event-guide__staff-title heading-2--no-margin">Bạn là một Nốt Sáng</h2>

              {/* Staff with note */}
              <div className="event-guide__staff">
                {/* 5 staff lines */}
                <div className="event-guide__staff-lines">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={lineSvg}
                      alt=""
                      className="event-guide__staff-line"
                    />
                  ))}
                </div>

                {/* Heart note in center */}
                <div
                  ref={staffNoteRef}
                  className="event-guide__staff-note"
                  style={{ top: `${NOTE_POSITION_Y}px` }}
                >
                  <img
                    src={getMediaUrl('mirror_DMM/HEART-01.webp')}
                    alt="Heart note"
                    className="event-guide__staff-heart"
                  />
                </div>
              </div>

              <p className="event-guide__staff-description bodytext-6--no-margin">
                Giữa bản nhạc Love-Grown, <br />mỗi người hiện diện như một Nốt Sáng, <br />một nguồn cảm hứng giúp giai điệu được hoàn thiện. <br />Và mở lối cho hành trình đa giác quan được đánh thức...
              </p>
            </section>

            {/* Avatar + Lucky Wrapper for smooth fade transition */}
            <div
              ref={luckySectionRef}
              className={`event-guide__avatar-lucky-wrapper event-guide__avatar-lucky-wrapper--${luckyFadePhase}`}
              data-navbar-theme={luckyFadePhase === 'dark' ? 'white' : 'black'}
            >
              {/* Avatar Card Section with Scattered Cards */}
              <section
                ref={avatarSectionRef}
                className="event-guide__avatar-section"
              >
                {/* Scattered Cards */}
                <div className="event-guide__cards-scattered">
                  <div className="event-guide__card event-guide__card--1" />
                  <div className="event-guide__card event-guide__card--2" />
                  <div className="event-guide__card event-guide__card--3" />
                  <div className="event-guide__card event-guide__card--4" />
                  <div className="event-guide__card event-guide__card--5" />
                  <div className="event-guide__card event-guide__card--6" />
                  <div className="event-guide__card event-guide__card--7" />
                  <div className="event-guide__card event-guide__card--8" />
                  <div className="event-guide__card event-guide__card--9" />
                  <div className="event-guide__card event-guide__card--10" />
                  <div className="event-guide__card event-guide__card--11" />
                  <div className="event-guide__card event-guide__card--12" />
                  <div className="event-guide__card event-guide__card--13" />
                  <div className="event-guide__card event-guide__card--14" />
                  <div className="event-guide__card event-guide__card--15" />
                  <div className="event-guide__card event-guide__card--16" />
                </div>

                {/* Center Content */}
                <div className="event-guide__avatar-content">
                  <h2 className="event-guide__avatar-title heading-2--no-margin">
                    Một phiên bản avatar khác biệt
                  </h2>
                  <p className="event-guide__avatar-text bodytext-6--no-margin">
                    Từ lựa chọn của bạn, một avatar riêng biệt mang tên bạn sẽ được tạo ra, một món quà phản chiếu dấu ấn cá nhân và ghi lại khoảnh khắc bạn hiện diện trong thế giới quan của Her Concert.
                  </p>
                  <ShineGlassButton theme="light" onClick={handleGetStarted}>
                    Bắt đầu hành trình
                  </ShineGlassButton>
                </div>
              </section>

              {/* Lucky Moment Section */}
              <section className="event-guide__lucky-section">
                <h2 className="event-guide__lucky-title heading-2--no-margin">
                  Khoảnh khắc <br /> Nốt sáng được gọi tên
                </h2>
                <p className="event-guide__lucky-text bodytext-6--no-margin">
                  Giữa bản nhạc, một khoảnh khắc được gọi tên trong đêm “Her concert”.
Chiếc nhẫn kim cương xuất hiện như một biểu tượng của tình yêu được âm nhạc dẫn lối, tìm đến nguồn cảm hứng, để bản nhạc ấy cất thành lời.
                </p>
                <div className="event-guide__lucky-btn">
                  <ShineGlassButton theme="footer" onClick={handleGetStarted}>
                    Tham gia lucky draw
                  </ShineGlassButton>
                </div>

                {/* Bottom row: Stats + Diamond Ring (3 columns) */}
                <div className="event-guide__lucky-bottom">
                  <div className="event-guide__lucky-stat">
                    <span className="event-guide__lucky-number">{countdown.days}</span>
                    <span className="event-guide__lucky-label bodytext-6--no-margin">Ngày</span>
                  </div>

                  <div className="event-guide__lucky-ring">
                    <video
                      src={getMediaUrl('mirror_DMM/nhan-lucky-draw.webm')}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="event-guide__lucky-ring-img"
                      onLoadedMetadata={(e) => { e.target.playbackRate = 0.25; }}
                    />
                  </div>

                  <div className="event-guide__lucky-stat">
                    <span className="event-guide__lucky-number">{countdown.hours}</span>
                    <span className="event-guide__lucky-label bodytext-6--no-margin">Giờ</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Step 1: Hero + Music Reflection - Sticky Scroll */}
        {(currentStep === 1 || isGoingBack) && (
          <div
            ref={musicSectionRef}
            className={`event-guide__step1 ${isGoingBack ? 'event-guide__step1--fading-in' : ''}`}
          >
            <div className="event-guide__hero-music-wrapper">
              {/* Background layers */}
              <div className="event-guide__bg event-guide__bg--hero"></div>
              <div className="event-guide__bg event-guide__bg--music"></div>

              {/* Sticky content container */}
              <div className="event-guide__sticky-container">
                {/* Title image - always visible */}
                <div className="event-guide__title-wrapper">
                  <img
                    src={titleSvg}
                    alt="The Sound of Love Grown"
                    className="event-guide__title-img"
                  />
                </div>

                {/* Hero content - fades out on scroll */}
                <div className="event-guide__hero-content">
                  {/* Sparkles */}
                  <span className="event-guide__sparkle event-guide__sparkle--1"></span>
                  <span className="event-guide__sparkle event-guide__sparkle--2"></span>
                  <span className="event-guide__sparkle event-guide__sparkle--3"></span>
                  <span className="event-guide__sparkle event-guide__sparkle--4"></span>
                  <span className="event-guide__sparkle event-guide__sparkle--5"></span>

                  <div className="event-guide__hero-cta">
                    <GlassThemeButton theme="spec_dark" onClick={handleGetStarted}>
                      Bắt đầu hành trình
                    </GlassThemeButton>
                  </div>

                  <div className="event-guide__hero-bottom">
                    <GlassThemeButton theme="dark" onClick={scrollToContent} icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 18" fill="none">
                        <path d="M7.91964 0.750001L7.91964 16.75M7.91964 16.75L1.0625 9.89286M7.91964 16.75L14.7768 9.89286" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    } />
                  </div>
                </div>

                {/* Music content - fades in on scroll */}
                <div
                  ref={musicContentRef}
                  className={`event-guide__music-content ${isTransitioning ? 'event-guide__music-content--transitioning' : ''}`}
                >
                  <p className="event-guide__music-label event-guide__music-label--left bodytext-6--no-margin">
                    DỐC MỘNG MƠ<br />X<br />MIRROR
                  </p>
                  <p className="event-guide__music-label event-guide__music-label--right bodytext-6--no-margin">
                    CHO<br />SỰ KIỆN<br />HER CONCERT
                  </p>
                  <p className="event-guide__music-text bodytext-6--no-margin">
                    Một hành trình đa giác quan được khơi nguồn từ âm nhạc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`fixed-scroll-top-container ${showScrollTop ? 'visible' : ''}`}>
          <GlassThemeButton
            theme={arrowTheme === "white" ? "dark" : "light"}
            icon="arrow-up"
            onClick={() => {
              if (currentStep === 2) {
                handleBackToStep1();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        </div>
      </div>
    </>
  );
};

export default EventGuidePage;
