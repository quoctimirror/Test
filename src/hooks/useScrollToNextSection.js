import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for scroll-to-next-section functionality
 * @param {Object} options - Configuration options
 * @param {string} options.footerSelector - CSS selector for footer section (default: '.footer')
 * @param {number} options.footerThreshold - Distance from footer to hide button (default: 100)
 * @param {boolean} options.scrollToEnd - If true, scroll to end of section instead of start (default: false)
 * @param {Array<string>} options.scrollToStartSections - Array of section names that should scroll to start even when scrollToEnd is true
 * @returns {Object} - { isArrowVisible, handleArrowClick }
 */
export const useScrollToNextSection = (options = {}) => {
  const {
    footerSelector = '.footer',
    footerThreshold = 100,
    scrollToEnd = false,
    scrollToStartSections = [],
  } = options;

  const [isArrowVisible, setIsArrowVisible] = useState(true);

  // Initial check on mount to handle page transitions
  useEffect(() => {
    // Small delay to ensure DOM is ready after page transition
    const timer = setTimeout(() => {
      const footerSections = document.querySelectorAll(footerSelector);

      if (footerSections.length > 0) {
        const scrollY = window.scrollY;
        let shouldHide = false;

        footerSections.forEach((footerSection) => {
          const rect = footerSection.getBoundingClientRect();
          const footerTop = scrollY + rect.top;

          if (scrollY >= footerTop - footerThreshold) {
            shouldHide = true;
          }
        });

        setIsArrowVisible(!shouldHide);
      } else {
        // If no footer found, show arrow
        setIsArrowVisible(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [footerSelector, footerThreshold]);

  // Handle arrow click - scroll to next section
  const handleArrowClick = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // Find all sections with data-section attribute
    const sections = Array.from(document.querySelectorAll('[data-section]'));

    if (scrollToEnd) {
      // Mode: Scroll to END of NEXT section
      const viewportTop = scrollY;
      let nextSection = null;
      let nextSectionIndex = -1;

      // Find the next section (first section below current viewport)
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        const sectionTop = scrollY + rect.top;

        // Next section is one that starts below current scroll position
        // (more than 100px below to avoid selecting current section)
        if (sectionTop > viewportTop + 100) {
          nextSection = section;
          nextSectionIndex = i;
          break;
        }
      }

      if (nextSection) {
        const rect = nextSection.getBoundingClientRect();
        const sectionTop = scrollY + rect.top;
        const sectionBottom = sectionTop + rect.height;
        const sectionName = nextSection.dataset.section;

        // Calculate target scroll position
        let targetScroll;

        // Check if this section should scroll to start instead of end
        if (scrollToStartSections.includes(sectionName)) {
          // Scroll to start of this section
          targetScroll = sectionTop;
        } else if (rect.height >= windowHeight) {
          // Section is taller than viewport: scroll to show its bottom
          targetScroll = sectionBottom - windowHeight;
        } else {
          // Section is shorter than viewport: scroll so bottom of section is at bottom of viewport
          targetScroll = sectionBottom - windowHeight;
          // But make sure we don't go below section top
          if (targetScroll < sectionTop) {
            targetScroll = sectionTop;
          }
        }

        window.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      } else {
        // No next section found, scroll one viewport
        window.scrollTo({
          top: scrollY + windowHeight,
          behavior: 'smooth'
        });
      }
    } else {
      // Default mode: Scroll to start of next section
      let nextSection = null;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();

        // If section top is more than 50px below viewport top, it's the next section
        if (rect.top > 50) {
          nextSection = section;
          break;
        }
      }

      // If found next section, scroll to it; otherwise scroll one viewport
      if (nextSection) {
        const rect = nextSection.getBoundingClientRect();
        const targetPosition = scrollY + rect.top;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        // No next section found, scroll one viewport
        window.scrollTo({
          top: scrollY + windowHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [scrollToEnd, scrollToStartSections]);

  // Hide arrow button when scrolled to footer
  useEffect(() => {
    const handleArrowVisibility = () => {
      // Support multiple selectors (comma-separated)
      const footerSections = document.querySelectorAll(footerSelector);

      if (footerSections.length > 0) {
        const scrollY = window.scrollY;
        let shouldHide = false;

        // Check all matching elements
        footerSections.forEach((footerSection) => {
          const rect = footerSection.getBoundingClientRect();
          const footerTop = scrollY + rect.top;

          // Hide arrow when we're within threshold of any footer top
          if (scrollY >= footerTop - footerThreshold) {
            shouldHide = true;
          }
        });

        setIsArrowVisible(!shouldHide);
      } else {
        // No footer found, always show
        setIsArrowVisible(true);
      }
    };

    // Listen for both scroll and page transition complete
    window.addEventListener('scroll', handleArrowVisibility, { passive: true });
    window.addEventListener('pageTransitionComplete', handleArrowVisibility);
    handleArrowVisibility(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleArrowVisibility);
      window.removeEventListener('pageTransitionComplete', handleArrowVisibility);
    };
  }, [footerSelector, footerThreshold]);

  return { isArrowVisible, handleArrowClick };
};
