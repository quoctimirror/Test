import { useEffect, useRef } from "react";
import Logo from "@assets/images/Logo.svg";
import "./ScrollEffectTest.css";

export default function ScrollEffectTest() {
  const gradientTopRef = useRef(null);
  const gradientBottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      if (!containerRef.current || !gradientTopRef.current || !gradientBottomRef.current) {
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Calculate progress based on scroll (0 to 1)
      const maxScroll = windowHeight * 2; // 200vh scroll range
      const progress = Math.min(scrollY / maxScroll, 1);

      // Fade out gradient as user scrolls (1 to 0)
      const opacity = Math.max(1 - progress, 0);

      gradientTopRef.current.style.opacity = opacity;
      gradientBottomRef.current.style.opacity = opacity;

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="scroll-effect-test-container" ref={containerRef}>
      {/* Sticky viewport */}
      <div className="homepage">
        {/* Split gradients - fade out on scroll */}
        <div className="gradient-top-half">
          <div className="gradient-top" ref={gradientTopRef}></div>
        </div>
        <div className="gradient-bottom-half">
          <div className="gradient-bottom" ref={gradientBottomRef}></div>
        </div>

        {/* Logo in center */}
        <div className="logo-center">
          <img src={Logo} alt="Mirror Logo" className="main-logo" />
        </div>
      </div>
    </div>
  );
}
