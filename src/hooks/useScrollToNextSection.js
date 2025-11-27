import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for scroll-to-next-section functionality
 * @param {Object} options - Configuration options
 * @param {string} options.footerSelector - CSS selector for footer section (default: '.footer')
 * @param {number} options.footerThreshold - Distance from footer to hide button (default: 100)
 * @param {boolean} options.scrollToEnd - If true, scroll to end of section instead of start (default: false)
 * @param {Array<string>} options.scrollToStartSections - Array of section names that should scroll to start even when scrollToEnd is true
 * @param {Array<string>} options.scrollToEndSections - Array of section names that should scroll to end (e.g., ['contact-us'])
 * @returns {Object} - { isArrowVisible, handleArrowClick }
 */
export const useScrollToNextSection = (options = {}) => {
  const {
    footerSelector = '.footer',
    footerThreshold = 100,
    scrollToEnd = false,
    scrollToStartSections = [],
    scrollToEndSections = ['contact-us'], // Default: contact-us scrolls to end
  } = options;

  const [isArrowVisible, setIsArrowVisible] = useState(true);

  // Initial check on mount to handle page transitions
  useEffect(() => {
    // Small delay to ensure DOM is ready after page transition
    const timer = setTimeout(() => {
      const footerSections = document.querySelectorAll(footerSelector);

      if (footerSections.length > 0) {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        let shouldHide = false;

        footerSections.forEach((footerSection) => {
          const rect = footerSection.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(footerSection);
          const isFixed = computedStyle.position === 'fixed';

          if (isFixed) {
            // For fixed footer: check if near end of document
            const scrollableHeight = documentHeight - windowHeight;
            const revealStartPoint = scrollableHeight - windowHeight;

            if (scrollY >= revealStartPoint - footerThreshold) {
              shouldHide = true;
            }
          } else {
            // For normal footer: use standard calculation
            const footerTop = scrollY + rect.top;

            if (scrollY >= footerTop - footerThreshold) {
              shouldHide = true;
            }
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

        // Determine scroll behavior for this section
        const shouldScrollToEnd = scrollToEnd || scrollToEndSections.includes(sectionName);
        const shouldScrollToStart = scrollToStartSections.includes(sectionName);

        if (shouldScrollToStart) {
          // Explicitly scroll to start of this section
          targetScroll = sectionTop;
        } else if (shouldScrollToEnd) {
          // Scroll to end of section - bottom of section touches bottom of viewport
          targetScroll = sectionBottom - windowHeight;
        } else {
          // Default: scroll to start
          targetScroll = sectionTop;
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
      // Default mode: Scroll to start of next section (unless section is in scrollToEndSections)
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
        const sectionName = nextSection.dataset.section;
        const sectionTop = scrollY + rect.top;
        const sectionBottom = sectionTop + rect.height;

        let targetPosition;

        // Check if this section should scroll to end
        if (scrollToEndSections.includes(sectionName)) {
          // Scroll to end of section - bottom of section touches bottom of viewport
          targetPosition = sectionBottom - windowHeight;
        } else {
          // Default: scroll to top
          targetPosition = sectionTop;
        }

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
  }, [scrollToEnd, scrollToStartSections, scrollToEndSections]);

  // Hide arrow button when scrolled to footer
  useEffect(() => {
    const handleArrowVisibility = () => {
      // Support multiple selectors (comma-separated)
      const footerSections = document.querySelectorAll(footerSelector);

      if (footerSections.length > 0) {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        let shouldHide = false;

        // Check all matching elements
        footerSections.forEach((footerSection) => {
          const rect = footerSection.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(footerSection);
          const isFixed = computedStyle.position === 'fixed';

          let footerTop;

          if (isFixed) {
            // For fixed footer (reveal effect): hide when scrolled near end of document
            // Calculate when footer should be fully revealed
            const scrollableHeight = documentHeight - windowHeight;
            const revealStartPoint = scrollableHeight - windowHeight; // Start revealing one viewport before end

            // Hide arrow when we're near the reveal point
            if (scrollY >= revealStartPoint - footerThreshold) {
              shouldHide = true;
            }
          } else {
            // For normal positioned footer: use standard calculation
            footerTop = scrollY + rect.top;

            // Hide arrow when we're within threshold of any footer top
            if (scrollY >= footerTop - footerThreshold) {
              shouldHide = true;
            }
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
