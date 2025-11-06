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

      const navbarPosition = 80; // Navbar position from top
      let activeSection = null;

      // Find the LAST section whose bottom hasn't passed the navbar yet
      // This means: keep the current section's theme until we completely scroll past it
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();

        // If section's bottom is still below navbar position,
        // this section is still "active" (we haven't scrolled past it yet)
        if (rect.bottom > navbarPosition && rect.top < navbarPosition) {
          // Navbar is inside this section
          activeSection = section;
        } else if (rect.bottom <= navbarPosition && !activeSection) {
          // This section has completely passed, but no section found yet
          // Keep looking for the next section
        }
      });

      // If no section found (between sections), find the closest upcoming section
      if (!activeSection) {
        let closestSection = null;
        let minDistance = Infinity;

        sections.forEach(section => {
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

      const newObserver = new IntersectionObserver(observerCallback, observerOptions);

      sections.forEach((section) => {
        newObserver.observe(section);
      });

      return newObserver;
    };

    // Setup with fewer retries for faster initialization
    const retryDelays = [0, 100, 300];
    retryDelays.forEach(delay => {
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
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check immediately
    checkVisibleSection();

    // Cleanup
    return () => {
      retryTimeouts.forEach(clearTimeout);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      window.removeEventListener('scroll', handleScroll);
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
