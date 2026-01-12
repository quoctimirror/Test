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
import '@styles/grid-system.css';

import './EventGuidePage.css';

// Note position Y values (middle position = index 3, center of 328px)
const NOTE_POSITION_Y = 164; // Middle line position

// Target date: March 7, 2026
const TARGET_DATE = new Date('2026-03-07T00:00:00');

// Sound wave icon component (same as old SoundButton)
const SoundWaveIcon = ({ isActive }) => (
  <div className="sound-wave-container">
    <svg
      className={`sound-wave-svg ${isActive ? 'active' : ''}`}
      width="120"
      height="24"
      viewBox="0 0 120 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Straight line - visible when inactive */}
      <path
        className={`wave-path-straight ${!isActive ? 'visible' : ''}`}
        d="M0 12 L120 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Long flowing wave - visible when active */}
      <g className={`wave-group ${isActive ? 'visible' : ''}`}>
        <path
          className="wave-path-flowing"
          d="M-20 12 Q-15 4, -10 12 Q-5 20, 0 12 Q5 4, 10 12 Q15 20, 20 12 Q25 4, 30 12 Q35 20, 40 12 Q45 4, 50 12 Q55 20, 60 12 Q65 4, 70 12 Q75 20, 80 12 Q85 4, 90 12 Q95 20, 100 12 Q105 4, 110 12 Q115 20, 120 12 Q125 4, 130 12 Q135 20, 140 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  </div>
);

