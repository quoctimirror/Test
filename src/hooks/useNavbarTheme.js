import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to manage navbar theme based on scrolling sections
 *
 * Supports per-section theme configuration with responsive breakpoints:
 * - data-navbar-theme: Default theme for all devices
 * - data-navbar-theme-mobile: Theme for mobile (≤425px)
 * - data-navbar-theme-tablet: Theme for tablet (426px-1023px)
 * - data-navbar-theme-desktop: Theme for desktop (≥1024px)
 *
 * Theme values:
 * - "white": White text/icons (for dark backgrounds)
 * - "black": Black text/icons (for light backgrounds)
 * - "blend": Mix-blend-mode difference (default)
 *
 * Usage:
 * Add to any section in your page:
 * <section data-navbar-theme-mobile="white" data-navbar-theme-desktop="black">
 *   Your content here
 * </section>
 */
export const useNavbarTheme = () => {
  const [currentTheme, setCurrentTheme] = useState("blend");
  const [breakpoint, setBreakpoint] = useState("desktop");
  const location = useLocation();

  // Detect current breakpoint
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width <= 425) {
        setBreakpoint("mobile");
      } else if (width <= 1023) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  // Detect sections and apply theme
  useEffect(() => {
    let intersectionObserver = null;
    let mutationObserver = null;
    let retryTimeouts = [];
    let scrollTimeout = null;

    // Fast scroll-based detection
    const checkVisibleSection = () => {
      const sections = document.querySelectorAll("[data-navbar-theme]");
      if (sections.length === 0) return;

      const navbarPosition = 40; // Navbar position from top
      let activeSection = null;

      // Separate footer from other sections
      const footerSections = [];
      const normalSections = [];

      Array.from(sections).forEach(section => {
        if (section.tagName === 'FOOTER' || section.classList.contains('footer')) {
          footerSections.push(section);
        } else {
          normalSections.push(section);
        }
      });

      // Build list of candidates
      const candidates = [];

      // First, check normal sections (higher priority)
      normalSections.forEach((section) => {
        const rect = section.getBoundingClientRect();

        // If navbar is within this section's bounds
        if (rect.top <= navbarPosition && rect.bottom > navbarPosition) {
          const computedStyle = window.getComputedStyle(section);
          const position = computedStyle.position;
          const zIndex = parseInt(computedStyle.zIndex) || 0;

          candidates.push({ section, position, zIndex, isFooter: false });
        }
      });

      // If no normal section found, check footer (lowest priority)
      if (candidates.length === 0) {
        footerSections.forEach((section) => {
          const rect = section.getBoundingClientRect();

          // Check if footer is visible in viewport (revealed)
          // Footer should be considered active when it's revealed (top is in viewport)
          if (rect.top < window.innerHeight && rect.bottom > navbarPosition) {
            const computedStyle = window.getComputedStyle(section);
            const position = computedStyle.position;
            const zIndex = parseInt(computedStyle.zIndex) || 0;

            candidates.push({ section, position, zIndex, isFooter: true });
          }
        });
      }

      // Sort candidates by priority:
      // 1. Normal sections first (isFooter: false)
      // 2. Among normal sections: positioned with higher z-index first
      // 3. Footer sections last (isFooter: true)
      if (candidates.length > 0) {
        candidates.sort((a, b) => {
          // Footer always loses to normal sections
          if (!a.isFooter && b.isFooter) return -1;
          if (a.isFooter && !b.isFooter) return 1;

          // Both are same type, check positioning
          const aIsPositioned = a.position !== 'static';
          const bIsPositioned = b.position !== 'static';

          // Both positioned: compare z-index
          if (aIsPositioned && bIsPositioned) {
            return b.zIndex - a.zIndex; // Higher z-index first
          }

          // Only one positioned: positioned wins
          if (aIsPositioned && !bIsPositioned) return -1;
          if (!aIsPositioned && bIsPositioned) return 1;

          // Both static: keep DOM order (already sorted)
          return 0;
        });

        // Pick first (highest priority)
        activeSection = candidates[0].section;
      }

      // If no section found (between sections), find the closest upcoming section
      if (!activeSection) {
        let closestSection = null;
        let minDistance = Infinity;

        // Check normal sections first
        normalSections.forEach((section) => {
          const rect = section.getBoundingClientRect();

          // Find section that's coming up (top is below navbar)
          if (rect.top >= navbarPosition) {
            const distance = rect.top - navbarPosition;
            if (distance < minDistance) {
              minDistance = distance;
              closestSection = section;
            }
          }
        });

        // If no normal section upcoming, check footer
        if (!closestSection) {
          footerSections.forEach((section) => {
            const rect = section.getBoundingClientRect();

            // Find section that's coming up (top is below navbar)
            if (rect.top >= navbarPosition) {
              const distance = rect.top - navbarPosition;
              if (distance < minDistance) {
                minDistance = distance;
                closestSection = section;
              }
            }
          });
        }

        activeSection = closestSection;
      }

      if (activeSection) {
        const theme =
          activeSection.getAttribute(`data-navbar-theme-${breakpoint}`) ||
          activeSection.getAttribute("data-navbar-theme") ||
          "blend";

        setCurrentTheme(theme);
      }
    };

    // Throttled scroll handler for instant feedback
    const handleScroll = () => {
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(() => {
        checkVisibleSection();
        scrollTimeout = null;
      }, 50); // Check every 50ms max
    };

    const setupIntersectionObserver = () => {
      const sections = document.querySelectorAll("[data-navbar-theme]");

      if (sections.length === 0) {
        setCurrentTheme("blend");
        return null;
      }

      const observerOptions = {
        root: null,
        rootMargin: "-80px 0px 0px 0px", // Trigger based on navbar position (80px from top)
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], // Multiple thresholds to catch when section passes navbar
      };

      const observerCallback = (entries) => {
        // Use the same logic as scroll handler for consistency
        checkVisibleSection();
      };

      // Disconnect old observer if exists
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }

      const newObserver = new IntersectionObserver(
        observerCallback,
        observerOptions
      );

      sections.forEach((section) => {
        newObserver.observe(section);
      });

      return newObserver;
    };

    // Setup with fewer retries for faster initialization
    const retryDelays = [0, 100, 300];
    retryDelays.forEach((delay) => {
      const timeoutId = setTimeout(() => {
        intersectionObserver = setupIntersectionObserver();
      }, delay);
      retryTimeouts.push(timeoutId);
    });

    // Throttled mutation observer - only re-setup when needed
    let mutationTimeout = null;
    mutationObserver = new MutationObserver(() => {
      // Throttle to avoid too many re-setups
      if (mutationTimeout) return;

      mutationTimeout = setTimeout(() => {
        const sections = document.querySelectorAll("[data-navbar-theme]");
        if (sections.length > 0) {
          intersectionObserver = setupIntersectionObserver();
          checkVisibleSection(); // Immediately check after DOM change
        }
        mutationTimeout = null;
      }, 200); // Wait 200ms before re-setup
    });

    // Observe the entire document for added nodes
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Add scroll listener for instant feedback
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check immediately
    checkVisibleSection();

    // Cleanup
    return () => {
      retryTimeouts.forEach(clearTimeout);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      window.removeEventListener("scroll", handleScroll);
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [breakpoint, location.pathname]); // Re-run when route changes

  return { theme: currentTheme, breakpoint };
};
