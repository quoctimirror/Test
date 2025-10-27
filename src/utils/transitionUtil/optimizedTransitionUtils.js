import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const optimizedTransitionUtils = {
  // Configuration
  config: {
    duration: 0.6, // Giảm xuống 600ms cho mượt hơn
    easing: "power2.inOut",
    fadeEasing: "power2.out",
    enableGPU: true,
    enableWillChange: true,
    enableRAF: true,
    prefetchDelay: 100,
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

  // Optimized page transition with preloading
  transitionToRoute: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

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

      // Save current page state and scroll position
      const originalContent = root.innerHTML;
      const currentScrollY = window.scrollY;

      // Create a wrapper that can contain the full page
      const frozenWrapper = document.createElement("div");
      frozenWrapper.id = "frozen-wrapper";
      frozenWrapper.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9997;
        background: white;
        overflow: hidden;
        pointer-events: none;
      `;

      // Create the actual frozen page content
      const frozenPage = document.createElement("div");
      frozenPage.innerHTML = originalContent;
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

      // Hide the real root temporarily
      root.style.opacity = "0";
      root.style.pointerEvents = "none";

      // Navigate to new route (hidden)
      navigateFunction(route);

      // Ensure new page starts from top multiple times to be safe
      setTimeout(() => window.scrollTo(0, 0), 10);
      setTimeout(() => window.scrollTo(0, 0), 50);
      setTimeout(() => window.scrollTo(0, 0), 100);
      setTimeout(() => window.scrollTo(0, 0), 200);

      // Wait for new content to fully load
      const waitForPageLoad = async () => {
        let retries = 0;
        const maxRetries = 50; // 5 seconds max wait

        while (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Check if React has rendered
          if (root.children.length === 0) {
            retries++;
            continue;
          }

          // Check for critical resources
          const images = root.querySelectorAll("img");
          const videos = root.querySelectorAll("video");

          // Wait for critical images (above the fold)
          let criticalImagesLoaded = true;
          for (let i = 0; i < Math.min(images.length, 3); i++) {
            const img = images[i];
            if (img && !img.complete && !img.src.includes("data:")) {
              criticalImagesLoaded = false;
              break;
            }
          }

          // For videos, just ensure they have metadata
          for (const video of videos) {
            if (video.readyState < 1) {
              // HAVE_METADATA
              video.preload = "metadata";
            }
          }

          // If critical resources are ready, proceed
          if (criticalImagesLoaded) {
            break;
          }

          retries++;
        }

        // Extra wait for JS to settle
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      await waitForPageLoad();

      // Now content is loaded, prepare animation layers
      // Remove frozen wrapper and create animation layers
      frozenWrapper.remove();

      // Create animated clone wrapper (keep current scroll position)
      const currentPageWrapper = document.createElement("div");
      currentPageWrapper.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9998;
        background: white;
        overflow: hidden;
        pointer-events: none;
        ${
          optimizedTransitionUtils.config.enableGPU
            ? "transform: translateZ(0);"
            : ""
        }
        ${
          optimizedTransitionUtils.config.enableWillChange
            ? "will-change: transform, opacity;"
            : ""
        }
      `;

      // Create the actual page content clone
      const currentPageClone = document.createElement("div");
      currentPageClone.innerHTML = originalContent;
      currentPageClone.style.cssText = `
        position: absolute;
        top: ${-currentScrollY}px;
        left: 0;
        width: 100vw;
        min-height: 100vh;
        background: white;
      `;

      currentPageWrapper.appendChild(currentPageClone);
      document.body.appendChild(currentPageWrapper);

      // Create new page container with slide-up animation
      const newPageContainer = document.createElement("div");
      newPageContainer.innerHTML = root.innerHTML;
      newPageContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        background: white;
        overflow: hidden;
        pointer-events: none;
        ${
          optimizedTransitionUtils.config.enableGPU
            ? "transform: translateY(100%) translateZ(0);"
            : "transform: translateY(100%);"
        }
        ${
          optimizedTransitionUtils.config.enableWillChange
            ? "will-change: transform;"
            : ""
        }
      `;
      document.body.appendChild(newPageContainer);

      // Enable GPU acceleration
      if (optimizedTransitionUtils.config.enableGPU) {
        optimizedTransitionUtils.optimizations.enableGPU(currentPageWrapper);
        optimizedTransitionUtils.optimizations.enableGPU(newPageContainer);
      }

      // Perform smooth animation
      const performAnimation = async () => {
        return new Promise((resolve) => {
          if (optimizedTransitionUtils.config.enableRAF) {
            const startTime = performance.now();
            const animationDuration = duration * 1000;

            const animate = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / animationDuration, 1);

              // Current page fade out and scale down
              const opacity = Math.max(0, 1 - progress / 0.7);
              const scale = 1 - progress * 0.08;
              currentPageWrapper.style.opacity = opacity;
              currentPageWrapper.style.transform = `scale(${scale}) ${
                optimizedTransitionUtils.config.enableGPU ? "translateZ(0)" : ""
              }`;

              // New page slide up
              const translateY = 100 * (1 - progress);
              newPageContainer.style.transform = `translateY(${translateY}%)${
                optimizedTransitionUtils.config.enableGPU
                  ? " translateZ(0)"
                  : ""
              }`;

              if (progress < 1) {
                optimizedTransitionUtils.state.rafId =
                  requestAnimationFrame(animate);
              } else {
                resolve();
              }
            };

            optimizedTransitionUtils.state.rafId =
              requestAnimationFrame(animate);
          } else {
            // GSAP fallback
            const tl = gsap.timeline({ onComplete: resolve });

            tl.to(currentPageWrapper, {
              duration: duration,
              opacity: 0,
              scale: 0.92,
              ease: optimizedTransitionUtils.config.easing,
            }).to(
              newPageContainer,
              {
                y: "0%",
                duration: duration,
                ease: optimizedTransitionUtils.config.easing,
                force3D: optimizedTransitionUtils.config.enableGPU,
              },
              0
            );
          }
        });
      };

      await performAnimation();

      // Clean up after animation
      root.style.opacity = "1";
      root.style.pointerEvents = "";
      currentPageWrapper.remove();
      newPageContainer.remove();

      // Final scroll to top to ensure new page is at the beginning
      window.scrollTo(0, 0);

      // Cleanup GPU acceleration
      if (optimizedTransitionUtils.config.enableGPU) {
        optimizedTransitionUtils.optimizations.disableGPU(root);
      }

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
      if (root) {
        root.style.opacity = "1";
        if (optimizedTransitionUtils.config.enableGPU) {
          optimizedTransitionUtils.optimizations.disableGPU(root);
        }
      }

      document.querySelectorAll('[style*="fixed"]').forEach((el) => {
        if (el.id !== "root") el.remove();
      });

      if (optimizedTransitionUtils.state.rafId) {
        cancelAnimationFrame(optimizedTransitionUtils.state.rafId);
      }

      optimizedTransitionUtils.state.isTransitioning = false;
      navigateFunction(route);
    }
  },

  // Smooth transition without flash
  smoothTransition: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

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
      document.body.appendChild(overlay);

      // Navigate in background
      navigateFunction(route);

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
      navigateFunction(route);
    }
  },

  // Smart transition with loading indicator
  smartTransition: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

    const {
      onStart = null,
      onComplete = null,
      showLoader = true,
      duration = optimizedTransitionUtils.config.duration,
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

      // Navigate and wait for content
      navigateFunction(route);

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
      navigateFunction(route);
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

      // Navigate
      navigateFunction(route);

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
      navigateFunction(route);
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
