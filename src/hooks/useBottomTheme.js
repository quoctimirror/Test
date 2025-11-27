import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to manage theme based on sections at the BOTTOM of the viewport
 * Used for elements positioned at the bottom of the screen (like scroll-down arrows)
 *
 * This is similar to useNavbarTheme but checks which section is at the bottom
 * of the viewport instead of the top.
 *
 * Theme values:
 * - "white": White text/icons (for dark backgrounds)
 * - "black": Black text/icons (for light backgrounds)
 * - "blend": Mix-blend-mode difference (default)
 */
export const useBottomTheme = () => {
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

  // Detect sections and apply theme based on bottom position
  useEffect(() => {
    let scrollTimeout = null;

    // Check which section is at the bottom of the viewport
    const checkVisibleSection = () => {
      const sections = document.querySelectorAll("[data-navbar-theme]");
      if (sections.length === 0) return;

      const windowHeight = window.innerHeight;
      // Position to check - bottom of viewport with some offset for the arrow button
      const bottomPosition = windowHeight - 80; // 80px from bottom where arrow sits

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

        // If the bottom check position is within this section's bounds
        if (rect.top <= bottomPosition && rect.bottom > bottomPosition) {
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

          // Check if footer is visible at the bottom position
          if (rect.top <= bottomPosition && rect.bottom > bottomPosition) {
            const computedStyle = window.getComputedStyle(section);
            const position = computedStyle.position;
            const zIndex = parseInt(computedStyle.zIndex) || 0;

            candidates.push({ section, position, zIndex, isFooter: true });
          }
        });
      }

      // Sort candidates by priority
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

          // Both static: keep DOM order
          return 0;
        });

        // Pick first (highest priority)
        activeSection = candidates[0].section;
      }

      // If no section found at bottom, find the closest section below
      if (!activeSection) {
        let closestSection = null;
        let minDistance = Infinity;

        // Check all sections
        [...normalSections, ...footerSections].forEach((section) => {
          const rect = section.getBoundingClientRect();

          // Find section that contains or is closest to bottom position
          if (rect.top >= bottomPosition) {
            const distance = rect.top - bottomPosition;
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

    // Throttled scroll handler
    const handleScroll = () => {
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(() => {
        checkVisibleSection();
        scrollTimeout = null;
      }, 50);
    };

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    checkVisibleSection();

    // Also check on resize (viewport height changes)
    window.addEventListener("resize", checkVisibleSection);

    // Cleanup
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkVisibleSection);
    };
  }, [breakpoint, location.pathname]);

  return { theme: currentTheme, breakpoint };
};
