import { useEffect, useRef, useId } from 'react';
import "./ScrollToTopArrow.css";

/**
 * ScrollToTopArrow component with glass surface effect and theme support
 * Similar to ScrollDownArrow but with arrow pointing up
 *
 * @param {string} className - Additional CSS classes
 * @param {string} theme - Theme variant: "white" | "black" | "blend" (default: "blend")
 * @param {function} onClick - Click handler
 */
const ScrollToTopArrow = ({
  className = '',
  theme = 'blend',
  onClick,
  size = 54,
  // Glass effect props
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 8,
  displace = 1,
  distortionScale = 100,
  redOffset = 0,
  greenOffset = 5,
  blueOffset = 10,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'screen',
  ...props
}) => {
  const uniqueId = useId().replace(/:/g, '-');
  const filterId = `glass-arrow-top-filter-${uniqueId}`;
  const redGradId = `red-grad-arrow-top-${uniqueId}`;
  const blueGradId = `blue-grad-arrow-top-${uniqueId}`;

  const containerRef = useRef(null);
  const feImageRef = useRef(null);
  const redChannelRef = useRef(null);
  const greenChannelRef = useRef(null);
  const blueChannelRef = useRef(null);
  const gaussianBlurRef = useRef(null);

  const generateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualSize = rect?.width || size;
    const edgeSize = actualSize * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualSize} ${actualSize}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualSize}" height="${actualSize}" fill="black"></rect>
        <circle cx="${actualSize / 2}" cy="${actualSize / 2}" r="${actualSize / 2}" fill="url(#${redGradId})" />
        <circle cx="${actualSize / 2}" cy="${actualSize / 2}" r="${actualSize / 2}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <circle cx="${actualSize / 2}" cy="${actualSize / 2}" r="${actualSize / 2 - edgeSize}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  };

  const updateDisplacementMap = () => {
    feImageRef.current?.setAttribute('href', generateDisplacementMap());
  };

  useEffect(() => {
    updateDisplacementMap();
    [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset }
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute('scale', (distortionScale + offset).toString());
        ref.current.setAttribute('xChannelSelector', xChannel);
        ref.current.setAttribute('yChannelSelector', yChannel);
      }
    });

    gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    size,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(updateDisplacementMap, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const handleScrollToTop = (e) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClick?.(e);
  };

  const supportsSVGFilters = () => {
    if (typeof navigator === 'undefined') return true;

    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isWebkit || isFirefox) {
      return false;
    }

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${filterId})`;
    return div.style.backdropFilter !== '';
  };

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    '--filter-id': `url(#${filterId})`
  };

  return (
    <button
      ref={containerRef}
      className={`scroll-to-top-arrow ${supportsSVGFilters() ? 'scroll-to-top-arrow--svg' : 'scroll-to-top-arrow--fallback'} scroll-to-top-arrow--${theme} ${className}`}
      style={containerStyle}
      aria-label="Scroll to top"
      onClick={handleScrollToTop}
      {...props}
    >
      <svg className="scroll-to-top-arrow__filter" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

            <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" result="dispRed" />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap ref={greenChannelRef} in="SourceGraphic" in2="map" result="dispGreen" />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" result="dispBlue" />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      {/* Arrow pointing UP (rotated 180 degrees from down arrow) */}
      <svg
        className="scroll-to-top-arrow__icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 15L12 8L19 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ScrollToTopArrow;
