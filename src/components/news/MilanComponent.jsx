import React, { useEffect, useRef } from "react";
import "./MilanComponent.css";
import "@styles/grid-system.css";
import ArrowButton from "@components/common/button/ArrowButton";
import MediaImage from "@components/common/media/MediaImage";

const MilanComponent = () => {
  const heroRef = useRef(null);
  const backgroundLayerRef = useRef(null);
  const isScrolling = useRef(false);
  const carouselRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isLooping = useRef(false);
  const targetScrollLeft = useRef(0);
  const animationFrameId = useRef(null);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const isArrowScrolling = useRef(false);

  // Refs cho large carousel
  const largeCarouselRef = useRef(null);
  const isLargeDragging = useRef(false);
  const largeStartX = useRef(0);
  const largeScrollLeft = useRef(0);
  const isLargeLooping = useRef(false);
  const largeTargetScrollLeft = useRef(0);
  const largeAnimationFrameId = useRef(null);
  const largeVelocity = useRef(0);
  const largeLastX = useRef(0);
  const largeLastTime = useRef(0);
  const isLargeArrowScrolling = useRef(false);

  useEffect(() => {
    let scrollTimeout;
    let lastScrollPosition = 0;

    const smoothScrollTo = (targetPosition, duration = 800) => {
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let start = null;

      const animation = (currentTime) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function for smooth acceleration/deceleration
        const easeInOutCubic =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * easeInOutCubic);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          isScrolling.current = false;
        }
      };

      requestAnimationFrame(animation);
    };

    const handleScroll = () => {
      // Skip scroll handling when body is fixed (menu is open)
      if (document.body.style.position === 'fixed') {
        return;
      }

      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const scrollDirection = scrolled > lastScrollPosition ? "down" : "up";
      const isDesktop = window.innerWidth > 1024;

      // Fade effect for hero (only on desktop)
      if (heroRef.current && isDesktop) {
        const opacity = Math.max(0, 1 - scrolled / (windowHeight * 0.7)); // Fade nhanh hơn cho sync với 700ms
        const scale = 1 - (scrolled / windowHeight) * 0.08; // Scale nhẹ hơn

        heroRef.current.style.opacity = opacity;
        heroRef.current.style.transform = `scale(${scale})`;
        // Use pointer-events instead of visibility to not affect theme detection
        heroRef.current.style.pointerEvents = scrolled >= windowHeight ? 'none' : 'auto';

        // Keep background layer visible ONLY when in hero section to block footer
        if (backgroundLayerRef.current) {
          // Show background when we're in hero section (scroll < 100vh)
          // Hide when scrolled past hero to let article show
          if (scrolled < windowHeight) {
            backgroundLayerRef.current.style.display = 'block';
          } else {
            backgroundLayerRef.current.style.display = 'none';
          }
        }
      }

      // Auto-scroll effects only on desktop
      if (isDesktop) {
        // Auto-scroll DOWN to article when user scrolls down just a little
        if (
          !isScrolling.current &&
          scrollDirection === "down" &&
          scrolled > 30 &&
          scrolled < windowHeight * 0.5
        ) {
          isScrolling.current = true;
          smoothScrollTo(windowHeight, 700); // Article trượt lên trong 1 giây
        }

        // Auto-scroll UP to hero when user scrolls up just a little
        if (
          !isScrolling.current &&
          scrollDirection === "up" &&
          scrolled < windowHeight &&
          scrolled > windowHeight * 0.5
        ) {
          isScrolling.current = true;
          smoothScrollTo(0, 700); // Quay về hero trong 0.8 giây
        }
      }

      // Update last scroll position
      lastScrollPosition = scrolled;

      // Clear timeout
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Carousel drag-to-scroll functionality with infinite loop
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Smooth scroll animation với momentum và quán tính
    const smoothScroll = () => {
      const current = carousel.scrollLeft;
      const target = targetScrollLeft.current;
      const diff = target - current;

      if (isDragging.current) {
        // Khi đang drag: smooth với quán tính (lerp)
        if (Math.abs(diff) > 0.1) {
          carousel.scrollLeft = current + diff * 0.25; // Quán tính khi kéo
          animationFrameId.current = requestAnimationFrame(smoothScroll);
        } else {
          carousel.scrollLeft = target;
          animationFrameId.current = requestAnimationFrame(smoothScroll);
        }
      } else {
        // Khi thả: apply momentum với friction
        if (Math.abs(velocity.current) > 0.5) {
          carousel.scrollLeft = current + velocity.current;
          velocity.current *= 0.94; // Friction/deceleration
          animationFrameId.current = requestAnimationFrame(smoothScroll);
        } else {
          // Dừng animation
          velocity.current = 0;
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
          }
          checkLoop();
        }
      }
    };

    const handleMouseDown = (e) => {
      // Stop any ongoing animation
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }

      isDragging.current = true;
      carousel.style.cursor = "grabbing";
      carousel.style.scrollBehavior = "auto";
      startX.current = e.pageX;
      scrollLeft.current = carousel.scrollLeft;
      targetScrollLeft.current = carousel.scrollLeft;
      velocity.current = 0; // Reset velocity
      lastX.current = e.pageX;
      lastTime.current = Date.now();

      // Start fresh animation loop
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseLeave = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      carousel.style.cursor = "grab";
      // Sync target với current position để tránh snap back
      targetScrollLeft.current = carousel.scrollLeft;
      // Keep animation running for momentum
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      carousel.style.cursor = "grab";
      // Sync target với current position để tránh snap back
      targetScrollLeft.current = carousel.scrollLeft;
      // Keep animation running for momentum
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();

      const currentX = e.pageX;
      const currentTime = Date.now();
      const deltaX = currentX - lastX.current;
      const deltaTime = currentTime - lastTime.current;

      // Calculate velocity cho momentum (đảo dấu để match hướng scroll)
      if (deltaTime > 0) {
        velocity.current = -(deltaX / deltaTime) * 8; // Negative để đúng hướng
      }

      const walk = (currentX - startX.current) * 1.2;
      targetScrollLeft.current = scrollLeft.current - walk;

      lastX.current = currentX;
      lastTime.current = currentTime;
    };

    // Infinite loop với smooth repositioning (không jump)
    const checkLoop = () => {
      if (isLooping.current || isDragging.current) return;

      const scrollWidth = carousel.scrollWidth;
      const currentScroll = carousel.scrollLeft;
      const clientWidth = carousel.clientWidth;

      const items = carousel.querySelectorAll(".milan-carousel-item");
      if (!items.length) return;

      const itemWidth = items[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
      const itemWithGap = itemWidth + gap;
      const setSize = itemWithGap * 4; // 4 items per set

      // Tăng threshold lên để trigger sớm hơn
      const threshold = setSize * 2; // 2 sets = 8 items

      // Nếu scroll về gần đầu, reposition về giữa
      if (currentScroll < threshold) {
        isLooping.current = true;
        velocity.current = 0; // Stop momentum
        carousel.style.scrollBehavior = "auto"; // Instant jump
        carousel.scrollLeft = currentScroll + setSize * 3; // Jump 3 sets
        targetScrollLeft.current = carousel.scrollLeft;
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
          isLooping.current = false;
        }, 50);
        return;
      }

      // Nếu scroll về gần cuối, reposition về giữa
      const maxScroll = scrollWidth - clientWidth;
      if (currentScroll > maxScroll - threshold) {
        isLooping.current = true;
        velocity.current = 0; // Stop momentum
        carousel.style.scrollBehavior = "auto"; // Instant jump
        carousel.scrollLeft = currentScroll - setSize * 3; // Jump 3 sets
        targetScrollLeft.current = carousel.scrollLeft;
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
          isLooping.current = false;
        }, 50);
        return;
      }
    };

    const handleScroll = () => {
      // Không check loop khi đang drag, looping, hoặc arrow scrolling
      if (
        !isDragging.current &&
        !isLooping.current &&
        !isArrowScrolling.current
      ) {
        checkLoop();
      }
    };

    carousel.addEventListener("mousedown", handleMouseDown);
    carousel.addEventListener("mouseleave", handleMouseLeave);
    carousel.addEventListener("mouseup", handleMouseUp);
    carousel.addEventListener("mousemove", handleMouseMove);
    carousel.addEventListener("scroll", handleScroll);

    // Set initial position ở giữa để có thể scroll cả 2 hướng
    setTimeout(() => {
      const items = carousel.querySelectorAll(".milan-carousel-item");
      if (items.length) {
        const itemWidth = items[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
        const setSize = (itemWidth + gap) * 4;

        // Disable scroll behavior temporarily
        carousel.style.scrollBehavior = "auto";

        // Center ảnh đầu tiên: vị trí giữa buffer - offset để center
        const viewportWidth = window.innerWidth;
        carousel.scrollLeft = setSize * 5 - (viewportWidth - itemWidth) / 2;

        // Reset all animation states
        velocity.current = 0;
        isDragging.current = false;
        isLooping.current = false;
        isArrowScrolling.current = false;
        targetScrollLeft.current = carousel.scrollLeft;

        // Re-enable smooth scroll
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
        }, 50);
      }
    }, 100);

    return () => {
      carousel.removeEventListener("mousedown", handleMouseDown);
      carousel.removeEventListener("mouseleave", handleMouseLeave);
      carousel.removeEventListener("mouseup", handleMouseUp);
      carousel.removeEventListener("mousemove", handleMouseMove);
      carousel.removeEventListener("scroll", handleScroll);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Large Carousel drag-to-scroll functionality (tương tự carousel trên)
  useEffect(() => {
    const carousel = largeCarouselRef.current;
    if (!carousel) return;

    const smoothScroll = () => {
      const current = carousel.scrollLeft;
      const target = largeTargetScrollLeft.current;
      const diff = target - current;

      if (isLargeDragging.current) {
        if (Math.abs(diff) > 0.1) {
          carousel.scrollLeft = current + diff * 0.25;
          largeAnimationFrameId.current = requestAnimationFrame(smoothScroll);
        } else {
          carousel.scrollLeft = target;
          largeAnimationFrameId.current = requestAnimationFrame(smoothScroll);
        }
      } else {
        if (Math.abs(largeVelocity.current) > 0.5) {
          carousel.scrollLeft = current + largeVelocity.current;
          largeVelocity.current *= 0.94;
          largeAnimationFrameId.current = requestAnimationFrame(smoothScroll);
        } else {
          largeVelocity.current = 0;
          if (largeAnimationFrameId.current) {
            cancelAnimationFrame(largeAnimationFrameId.current);
            largeAnimationFrameId.current = null;
          }
          checkLargeLoop();
        }
      }
    };

    const handleMouseDown = (e) => {
      if (largeAnimationFrameId.current) {
        cancelAnimationFrame(largeAnimationFrameId.current);
        largeAnimationFrameId.current = null;
      }

      isLargeDragging.current = true;
      carousel.style.cursor = "grabbing";
      carousel.style.scrollBehavior = "auto";
      largeStartX.current = e.pageX;
      largeScrollLeft.current = carousel.scrollLeft;
      largeTargetScrollLeft.current = carousel.scrollLeft;
      largeVelocity.current = 0;
      largeLastX.current = e.pageX;
      largeLastTime.current = Date.now();

      if (!largeAnimationFrameId.current) {
        largeAnimationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseLeave = () => {
      if (!isLargeDragging.current) return;
      isLargeDragging.current = false;
      carousel.style.cursor = "grab";
      largeTargetScrollLeft.current = carousel.scrollLeft;
      if (!largeAnimationFrameId.current) {
        largeAnimationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseUp = () => {
      if (!isLargeDragging.current) return;
      isLargeDragging.current = false;
      carousel.style.cursor = "grab";
      largeTargetScrollLeft.current = carousel.scrollLeft;
      if (!largeAnimationFrameId.current) {
        largeAnimationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseMove = (e) => {
      if (!isLargeDragging.current) return;
      e.preventDefault();

      const currentX = e.pageX;
      const currentTime = Date.now();
      const deltaX = currentX - largeLastX.current;
      const deltaTime = currentTime - largeLastTime.current;

      if (deltaTime > 0) {
        largeVelocity.current = -(deltaX / deltaTime) * 8;
      }

      const walk = (currentX - largeStartX.current) * 1.2;
      largeTargetScrollLeft.current = largeScrollLeft.current - walk;

      largeLastX.current = currentX;
      largeLastTime.current = currentTime;
    };

    const checkLargeLoop = () => {
      if (isLargeLooping.current || isLargeDragging.current) return;

      const scrollWidth = carousel.scrollWidth;
      const currentScroll = carousel.scrollLeft;
      const clientWidth = carousel.clientWidth;

      const items = carousel.querySelectorAll(".milan-large-carousel-item");
      if (!items.length) return;

      const itemWidth = items[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
      const itemWithGap = itemWidth + gap;
      const setSize = itemWithGap * 3; // 3 items per set
      const threshold = setSize * 2;

      if (currentScroll < threshold) {
        isLargeLooping.current = true;
        largeVelocity.current = 0;
        carousel.style.scrollBehavior = "auto";
        carousel.scrollLeft = currentScroll + setSize * 3;
        largeTargetScrollLeft.current = carousel.scrollLeft;
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
          isLargeLooping.current = false;
        }, 50);
        return;
      }

      const maxScroll = scrollWidth - clientWidth;
      if (currentScroll > maxScroll - threshold) {
        isLargeLooping.current = true;
        largeVelocity.current = 0;
        carousel.style.scrollBehavior = "auto";
        carousel.scrollLeft = currentScroll - setSize * 3;
        largeTargetScrollLeft.current = carousel.scrollLeft;
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
          isLargeLooping.current = false;
        }, 50);
        return;
      }
    };

    const handleScroll = () => {
      if (
        !isLargeDragging.current &&
        !isLargeLooping.current &&
        !isLargeArrowScrolling.current
      ) {
        checkLargeLoop();
      }
    };

    carousel.addEventListener("mousedown", handleMouseDown);
    carousel.addEventListener("mouseleave", handleMouseLeave);
    carousel.addEventListener("mouseup", handleMouseUp);
    carousel.addEventListener("mousemove", handleMouseMove);
    carousel.addEventListener("scroll", handleScroll);

    setTimeout(() => {
      const items = carousel.querySelectorAll(".milan-large-carousel-item");
      if (items.length) {
        const itemWidth = items[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
        const setSize = (itemWidth + gap) * 3;

        carousel.style.scrollBehavior = "auto";

        // Center an image in the middle of carousel
        const screenWidth = window.innerWidth;
        const targetIndex = 15; // Middle of 30 items (10 sets * 3 images)
        const targetItem = items[targetIndex];
        // Offset as percentage of screen width
        const offsetPercent = 25; // 25% of screen width
        carousel.scrollLeft = targetItem.offsetLeft - (screenWidth * offsetPercent / 100);

        largeVelocity.current = 0;
        isLargeDragging.current = false;
        isLargeLooping.current = false;
        isLargeArrowScrolling.current = false;
        largeTargetScrollLeft.current = carousel.scrollLeft;

        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
        }, 50);
      }
    }, 100);

    return () => {
      carousel.removeEventListener("mousedown", handleMouseDown);
      carousel.removeEventListener("mouseleave", handleMouseLeave);
      carousel.removeEventListener("mouseup", handleMouseUp);
      carousel.removeEventListener("mousemove", handleMouseMove);
      carousel.removeEventListener("scroll", handleScroll);

      if (largeAnimationFrameId.current) {
        cancelAnimationFrame(largeAnimationFrameId.current);
      }
    };
  }, []);

  // Large Carousel arrow handlers
  const handleLargePrevious = (e) => {
    const carousel = largeCarouselRef.current;
    if (!carousel || isLargeArrowScrolling.current) return;

    // Remove focus to prevent sticky active state on mobile
    if (e && e.currentTarget) {
      const button = e.currentTarget.querySelector('button');
      if (button) button.blur();
      e.currentTarget.blur();
    }

    const items = carousel.querySelectorAll(".milan-large-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;
    const setSize = scrollAmount * 3;
    const threshold = setSize * 2.5;

    isLargeArrowScrolling.current = true;

    const currentScroll = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;

    if (currentScroll - scrollAmount < threshold) {
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = currentScroll + setSize * 3;
      setTimeout(() => {
        carousel.style.scrollBehavior = "smooth";
        carousel.scrollLeft -= scrollAmount;
        setTimeout(() => {
          isLargeArrowScrolling.current = false;
        }, 400);
      }, 50);
    } else {
      carousel.style.scrollBehavior = "smooth";
      carousel.scrollLeft -= scrollAmount;
      setTimeout(() => {
        isLargeArrowScrolling.current = false;
      }, 400);
    }
  };

  const handleLargeNext = (e) => {
    const carousel = largeCarouselRef.current;
    if (!carousel || isLargeArrowScrolling.current) return;

    // Remove focus to prevent sticky active state on mobile
    if (e && e.currentTarget) {
      const button = e.currentTarget.querySelector('button');
      if (button) button.blur();
      e.currentTarget.blur();
    }

    const items = carousel.querySelectorAll(".milan-large-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;
    const setSize = scrollAmount * 3;
    const threshold = setSize * 2.5;

    isLargeArrowScrolling.current = true;

    const currentScroll = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (currentScroll + scrollAmount > maxScroll - threshold) {
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = currentScroll - setSize * 3;
      setTimeout(() => {
        carousel.style.scrollBehavior = "smooth";
        carousel.scrollLeft += scrollAmount;
        setTimeout(() => {
          isLargeArrowScrolling.current = false;
        }, 400);
      }, 50);
    } else {
      carousel.style.scrollBehavior = "smooth";
      carousel.scrollLeft += scrollAmount;
      setTimeout(() => {
        isLargeArrowScrolling.current = false;
      }, 400);
    }
  };

  // Arrow navigation handlers với preemptive repositioning
  const handlePrevious = (e) => {
    const carousel = carouselRef.current;
    if (!carousel || isArrowScrolling.current) return;

    // Remove focus to prevent sticky active state on mobile
    if (e && e.currentTarget) {
      const button = e.currentTarget.querySelector('button');
      if (button) button.blur();
      e.currentTarget.blur();
    }

    const items = carousel.querySelectorAll(".milan-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;
    const setSize = scrollAmount * 4;
    const threshold = setSize * 2.5; // 10 items threshold

    isArrowScrolling.current = true;

    // Check nếu cần reposition TRƯỚC KHI scroll
    const currentScroll = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;

    if (currentScroll - scrollAmount < threshold) {
      // Gần đầu - reposition về giữa trước
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = currentScroll + setSize * 3;
      setTimeout(() => {
        carousel.style.scrollBehavior = "smooth";
        carousel.scrollLeft -= scrollAmount;
        setTimeout(() => {
          isArrowScrolling.current = false;
        }, 400);
      }, 50);
    } else {
      carousel.style.scrollBehavior = "smooth";
      carousel.scrollLeft -= scrollAmount;
      setTimeout(() => {
        isArrowScrolling.current = false;
      }, 400);
    }
  };

  const handleNext = (e) => {
    const carousel = carouselRef.current;
    if (!carousel || isArrowScrolling.current) return;

    // Remove focus to prevent sticky active state on mobile
    if (e && e.currentTarget) {
      const button = e.currentTarget.querySelector('button');
      if (button) button.blur();
      e.currentTarget.blur();
    }

    const items = carousel.querySelectorAll(".milan-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;
    const setSize = scrollAmount * 4;
    const threshold = setSize * 2.5; // 10 items threshold

    isArrowScrolling.current = true;

    // Check nếu cần reposition TRƯỚC KHI scroll
    const currentScroll = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (currentScroll + scrollAmount > maxScroll - threshold) {
      // Gần cuối - reposition về giữa trước
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = currentScroll - setSize * 3;
      setTimeout(() => {
        carousel.style.scrollBehavior = "smooth";
        carousel.scrollLeft += scrollAmount;
        setTimeout(() => {
          isArrowScrolling.current = false;
        }, 400);
      }, 50);
    } else {
      carousel.style.scrollBehavior = "smooth";
      carousel.scrollLeft += scrollAmount;
      setTimeout(() => {
        isArrowScrolling.current = false;
      }, 400);
    }
  };

  return (
    <div className="milan-page">
      {/* Solid background layer - stays solid to block footer */}
      <div className="milan-hero-background-layer" ref={backgroundLayerRef} />

      {/* Hero Section */}
      <section className="milan-hero" ref={heroRef} data-navbar-theme="black">
        <div className="milan-hero-content">
          <div className="milan-hero-text">
            <div className="milan-hero-text-main">
              <span className="milan-hero-date bodytext-4--no-margin">
                Oct 2025
              </span>
              <h1 className="milan-hero-title heading-1--no-margin">
                Digital Jewelry Week Milan 2025
              </h1>
            </div>
            <p className="milan-hero-description bodytext-5--no-margin">
              At the heart of Milan's Digital Jewelry Week 2025, MIRROR unveiled
              a glimpse into the future of luxury - where technology and emotion
              merge through light, sound, and reflection.
            </p>
          </div>
          <div className="milan-hero-image">
            <MediaImage
              src="news/milan/milan_news_1.png"
              alt="Digital Jewelry Week Milan"
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="milan-article-content" data-navbar-theme="black">
        <div className="milan-article-container grid-container">
          {/* Introduction Section */}
          <div className="milan-intro-section col-12">
            <h2 className="milan-intro-title heading-3--no-margin">
              Immersive Elegance Meets the Future of Fine Jewelry
            </h2>
            <p className="milan-intro-text bodytext-4--no-margin">
              During Digital Jewelry Week Milan 2025, MIRROR unveiled an
              unprecedented vision of contemporary luxury - one where emotion,
              light, and technology converge in a seamless sensorial dialogue.
            </p>
          </div>

          {/* Feature Image 1 */}
          <div className="milan-feature-image col-8 col-start-3">
            <MediaImage
              src="news/milan/milan_news_2.png"
              alt="Digital Jewelry Experience"
            />
          </div>

          {/* Content Section 1 */}
          <div className="milan-content-section col-12">
            <p className="milan-content-text bodytext-4--no-margin">
              Hosted at Spazio Lenovo, the event was curated under the creative
              direction of Dario Rjeili, designer and founder of J Models
              Jewelry, in partnership with Lenovo. MIRROR took part as a
              pioneering participant, introducing its Immersive Showroom - a
              phygital experience that transcends the boundaries between reality
              and imagination.
            </p>
            <p className="milan-content-text bodytext-4--no-margin">
              Bathed in cinematic light and resonant soundscapes, the MIRROR
              space invited guests to discover the world of Love-Grown™ Diamonds
              - a new generation of gemstones born from science, shaped by
              emotion, and crafted in harmony with the Earth.
            </p>
          </div>

          {/* 4-Column Image Grid - Horizontal Scroll */}
          <div className="milan-carousel-wrapper col-12">
            <ArrowButton
              direction="left"
              className="milan-slider-arrow milan-slider-arrow-left"
              onClick={handlePrevious}
              ariaLabel="Previous image"
            />

            <div className="milan-carousel-container" ref={carouselRef}>
              {/* Duplicate 10 lần để buffer lớn hơn cho arrow scrolling */}
              {[...Array(10)].map((_, setIndex) => (
                <React.Fragment key={setIndex}>
                  <div className="milan-carousel-item">
                    <MediaImage
                      src="news/milan/milan_news_3.png"
                      alt="Milan Experience 1"
                    />
                  </div>
                  <div className="milan-carousel-item">
                    <MediaImage
                      src="news/milan/milan_news_4.png"
                      alt="Milan Experience 2"
                    />
                  </div>
                  <div className="milan-carousel-item">
                    <MediaImage
                      src="news/milan/milan_news_5.png"
                      alt="Milan Experience 3"
                    />
                  </div>
                  <div className="milan-carousel-item">
                    <MediaImage
                      src="news/milan/milan_news_6.png"
                      alt="Milan Experience 4"
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>

            <ArrowButton
              direction="right"
              className="milan-slider-arrow milan-slider-arrow-right"
              onClick={handleNext}
              ariaLabel="Next image"
            />
          </div>

          {/* Content Section 2 */}
          <div className="milan-content-section col-12">
            <p className="milan-content-text bodytext-3--no-margin">
              Through interactive reflections, digital craftsmanship, and
              sensorial storytelling, MIRROR revealed how the future of fine
              jewelry is not only seen, but felt. Each visitor entered a realm
              where diamond brilliance became light, and light became emotion.
            </p>
          </div>

          {/* Large Image Grid Carousel */}
          <div className="milan-large-carousel-wrapper col-12">
            <ArrowButton
              direction="left"
              className="milan-slider-arrow milan-slider-arrow-left"
              onClick={handleLargePrevious}
              ariaLabel="Previous large image"
            />

            <div
              className="milan-large-carousel-container"
              ref={largeCarouselRef}
            >
              {/* Duplicate 10 lần để buffer lớn hơn cho arrow scrolling */}
              {[...Array(10)].map((_, setIndex) => (
                <React.Fragment key={setIndex}>
                  <div className="milan-large-carousel-item">
                    <MediaImage
                      src="news/milan/milan_news_7.png"
                      alt="Exhibition Space 1"
                    />
                  </div>
                  <div className="milan-large-carousel-item">
                    <MediaImage
                      src="news/milan/milan_news_8.png"
                      alt="Exhibition Space 2"
                    />
                  </div>
                  <div className="milan-large-carousel-item">
                    <MediaImage
                      src="news/milan/milan_news_9.png"
                      alt="Exhibition Space 3"
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>

            <ArrowButton
              direction="right"
              className="milan-slider-arrow milan-slider-arrow-right"
              onClick={handleLargeNext}
              ariaLabel="Next large image"
            />
          </div>

          {/* Content Section 3 */}
          <div className="milan-content-section col-12">
            <p className="milan-content-text bodytext-3--no-margin">
              This moment in Milan marked more than an exhibition. It was a
              poetic declaration - a future where artistry, consciousness, and
              technology coexist to redefine the meaning of timeless beauty.
            </p>
          </div>

          {/* Final Image */}
          <div className="milan-final-image col-8 col-start-3">
            <MediaImage
              src="news/milan/milan_news_10.png"
              alt="Digital Jewelry Week Milan 2025"
            />
          </div>

          {/* Navigation Arrows */}
          <div className="milan-navigation col-12">
            <button className="milan-nav-button milan-nav-prev col-4">
              <div className="milan-nav-date bodytext-6--no-margin">
                10/2025
              </div>
              <div className="milan-nav-title heading-3--no-margin">
                La Società Benefit, vers un nouveau paradigme entrepreneurial?
              </div>
              <div className="milan-nav-label bodytext-4--no-margin">
                Previous article
              </div>
            </button>
            <button className="milan-nav-button milan-nav-next col-start-9">
              <div className="milan-nav-date bodytext-6--no-margin">
                10/2025
              </div>
              <div className="milan-nav-title heading-3--no-margin">
                La Società Benefit, vers un nouveau paradigme entrepreneurial?
              </div>
              <div className="milan-nav-label bodytext-4--no-margin">
                Next article
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MilanComponent;
