// Optimized Transition Utils - Kết hợp ưu điểm của reactTransitionUtils và Barba.js
// Không cần Barba wrapper, hoạt động trực tiếp với React

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const optimizedTransitionUtils = {
  // Configuration
  config: {
    duration: 0.6, // Giảm xuống 600ms cho mượt hơn
    easing: "power2.inOut",
    fadeEasing: "power2.out",
    enableGPU: true,
    enableWillChange: true,
    enableRAF: true,
    prefetchDelay: 100
  },

  // State management
  state: {
    isTransitioning: false,
    isInitialized: false,
    prefetchCache: new Set(),
    rafId: null
  },

  // Performance optimizations
  optimizations: {
    // Enable GPU acceleration
    enableGPU: (element) => {
      if (!element) return;
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';
      element.style.willChange = 'transform, opacity';
    },

    disableGPU: (element) => {
      if (!element) return;
      element.style.transform = '';
      element.style.backfaceVisibility = '';
      element.style.perspective = '';
      element.style.willChange = '';
    },

    // Throttle function for performance
    throttle: (func, wait) => {
      let timeout;
      let previous = 0;
      
      return function(...args) {
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
    }
  },

  // Initialize the system
  init: () => {
    if (optimizedTransitionUtils.state.isInitialized) return;
    
    // Setup prefetch on link hover
    if (typeof document !== 'undefined') {
      const prefetchLink = optimizedTransitionUtils.optimizations.throttle((href) => {
        if (!optimizedTransitionUtils.state.prefetchCache.has(href)) {
          optimizedTransitionUtils.state.prefetchCache.add(href);
          
          // Silently prefetch
          setTimeout(() => {
            fetch(href, { 
              method: 'GET', 
              credentials: 'same-origin',
              headers: { 'X-Prefetch': 'true' }
            }).catch(() => {});
          }, optimizedTransitionUtils.config.prefetchDelay);
        }
      }, 200);

      // Add hover prefetch
      document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a[href]');
        if (link) {
          const href = link.getAttribute('href');
          if (href && href.startsWith('/') && !href.startsWith('//')) {
            prefetchLink(href);
          }
        }
      }, { passive: true });
    }

    optimizedTransitionUtils.state.isInitialized = true;
    console.log('Optimized Transition Utils initialized');
  },

  // Optimized page transition with RAF
  transitionToRoute: async (navigateFunction, route, options = {}) => {
    if (optimizedTransitionUtils.state.isTransitioning) {
      return;
    }

    const { 
      onStart = null,
      onComplete = null,
      duration = optimizedTransitionUtils.config.duration
    } = options;

    optimizedTransitionUtils.state.isTransitioning = true;

    try {
      if (onStart) onStart();

      const root = document.getElementById('root');
      if (!root) throw new Error('Root element not found');

      // Enable GPU acceleration
      if (optimizedTransitionUtils.config.enableGPU) {
        optimizedTransitionUtils.optimizations.enableGPU(root);
      }

      // Create optimized clone
      const currentPageClone = document.createElement('div');
      currentPageClone.innerHTML = root.innerHTML;
      currentPageClone.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1;
        background: white;
        overflow: hidden;
        pointer-events: none;
        ${optimizedTransitionUtils.config.enableGPU ? 'transform: translateZ(0);' : ''}
        ${optimizedTransitionUtils.config.enableWillChange ? 'will-change: transform, opacity;' : ''}
      `;
      document.body.appendChild(currentPageClone);

      // Create container for new page with loading placeholder
      const newPageContainer = document.createElement('div');
      newPageContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10;
        background: white;
        overflow: hidden;
        pointer-events: none;
        ${optimizedTransitionUtils.config.enableGPU ? 'transform: translateY(100%) translateZ(0);' : 'transform: translateY(100%);'}
        ${optimizedTransitionUtils.config.enableWillChange ? 'will-change: transform;' : ''}
      `;
      
      // Add loading skeleton/placeholder
      const loadingPlaceholder = document.createElement('div');
      loadingPlaceholder.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      `;
      loadingPlaceholder.innerHTML = `
        <style>
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        </style>
      `;
      newPageContainer.appendChild(loadingPlaceholder);
      document.body.appendChild(newPageContainer);

      // Hide root during transition
      root.style.opacity = '0';
      
      // Start animation immediately with placeholder
      const startAnimation = () => {
        if (optimizedTransitionUtils.config.enableRAF) {
          const startTime = performance.now();
          const animationDuration = duration * 1000;

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);

            // Current page animation
            const opacity = Math.max(0, 1 - progress / 0.7);
            const scale = 1 - progress * 0.08;
            currentPageClone.style.opacity = opacity;
            currentPageClone.style.transform = `scale(${scale})`;

            // New page animation
            const translateY = 100 * (1 - progress);
            newPageContainer.style.transform = `translateY(${translateY}%)${optimizedTransitionUtils.config.enableGPU ? ' translateZ(0)' : ''}`;

            if (progress < 1) {
              optimizedTransitionUtils.state.rafId = requestAnimationFrame(animate);
            }
          };

          optimizedTransitionUtils.state.rafId = requestAnimationFrame(animate);
        } else {
          // Fallback GSAP animation
          gsap.to(currentPageClone, {
            duration: duration,
            opacity: 0,
            scale: 0.92,
            ease: optimizedTransitionUtils.config.easing
          });
          
          gsap.to(newPageContainer, {
            y: "0%",
            duration: duration,
            ease: optimizedTransitionUtils.config.easing,
            force3D: optimizedTransitionUtils.config.enableGPU
          });
        }
      };
      
      // Start animation immediately
      startAnimation();

      // Navigate to new route
      navigateFunction(route);

      // Apply smart loading strategy for heavy pages
      setTimeout(() => {
        optimizedTransitionUtils.preloadPageContent(route);
      }, 50);

      // Wait for content to be ready
      const waitForContent = async () => {
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds max wait
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Check if new content is loaded
          const newContent = document.getElementById('root');
          if (newContent && newContent.children.length > 0) {
            // Check for images and videos
            const media = newContent.querySelectorAll('img, video');
            if (media.length === 0) break;
            
            // Wait for at least first image to load
            const firstImg = newContent.querySelector('img');
            if (!firstImg || firstImg.complete) break;
          }
          attempts++;
        }
      };

      await waitForContent();

      // Copy new content after it's ready
      newPageContainer.innerHTML = root.innerHTML;

      // Wait for animation to complete
      await new Promise(resolve => {
        setTimeout(() => {
          // Animation complete
          root.style.opacity = '1';
          currentPageClone.remove();
          newPageContainer.remove();

          // Cleanup GPU acceleration
          if (optimizedTransitionUtils.config.enableGPU) {
            optimizedTransitionUtils.optimizations.disableGPU(root);
          }

          // Refresh ScrollTrigger
          setTimeout(() => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            ScrollTrigger.refresh(true);
            window.dispatchEvent(new CustomEvent('pageTransitionComplete'));
          }, 100);

          optimizedTransitionUtils.state.isTransitioning = false;
          if (onComplete) onComplete();
          resolve();
        }, duration * 1000);

      });

    } catch (error) {
      console.error('Transition failed:', error);
      
      // Cleanup on error
      const root = document.getElementById('root');
      if (root) {
        root.style.opacity = '1';
        if (optimizedTransitionUtils.config.enableGPU) {
          optimizedTransitionUtils.optimizations.disableGPU(root);
        }
      }
      
      document.querySelectorAll('[style*="fixed"]').forEach(el => {
        if (el.id !== 'root') el.remove();
      });
      
      if (optimizedTransitionUtils.state.rafId) {
        cancelAnimationFrame(optimizedTransitionUtils.state.rafId);
      }
      
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
      const container = document.getElementById('root') || document.body;
      
      if (optimizedTransitionUtils.config.enableGPU) {
        optimizedTransitionUtils.optimizations.enableGPU(container);
      }
      
      // Fade out
      await gsap.to(container, {
        duration: duration,
        opacity: 0,
        scale: 0.98,
        ease: optimizedTransitionUtils.config.fadeEasing,
        force3D: optimizedTransitionUtils.config.enableGPU
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
          }
        });
      }, 50);

    } catch (error) {
      console.error('Fade transition failed:', error);
      optimizedTransitionUtils.state.isTransitioning = false;
      navigateFunction(route);
    }
  },

  // Preload page content with smart loading strategy
  preloadPageContent: async (route) => {
    // For heavy pages like About, implement progressive loading
    if (route.includes('about')) {
      // Lazy load videos
      const lazyLoadVideos = () => {
        const videos = document.querySelectorAll('video[data-src]');
        const videoObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const video = entry.target;
              video.src = video.dataset.src;
              video.load();
              videoObserver.unobserve(video);
            }
          });
        }, { rootMargin: '50px' });
        
        videos.forEach(video => videoObserver.observe(video));
      };
      
      // Optimize images
      const optimizeImages = () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (!img.loading) img.loading = 'lazy';
          if (!img.decoding) img.decoding = 'async';
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
        method: 'GET', 
        credentials: 'same-origin' 
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
  }
};

export default optimizedTransitionUtils;