import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for scroll-to-next-section functionality
 * @param {Object} options - Configuration options
 * @param {string} options.footerSelector - CSS selector for footer section (default: '.footer')
 * @param {number} options.footerThreshold - Distance from footer to hide button (default: 100)
 * @returns {Object} - { isArrowVisible, handleArrowClick }
 */
export const useScrollToNextSection = (options = {}) => {
  const {
    footerSelector = '.footer',
    footerThreshold = 100,
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

    // Find the first section that starts below current scroll position
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
  }, []);

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
