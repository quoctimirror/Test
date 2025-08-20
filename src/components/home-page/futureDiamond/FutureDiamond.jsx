import { useEffect, useRef, useState } from "react";
import Logo from "@assets/images/Logo.svg";
import "./FutureDiamond.css";

const FutureDiamond = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const [textRevealProgress, setTextRevealProgress] = useState(0);
  
  const descText = "The world's newest diamond cut, a new star is born. Its 91 facets sparkle the brightest, emitting a fire like no other in a celebration of the constellations and the extraordinary potential of mankind.";

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !stickyRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));
      
      // Text reveal progress (starts at 50% of scroll)
      if (progress > 0.5) {
        const revealProgress = (progress - 0.5) / 0.5;
        setTextRevealProgress(Math.min(1, revealProgress));
      } else {
        setTextRevealProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="future-diamond" ref={containerRef}>
      <div className="future-diamond-content">
        <div className="future-diamond-logo-container">
          <img src={Logo} alt="Mirror Logo" className="future-diamond-logo" />
        </div>
        
        <h1 className="future-diamond-title">Future Diamond</h1>
        
        <div className="future-diamond-description-container">
          <div className="future-diamond-sticky-wrapper" ref={stickyRef}>
            <div className="future-diamond-description">
              <h1 className="heading-1--no-margin">
                {descText.split("").map((char, index) => {
                  const charProgress = (index + 1) / descText.length;
                  const isRevealed = textRevealProgress >= charProgress;
                  
                  return (
                    <span
                      key={index}
                      style={{
                        color: isRevealed ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
                        transition: 'color 0.05s ease'
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FutureDiamond;