// React-compatible Transition Utils
// Works with React Router for smooth page transitions

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const reactTransitionUtils = {
  // Configuration
  config: {
    duration: 0.7,
    easing: "power2.inOut",
    fadeEasing: "none"
  },

  // State management
  state: {
    isTransitioning: false,
    isInitialized: false
  },

  // Initialize the system
  init: () => {
    if (reactTransitionUtils.state.isInitialized) return;
    
    // Custom cursor removed - no longer needed
    reactTransitionUtils.state.isInitialized = true;
    console.log('React Transition Utils initialized');
  },


  // Page transition with React Router navigation (exact like transitionPagev4.html)
  transitionToRoute: async (navigateFunction, route, options = {}) => {
    if (reactTransitionUtils.state.isTransitioning) {
      return;
    }

    const { 
      onStart = null,
      onComplete = null 
    } = options;

    reactTransitionUtils.state.isTransitioning = true;

    try {
      if (onStart) onStart();

      const root = document.getElementById('root');
      if (!root) throw new Error('Root element not found');

      // Create a clone of current page for animation
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
      `;
      document.body.appendChild(currentPageClone);

      // Create container for new page
      const newPageContainer = document.createElement('div');
      newPageContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10;
        background: white;
        transform: translateY(100%);
        overflow: hidden;
      `;
      document.body.appendChild(newPageContainer);

      // Hide the actual root during transition
      root.style.opacity = '0';

      // Navigate to new route (React will update root content)
      navigateFunction(route);

      // Wait for React to render new content
      await new Promise(resolve => setTimeout(resolve, 100));

      // Copy new content to animation container
      newPageContainer.innerHTML = root.innerHTML;

      // Create timeline exactly like transitionPagev4.html
      const tl = gsap.timeline({
        onComplete: () => {
          // Show the actual root with new content
          root.style.opacity = '1';
          
          // Remove animation containers
          currentPageClone.remove();
          newPageContainer.remove();
          
          // IMPORTANT: Refresh ScrollTrigger and all GSAP animations after transition
          setTimeout(() => {
            // Kill all existing ScrollTriggers to prevent conflicts
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            
            // Refresh ScrollTrigger to recalculate all positions
            ScrollTrigger.refresh(true);
            
            // Dispatch custom event for components to reinitialize their animations
            window.dispatchEvent(new CustomEvent('pageTransitionComplete'));
            
            console.log('ScrollTrigger refreshed after transition');
          }, 100);
          
          reactTransitionUtils.state.isTransitioning = false;
          if (onComplete) onComplete();
        }
      });

      // Animate current page (fade out + scale down)
      tl.to(currentPageClone, {
        duration: 0.7,
        ease: "none",
        onUpdate: function() {
          const progress = this.progress();
          
          // Exact formulas from transitionPagev4.html
          const opacity = Math.max(0, 1 - progress / 0.7);
          const scale = 1 - progress * 0.08;
          
          gsap.set(currentPageClone, {
            opacity: opacity,
            scale: scale,
            transformOrigin: "center center"
          });
        }
      })
      // Slide new page up from bottom (exactly like transitionPagev4.html)
      .to(newPageContainer, {
        y: "0%",
        duration: 0.7,
        ease: "power2.inOut"
      }, 0); // Start at the same time

    } catch (error) {
      console.error('Transition failed:', error);
      
      // Cleanup on error
      const root = document.getElementById('root');
      if (root) root.style.opacity = '1';
      
      document.querySelectorAll('[style*="fixed"]').forEach(el => {
        if (el.id !== 'root') el.remove();
      });
      
      reactTransitionUtils.state.isTransitioning = false;
      navigateFunction(route);
    }
  },

  // Simple fade transition (faster)
  fadeToRoute: async (navigateFunction, route, options = {}) => {
    if (reactTransitionUtils.state.isTransitioning) {
      return;
    }

    const { duration = 0.3, onComplete = null } = options;
    reactTransitionUtils.state.isTransitioning = true;

    try {
      const container = document.getElementById('root') || document.body;
      
      // Fade out
      await gsap.to(container, {
        duration: duration,
        opacity: 0,
        scale: 0.98,
        ease: "power2.out"
      });

      // Navigate
      navigateFunction(route);

      // Fade in after route change
      setTimeout(() => {
        gsap.to(container, {
          duration: duration,
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          onComplete: () => {
            // IMPORTANT: Clear all inline styles to prevent conflicts
            gsap.set(container, { clearProps: "all" });
            reactTransitionUtils.state.isTransitioning = false;
            if (onComplete) onComplete();
          }
        });
      }, 50);

    } catch (error) {
      console.error('Fade transition failed:', error);
      reactTransitionUtils.state.isTransitioning = false;
      navigateFunction(route);
    }
  },

  // Button click handler
  createTransitionHandler: (navigateFunction, route, type = 'slide') => {
    return async (event) => {
      if (event) event.preventDefault();
      
      if (type === 'fade') {
        await reactTransitionUtils.fadeToRoute(navigateFunction, route);
      } else {
        await reactTransitionUtils.transitionToRoute(navigateFunction, route);
      }
    };
  },

  // Cleanup
  destroy: () => {
    reactTransitionUtils.state.isInitialized = false;
    reactTransitionUtils.state.isTransitioning = false;
  }
};

export default reactTransitionUtils;