const EventGuidePage = () => {
  const navigate = useNavigate();
  const { theme: arrowTheme } = useBottomTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSoundActive, setIsSoundActive] = useState(false);
  const musicContentRef = useRef(null);
  const musicSectionRef = useRef(null);
  const rippleRef = useRef(null);
  const staffNoteRef = useRef(null);
  const staffRippleRef = useRef(null);
  const staffSectionRef = useRef(null);
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

  // Show scroll to top button after scrolling
  useEffect(() => {
    const handleScrollButtons = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScrollButtons, { passive: true });
    handleScrollButtons();
    return () => window.removeEventListener('scroll', handleScrollButtons);
  }, []);

  const handleGetStarted = () => {
    navigate(ROUTES.EVENT_LOGIN);
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

    setIsTransitioning(true);
    setHasAnimated(true);

    // Force scroll to top immediately - use old syntax for mobile compatibility
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Lock scroll for mobile (simpler approach)
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0';

    // Switch to step 2 and unlock scroll after short animation
    transitionTimeoutRef.current = setTimeout(() => {
      // Re-enable scrolling BEFORE changing step (prevents jump)
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      // Change step
      setCurrentStep(2);
      setIsTransitioning(false);

      // Ensure at top after render
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 0);
    }, 600); // Further reduced to 600ms
  };

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
            autoRippleCount: 6,
            duration: 5000,
            delay: 900,
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

      <div className={`event-guide ${currentStep === 2 ? 'event-guide--step2' : ''} ${isTransitioning ? 'event-guide--transitioning' : ''}`} data-navbar-theme="black">
        {/* Step 2 appears behind during transition */}
        {(currentStep === 2 || isTransitioning) && (
          <div className={`event-guide__step2 ${hasAnimated ? 'event-guide__step2--animated' : ''}`}>
            {/* Music Staff Section */}
            <section ref={staffSectionRef} className="event-guide__staff-section" data-navbar-theme="black">
              <h2 className="event-guide__staff-title heading-2--no-margin">Nơi Nốt Nhạc<br />Đồng Điệu</h2>

              {/* Staff with note */}
              <div className="event-guide__staff">
                {/* 5 staff lines */}
                <div className="event-guide__staff-lines">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={getMediaUrl('dmm/Rectangle 4200.svg')}
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
                    src={getMediaUrl('dmm/heart.svg')}
                    alt="Heart note"
                    className="event-guide__staff-heart"
                  />
                </div>
              </div>

              <p className="event-guide__staff-description bodytext-6--no-margin">
                Bạn ở đây, một Nốt Sáng. <br />Nguồn cảm hứng hoàn thiện bản nhạc<br /> và mở lối cho hành trình đa giác quan được đánh thức.
              </p>
            </section>

            {/* Avatar Card Section with Scattered Cards */}
            <section className="event-guide__avatar-section" data-navbar-theme="black">
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
                  Your One-and-<br />Only Avatar<br />Card
                </h2>
                <p className="event-guide__avatar-text bodytext-6--no-margin">
                  Từ lựa chọn của bạn, MIRROR tạo nên một avatar riêng biệt mang tên bạn, phản chiếu dấu ấn cá nhân và ghi lại khoảnh khắc bạn hiện diện trong thế giới quan của MIRROR.
                </p>
                <ShineGlassButton theme="light" onClick={handleGetStarted}>
                  Bắt đầu
                </ShineGlassButton>
              </div>
            </section>

            {/* Lucky Moment Section */}
            <section className="event-guide__lucky-section" data-navbar-theme="white">
              <h2 className="event-guide__lucky-title heading-2--no-margin">
                Khoảnh Khắc Sáng Được Gọi Tên
              </h2>
              <p className="event-guide__lucky-text bodytext-6--no-margin">
                Giữa bản nhạc, một khoảnh khắc được gọi tên.<br />
                Chiếc nhẫn kim cương từ MIRROR xuất hiện như một biểu tượng của tình<br />
                yêu được âm nhạc dẫn lối, tìm đến nguồn cảm hứng, để bản nhạc ấy cất<br />
                thành lời.
              </p>
              <ShineGlassButton theme="footer" onClick={handleGetStarted}>
                Khoảnh khắc ấy dành cho bạn
              </ShineGlassButton>

              {/* Bottom row: Stats + Diamond Ring (3 columns) */}
              <div className="event-guide__lucky-bottom">
                <div className="event-guide__lucky-stat">
                  <span className="event-guide__lucky-number">{countdown.days}</span>
                  <span className="event-guide__lucky-label bodytext-6--no-margin">Ngày</span>
                </div>

                <div className="event-guide__lucky-ring">
                  <img
                    src={getMediaUrl('mirror_DMM/diamond-ring.webp')}
                    alt="Diamond Ring"
                    className="event-guide__lucky-ring-img"
                  />
                </div>

                <div className="event-guide__lucky-stat">
                  <span className="event-guide__lucky-number">{countdown.hours}</span>
                  <span className="event-guide__lucky-label bodytext-6--no-margin">Tiếng</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Step 1: Hero + Music Reflection - on top, fades out */}
        {(currentStep === 1 || isTransitioning) && (
          <div className={`event-guide__step1 ${isTransitioning ? 'event-guide__step1--fading' : ''}`}>
            {/* Hero Section */}
            <section className="event-guide__hero" data-navbar-theme="white">
              <div className="event-guide__hero-content">
                <div className="event-guide__hero-title-wrapper">
                  <img
                    src={titleSvg}
                    alt="The Sound of Love Grown"
                    className="event-guide__hero-title-img"
                  />
                  {/* Sparkles */}
                  <span className="event-guide__sparkle event-guide__sparkle--1"></span>
                  <span className="event-guide__sparkle event-guide__sparkle--2"></span>
                  <span className="event-guide__sparkle event-guide__sparkle--3"></span>
                  <span className="event-guide__sparkle event-guide__sparkle--4"></span>
                  <span className="event-guide__sparkle event-guide__sparkle--5"></span>
                </div>
              </div>

              <div className="event-guide__hero-bottom">
                <ShineGlassButton theme="footer" onClick={handleGetStarted}>
                  Bắt đầu
                </ShineGlassButton>

                <div className="event-guide__hero-right" onClick={scrollToContent}>
                  <span>Hoặc kéo xuống để xem thêm</span>
                </div>
              </div>
            </section>

            {/* Music Reflection Section */}
            <section ref={musicSectionRef} className="event-guide__music" data-navbar-theme="black">
              {/* Content with Ripple Effect - Scroll to transition */}
              <div
                ref={musicContentRef}
                className={`event-guide__music-content ${isTransitioning ? 'event-guide__music-content--transitioning' : ''}`}
              >
                <h2 className="event-guide__music-title heading-2--no-margin">Nơi Nốt Nhạc Đồng Điệu</h2>
                <p className="event-guide__music-text bodytext-6--no-margin">
                  Dốc Mộng Mơ × MIRROR cùng gặp nhau ở những giá trị chung về cảm xúc và vẻ đẹp. Sự hợp tác mở ra một trải nghiệm nơi âm nhạc, ánh sáng và công nghệ hòa quyện, để khán giả không chỉ lắng nghe, mà trở thành một phần của câu chuyện trong thế giới quan của MIRROR.
<br />Trong hành trình này, Dốc Mộng Mơ đồng hành cùng MIRROR với vai trò sensory partner về âm thanh nơi mỗi nốt nhạc được dẫn dắt để chạm đến cảm xúc, và cùng nhau hoàn thiện trải nghiệm đa giác quan.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>

      <div className={`fixed-scroll-top-container ${showScrollTop ? 'visible' : ''}`}>
        <GlassThemeButton
          theme={arrowTheme === "white" ? "dark" : "light"}
          icon="arrow-up"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      </div>
      <div className="fixed-sound-container">
        <GlassThemeButton
          theme={arrowTheme === "white" ? "dark" : "light"}
          icon={<SoundWaveIcon isActive={isSoundActive} />}
          isCollapsed={true}
          onClick={() => setIsSoundActive(!isSoundActive)}
        >
          {isSoundActive ? "Background music on" : "Background music off"}
        </GlassThemeButton>
      </div>
    </>
  );
};

export default EventGuidePage;
