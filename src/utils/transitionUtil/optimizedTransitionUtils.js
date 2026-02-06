import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const optimizedTransitionUtils = {
  // Configuration
  config: {
    duration: 0.9, // Increased to 900ms for smoother transitions
    easing: "power1.out", // More natural easing
    fadeEasing: "power1.out",
    enableGPU: true,
    enableWillChange: true,
    enableRAF: true, // Re-enabled RAF with improved easing
    prefetchDelay: 100,
    // Performance settings
    isLowPerformance: false, // Will be auto-detected
    simplifiedTransition: false,
    // Navbar height (desktop default)
    navbarHeightDesktop: 69,
  },

  // Helper: Lấy chiều cao navbar hiện tại
  // Trả về 0 nếu navbar không hiển thị (các trang ẩn navbar)
  getNavbarHeight: () => {
    const navbar = document.querySelector('.navbar-v4-glass-background');
    if (!navbar) return 0;

    // Kiểm tra xem navbar có visible không
    const style = window.getComputedStyle(navbar);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return 0;
    }

    return navbar.offsetHeight || optimizedTransitionUtils.config.navbarHeightDesktop;
  },

  // Detect device performance
  detectPerformance: () => {
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;

    // Check memory (if available)
    const memory = navigator.deviceMemory || 4;

    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check connection speed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const slowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.effectiveType === '3g');

    // Determine if low performance
    const isLowPerformance = (
      cores <= 2 ||
      memory <= 2 ||
      slowConnection ||
      (isMobile && cores <= 4)
    );

    optimizedTransitionUtils.config.isLowPerformance = isLowPerformance;
    optimizedTransitionUtils.config.simplifiedTransition = isLowPerformance;

    // Adjust settings for low performance devices
    if (isLowPerformance) {
      optimizedTransitionUtils.config.duration = 0.3; // Shorter duration
      optimizedTransitionUtils.config.enableGPU = false; // Disable GPU on weak devices
      optimizedTransitionUtils.config.enableWillChange = false;
      optimizedTransitionUtils.config.enableRAF = false; // Use CSS transitions instead
    }

    return isLowPerformance;
  },

  // State management
  state: {
    isTransitioning: false,
    isInitialized: false,
    prefetchCache: new Set(),
    rafId: null,
  },

  // Performance optimizations
  optimizations: {
    // Optimize cloned content for smooth animation
    disableClonedVideos: (container) => {
      if (!container) return;

      // Add containment to limit browser paint/layout work
      container.style.contain = 'strict';

      // Handle slogan-section specially - it has position:fixed which escapes clone
      const sloganSection = container.querySelector('.slogan-section');
      if (sloganSection) {
        // Change from fixed to absolute so it stays within clone container
        sloganSection.style.position = 'absolute';
        sloganSection.style.zIndex = '0';
      }

      // Remove unnecessary elements that add to rendering cost
      container.querySelectorAll('script, iframe, [data-transition-ignore]').forEach(el => el.remove());

      // Disable all interactions and animations in clone
      container.querySelectorAll('*').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.animation = 'none';
        el.style.transition = 'none';
      });

      // Replace videos with their poster images
      const videos = container.querySelectorAll('video');
      videos.forEach(video => {
        const posterSrc = video.getAttribute('poster');

        if (posterSrc) {
          // Create img element with poster
          const img = document.createElement('img');
          img.src = posterSrc;
          img.className = video.className;
          img.style.cssText = window.getComputedStyle(video).cssText;
          img.style.objectFit = 'cover';
          img.style.position = 'absolute';
          img.style.top = '50%';
          img.style.left = '50%';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.transform = 'translate(-50%, -50%)';

          // Replace video with image
          video.parentNode.replaceChild(img, video);
        } else {
          // No poster - just pause and hide
          video.removeAttribute('autoplay');
          video.pause();
          video.muted = true;
        }
      });

      // Stop all canvas animations
      container.querySelectorAll('canvas').forEach(canvas => {
        canvas.style.display = 'none';
      });
    },

    // Enable GPU acceleration
    enableGPU: (element) => {
      if (!element) return;
      element.style.transform = "translateZ(0)";
      element.style.backfaceVisibility = "hidden";
      element.style.perspective = "1000px";
      element.style.willChange = "transform, opacity";
    },

    disableGPU: (element) => {
      if (!element) return;
      element.style.transform = "";
      element.style.backfaceVisibility = "";
      element.style.perspective = "";
      element.style.willChange = "";
    },

    // Throttle function for performance
    throttle: (func, wait) => {
      let timeout;
      let previous = 0;

      return function (...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);

        if (remaining <= 0 || remaining > wait) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          previous = now;
          func.apply(this, args);
        }
      };
    },
  },

  // Initialize the system
  init: () => {
    if (optimizedTransitionUtils.state.isInitialized) return;

    // Detect device performance first
    optimizedTransitionUtils.detectPerformance();

    // Setup prefetch on link hover
    if (typeof document !== "undefined") {
      const prefetchLink = optimizedTransitionUtils.optimizations.throttle(
        (href) => {
          if (!optimizedTransitionUtils.state.prefetchCache.has(href)) {
            optimizedTransitionUtils.state.prefetchCache.add(href);

            // Silently prefetch
            setTimeout(() => {
              fetch(href, {
                method: "GET",
                credentials: "same-origin",
                headers: { "X-Prefetch": "true" },
              }).catch(() => {});
            }, optimizedTransitionUtils.config.prefetchDelay);
          }
        },
        200
      );

      // Add hover prefetch
      document.addEventListener(
        "mouseover",
        (e) => {
          const link = e.target.closest("a[href]");
          if (link) {
            const href = link.getAttribute("href");
            if (href && href.startsWith("/") && !href.startsWith("//")) {
              prefetchLink(href);
            }
          }
        },
        { passive: true }
      );
    }

    optimizedTransitionUtils.state.isInitialized = true;
  },

  // Lightweight transition for low-performance devices
  lightweightTransition: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

    const {
      onStart = null,
      onComplete = null,
    } = options;

    optimizedTransitionUtils.state.isTransitioning = true;

    try {
      if (onStart) onStart();

      const root = document.getElementById("root");
      if (!root) throw new Error("Root element not found");

      // Simple fade out + subtle scale using CSS
      root.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
      root.style.opacity = '0';
      root.style.transform = 'scale(0.98)'; // Subtle scale down

      // Wait for fade out
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate - Pass options to preserve state
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);

      // Scroll to top immediately
      window.scrollTo(0, 0);

      // Wait minimal time for React to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fade in + scale back to normal
      root.style.opacity = '1';
      root.style.transform = 'scale(1)';

      // Wait for fade in
      await new Promise(resolve => setTimeout(resolve, 200));

      // Clean up
      root.style.transition = '';
      root.style.transform = '';

      // Kill ScrollTriggers
      setTimeout(() => {
        try {
          ScrollTrigger.killAll();
        } catch (e) {
          // Ignore
        }

        window.dispatchEvent(new CustomEvent("pageTransitionComplete"));
        window.scrollTo(0, 0);
      }, 50);

      optimizedTransitionUtils.state.isTransitioning = false;
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Lightweight transition failed:", error);

      const root = document.getElementById("root");
      if (root) {
        root.style.opacity = "1";
        root.style.transition = "";
        root.style.transform = "";
      }

      optimizedTransitionUtils.state.isTransitioning = false;
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);
    }
  },

  // Optimized page transition with preloading
  transitionToRoute: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

    // Mobile (≤425px): dùng lightweightTransition - chỉ fade, không slide
    const isMobile = window.innerWidth <= 425;
    if (isMobile) {
      return optimizedTransitionUtils.lightweightTransition(navigateFunction, route, options);
    }

    // Desktop/Tablet (>425px): dùng full transition - slide up + fade/scale

    const {
      onStart = null,
      onComplete = null,
      duration = optimizedTransitionUtils.config.duration,
    } = options;

    optimizedTransitionUtils.state.isTransitioning = true;

    try {
      // Notify components that transition is starting (pause animations)
      window.dispatchEvent(new CustomEvent("pageTransitionStart"));

      if (onStart) onStart();

      const root = document.getElementById("root");
      if (!root) throw new Error("Root element not found");

      // Lấy navbar height - navbar sẽ giữ nguyên, không bị clone
      const navbarHeight = optimizedTransitionUtils.getNavbarHeight();

      // Lấy main content thay vì toàn bộ root (để không clone navbar)
      const mainContent = document.querySelector('.page-main-content');
      const originalContent = mainContent ? mainContent.innerHTML : root.innerHTML;
      const currentScrollY = window.scrollY;

      // Freeze trang cũ - phủ full viewport, z-index dưới navbar (200)
      // Trang cũ nằm yên, không animate
      const frozenWrapper = document.createElement("div");
      frozenWrapper.id = "frozen-wrapper";
      frozenWrapper.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 150;
        background: white;
        overflow: hidden;
        pointer-events: none;
      `;

      // Clone chỉ main content (không có navbar)
      const frozenPage = document.createElement("div");
      frozenPage.innerHTML = originalContent;
      optimizedTransitionUtils.optimizations.disableClonedVideos(frozenPage);
      frozenPage.style.cssText = `
        position: absolute;
        top: ${-currentScrollY}px;
        left: 0;
        width: 100vw;
        min-height: 100vh;
        background: white;
      `;

      frozenWrapper.appendChild(frozenPage);
      document.body.appendChild(frozenWrapper);

      // Ẩn main content thật (nhưng KHÔNG ẩn navbar)
      if (mainContent) {
        mainContent.style.opacity = "0";
        mainContent.style.pointerEvents = "none";
      } else {
        root.style.opacity = "0";
        root.style.pointerEvents = "none";
      }

      // Navigate to new route (hidden) - Pass options to preserve state
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);

      // Scroll to top once only
      window.scrollTo(0, 0);

      // Chờ React render content mới (NHANH - không chờ images/videos)
      const waitForPageLoad = async () => {
        let retries = 0;
        const maxRetries = 20; // Max 2 giây - đủ để React render

        while (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Chỉ cần DOM render xong, không cần chờ images
          if (root.children.length > 0 && root.innerHTML !== originalContent) {
            break;
          }

          retries++;
        }

        // Chờ thêm 50ms để DOM ổn định
        await new Promise((resolve) => setTimeout(resolve, 50));
      };

      await waitForPageLoad();

      // Content đã load xong, chuẩn bị animation
      // KHÔNG xóa frozenWrapper - trang cũ sẽ nằm yên phía sau

      // Lấy content mới từ main content (không có navbar)
      const newMainContent = document.querySelector('.page-main-content');
      const newContent = newMainContent ? newMainContent.innerHTML : root.innerHTML;

      // Tạo container cho trang mới - phủ full viewport, slide up từ dưới
      // z-index dưới navbar (200), trên frozen wrapper (150)
      const newPageContainer = document.createElement("div");
      newPageContainer.innerHTML = newContent;
      optimizedTransitionUtils.optimizations.disableClonedVideos(newPageContainer);
      newPageContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 160;
        background: white;
        overflow: hidden;
        pointer-events: none;
        contain: layout style paint;
        transform: translateY(100%) translateZ(0);
        backface-visibility: hidden;
        will-change: transform;
      `;
      document.body.appendChild(newPageContainer);

      // Animation: Trang cũ fade + scale, trang mới slide lên
      const performAnimation = async () => {
        return new Promise((resolve) => {
          // Thêm will-change cho frozenWrapper để GPU accelerate
          frozenWrapper.style.willChange = 'transform, opacity';
          frozenWrapper.style.transformOrigin = 'center center';

          // Force reflow trước khi transition
          frozenWrapper.offsetHeight;
          newPageContainer.offsetHeight;

          // CSS transition timing (easeOutCubic)
          const transitionTiming = `${duration}s cubic-bezier(0.33, 1, 0.68, 1)`;

          // Transition cho cả trang cũ và trang mới
          frozenWrapper.style.transition = `opacity ${transitionTiming}, transform ${transitionTiming}`;
          newPageContainer.style.transition = `transform ${transitionTiming}`;

          // Trigger animation
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Trang cũ: fade out + scale down
              frozenWrapper.style.opacity = '0';
              frozenWrapper.style.transform = 'scale(0.95) translateZ(0)';

              // Trang mới: slide up từ 100% → 0%
              newPageContainer.style.transform = 'translateY(0%) translateZ(0)';
            });
          });

          // Wait for transition complete
          const onTransitionEnd = () => {
            newPageContainer.removeEventListener('transitionend', onTransitionEnd);
            resolve();
          };

          newPageContainer.addEventListener('transitionend', onTransitionEnd);

          // Fallback timeout
          setTimeout(() => {
            newPageContainer.removeEventListener('transitionend', onTransitionEnd);
            resolve();
          }, duration * 1000 + 50);
        });
      };

      await performAnimation();

      // Clean up sau animation
      // Hiện lại main content thật
      if (mainContent) {
        mainContent.style.opacity = "1";
        mainContent.style.pointerEvents = "";
      } else {
        root.style.opacity = "1";
        root.style.pointerEvents = "";
      }

      // Xóa các layers animation
      frozenWrapper.remove();
      newPageContainer.remove();

      // Final scroll to top to ensure new page is at the beginning
      window.scrollTo(0, 0);

      // Cleanup GPU acceleration hints
      optimizedTransitionUtils.optimizations.disableGPU(root);

      // Clean up ScrollTrigger and let pages handle their own setup
      setTimeout(() => {
        // Kill all existing triggers to prevent conflicts
        try {
          ScrollTrigger.killAll();
        } catch (e) {
          // Ignore cleanup errors
        }

        // Dispatch event for pages to reinitialize their ScrollTriggers
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("pageTransitionComplete"));
          window.scrollTo(0, 0); // Extra scroll to top
        }, 50);
      }, 100);

      // Apply lazy loading for remaining resources
      optimizedTransitionUtils.preloadPageContent(route);

      optimizedTransitionUtils.state.isTransitioning = false;
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Transition failed:", error);

      // Cleanup on error
      const root = document.getElementById("root");
      const mainContent = document.querySelector('.page-main-content');

      // Khôi phục visibility
      if (mainContent) {
        mainContent.style.opacity = "1";
        mainContent.style.pointerEvents = "";
      }
      if (root) {
        root.style.opacity = "1";
        optimizedTransitionUtils.optimizations.disableGPU(root);
      }

      // Xóa tất cả fixed elements (trừ root và navbar)
      document.querySelectorAll('#frozen-wrapper, [id*="frozen"]').forEach((el) => {
        el.remove();
      });

      if (optimizedTransitionUtils.state.rafId) {
        cancelAnimationFrame(optimizedTransitionUtils.state.rafId);
      }

      optimizedTransitionUtils.state.isTransitioning = false;
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);
    }
  },

  // Smooth transition without flash
  smoothTransition: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

    // Always use full transition for consistent UX across all devices

    const {
      onStart = null,
      onComplete = null,
      duration = optimizedTransitionUtils.config.duration,
    } = options;

    optimizedTransitionUtils.state.isTransitioning = true;

    try {
      if (onStart) onStart();

      const root = document.getElementById("root");
      if (!root) throw new Error("Root element not found");

      // Capture current page state
      const currentContent = root.innerHTML;

      // Create persistent overlay to prevent flash
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10000;
        background: white;
        pointer-events: none;
      `;
      overlay.innerHTML = currentContent;
      optimizedTransitionUtils.optimizations.disableClonedVideos(overlay);
      document.body.appendChild(overlay);

      // Navigate in background - Pass options to preserve state
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);

      // Wait for new content with intelligent checking
      const waitForReady = async () => {
        let checks = 0;
        const maxChecks = 50; // 5 seconds max

        while (checks < maxChecks) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Check if content has changed
          if (root.innerHTML !== currentContent && root.children.length > 0) {
            // Additional checks for heavy content
            const media = root.querySelectorAll("img, video");

            if (media.length > 0) {
              // Wait for first few images
              const images = Array.from(root.querySelectorAll("img")).slice(
                0,
                2
              );
              let loaded = true;

              for (const img of images) {
                if (!img.complete && img.src) {
                  loaded = false;
                  break;
                }
              }

              if (loaded) break;
            } else {
              // No media, content is ready
              break;
            }
          }

          checks++;
        }

        // Final stabilization wait
        await new Promise((resolve) => setTimeout(resolve, 50));
      };

      await waitForReady();

      // Smooth transition effect
      const newContent = root.innerHTML;

      // Create new content layer
      const newLayer = document.createElement("div");
      newLayer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10001;
        background: white;
        opacity: 0;
        transition: opacity ${duration}s ease;
        pointer-events: none;
      `;
      newLayer.innerHTML = newContent;
      optimizedTransitionUtils.optimizations.disableClonedVideos(newLayer);
      document.body.appendChild(newLayer);

      // Fade in new content
      requestAnimationFrame(() => {
        newLayer.style.opacity = "1";
      });

      // Clean up after transition
      setTimeout(() => {
        overlay.remove();
        newLayer.remove();

        // Clean up ScrollTrigger and let pages handle their own setup
        try {
          ScrollTrigger.killAll();
        } catch (e) {
          // Ignore cleanup errors
        }

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("pageTransitionComplete"));
        }, 50);

        optimizedTransitionUtils.state.isTransitioning = false;
        if (onComplete) onComplete();
      }, duration * 1000);
    } catch (error) {
      console.error("Smooth transition failed:", error);
      optimizedTransitionUtils.state.isTransitioning = false;
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);
    }
  },

  // Smart transition with loading indicator
  smartTransition: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

    // Always use full transition for consistent UX across all devices

    const {
      onStart = null,
      onComplete = null,
      showLoader = true,
    } = options;

    optimizedTransitionUtils.state.isTransitioning = true;

    try {
      if (onStart) onStart();

      const root = document.getElementById("root");
      if (!root) throw new Error("Root element not found");

      // Show loading indicator if needed
      let loadingOverlay = null;
      if (showLoader) {
        loadingOverlay = document.createElement("div");
        loadingOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(255, 255, 255, 0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        `;
        loadingOverlay.innerHTML = `
          <div style="
            width: 50px;
            height: 50px;
            border: 3px solid #f0f0f0;
            border-top: 3px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
        document.body.appendChild(loadingOverlay);

        // Fade in loader
        requestAnimationFrame(() => {
          loadingOverlay.style.opacity = "1";
        });
      }

      // Navigate and wait for content - Pass options to preserve state
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);

      // Smart waiting - check content weight
      const waitForContent = async () => {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          const content = document.getElementById("root");
          if (!content || content.children.length === 0) {
            attempts++;
            continue;
          }

          // Check media loading status
          const images = content.querySelectorAll("img");
          const videos = content.querySelectorAll("video");

          // For heavy pages, wait for critical resources
          if (
            route.includes("about") ||
            images.length > 5 ||
            videos.length > 0
          ) {
            let resourcesReady = true;

            // Check first 3 images
            for (let i = 0; i < Math.min(images.length, 3); i++) {
              if (images[i] && !images[i].complete) {
                resourcesReady = false;
                break;
              }
            }

            // Check video metadata
            for (const video of videos) {
              if (video.readyState < 1) {
                video.preload = "metadata";
                resourcesReady = false;
              }
            }

            if (resourcesReady) break;
          } else {
            // Light pages - just ensure DOM is ready
            if (content.querySelector("h1, h2, p, div")) {
              break;
            }
          }

          attempts++;
        }
      };

      await waitForContent();

      // Fade out loader and show content
      if (loadingOverlay) {
        loadingOverlay.style.opacity = "0";
        setTimeout(() => loadingOverlay.remove(), 300);
      }

      // Apply lazy loading for remaining resources
      optimizedTransitionUtils.preloadPageContent(route);

      optimizedTransitionUtils.state.isTransitioning = false;

      // Clean up ScrollTrigger and let pages handle their own setup
      setTimeout(() => {
        try {
          ScrollTrigger.killAll();
        } catch (e) {
          // Ignore cleanup errors
        }

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("pageTransitionComplete"));
          window.scrollTo(0, 0); // Extra scroll to top
        }, 50);
      }, 100);

      if (onComplete) onComplete();
    } catch (error) {
      console.error("Smart transition failed:", error);
      optimizedTransitionUtils.state.isTransitioning = false;
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);
    }
  },

  // Fast fade transition
  fadeToRoute: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

    const { duration = 0.25, onComplete = null } = options;
    optimizedTransitionUtils.state.isTransitioning = true;

    try {
      const container = document.getElementById("root") || document.body;

      if (optimizedTransitionUtils.config.enableGPU) {
        optimizedTransitionUtils.optimizations.enableGPU(container);
      }

      // Fade out
      await gsap.to(container, {
        duration: duration,
        opacity: 0,
        scale: 0.98,
        ease: optimizedTransitionUtils.config.fadeEasing,
        force3D: optimizedTransitionUtils.config.enableGPU,
      });

      // Navigate - Pass options to preserve state
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);

      // Fade in
      setTimeout(() => {
        gsap.to(container, {
          duration: duration,
          opacity: 1,
          scale: 1,
          ease: optimizedTransitionUtils.config.fadeEasing,
          clearProps: "all",
          onComplete: () => {
            if (optimizedTransitionUtils.config.enableGPU) {
              optimizedTransitionUtils.optimizations.disableGPU(container);
            }
            optimizedTransitionUtils.state.isTransitioning = false;
            if (onComplete) onComplete();
          },
        });
      }, 50);
    } catch (error) {
      console.error("Fade transition failed:", error);
      optimizedTransitionUtils.state.isTransitioning = false;
      const navigationOptions = {
        state: options.state,
        replace: options.replace
      };
      navigateFunction(route, navigationOptions);
    }
  },

  // Preload page content with smart loading strategy
  preloadPageContent: async (route) => {
    // For heavy pages like About, implement progressive loading
    if (route.includes("about")) {
      // Lazy load videos
      const lazyLoadVideos = () => {
        const videos = document.querySelectorAll("video[data-src]");
        const videoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const video = entry.target;
                video.src = video.dataset.src;
                video.load();
                videoObserver.unobserve(video);
              }
            });
          },
          { rootMargin: "50px" }
        );

        videos.forEach((video) => videoObserver.observe(video));
      };

      // Optimize images
      const optimizeImages = () => {
        const images = document.querySelectorAll("img");
        images.forEach((img) => {
          if (!img.loading) img.loading = "lazy";
          if (!img.decoding) img.decoding = "async";
        });
      };

      requestAnimationFrame(() => {
        lazyLoadVideos();
        optimizeImages();
      });
    }
  },

  // Prefetch a route
  prefetch: (route) => {
    if (!optimizedTransitionUtils.state.prefetchCache.has(route)) {
      optimizedTransitionUtils.state.prefetchCache.add(route);
      fetch(route, {
        method: "GET",
        credentials: "same-origin",
      }).catch(() => {});
    }
  },

  // Cleanup
  destroy: () => {
    if (optimizedTransitionUtils.state.rafId) {
      cancelAnimationFrame(optimizedTransitionUtils.state.rafId);
    }
    optimizedTransitionUtils.state.isInitialized = false;
    optimizedTransitionUtils.state.isTransitioning = false;
    optimizedTransitionUtils.state.prefetchCache.clear();
  },
};

export default optimizedTransitionUtils;
