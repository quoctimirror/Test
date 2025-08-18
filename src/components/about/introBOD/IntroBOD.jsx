import React, { useEffect, useRef, useState } from "react";
import "./IntroBOD.css";

const IntroBOD = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const lineRef = useRef(null);
  const [textRevealProgress, setTextRevealProgress] = useState(0);
  const [descRevealProgress, setDescRevealProgress] = useState(0);
  const text = "THE MINDS BEHIND MIRROR";
  const descText = "Mirror is led by a collective of visionaries, blending innovation with deep human insight to craft extraordinary experiences rooted in love, craft, and meaningful connections.";
  const descRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !stickyRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;

      // Calculate scroll progress within the sticky container (0 to 1)
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));

      // Phase 1 (0-10% scroll): intro-text di chuyển từ dưới lên (đã hiển thị sẵn)
      const textMoveProgress = progress <= 0.1 ? Math.max(0, Math.min(1, progress / 0.1)) : 1;

      if (lineRef.current) {
        // Calculate initial translateY dynamically based on viewport
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        let topPosition, bottomGap;
        
        // Determine position based on screen size
        if (viewportWidth >= 1920 && viewportHeight >= 1080) {
          // Fixed pixels for 1920x1080
          const initialTranslateY = 590;
          const translateY = Math.max(0, initialTranslateY - textMoveProgress * initialTranslateY);
          lineRef.current.style.transform = `translateY(${translateY}px)`;
        } else {
          // Dynamic calculation for other screen sizes
          let gap, headerHeight;
          if (viewportWidth <= 480) {
            topPosition = 0.20;
            headerHeight = 10;  // Estimated header text height
            gap = 12;  // Gap after header
            bottomGap = 100;
          } else if (viewportWidth <= 768) {
            topPosition = 0.24;
            headerHeight = 12;
            gap = 16;
            bottomGap = 150;
          } else if (viewportWidth <= 992) {
            topPosition = 0.26;
            headerHeight = 12;
            gap = 18;
            bottomGap = 180;
          } else if (viewportWidth <= 1200) {
            topPosition = 0.28;
            headerHeight = 14;
            gap = 20;
            bottomGap = 160;
          } else if (viewportWidth <= 1440) {
            topPosition = 0.30;
            headerHeight = 14;
            gap = 22;
            bottomGap = 140;
          } else {
            topPosition = 0.32;
            headerHeight = 16;  // Estimated header text height
            gap = 24;  // Gap after header
            bottomGap = 150;
          }
          
          const finalTop = viewportHeight * topPosition + headerHeight + gap;
          const initialTop = viewportHeight - bottomGap;
          const totalDistance = Math.max(0, initialTop - finalTop);
          
          const translateY = Math.max(0, totalDistance - textMoveProgress * totalDistance);
          lineRef.current.style.transform = `translateY(${translateY}px)`;
        }
        
        lineRef.current.style.opacity = 1; // Always visible
      }
      
      // Phase 2 (10-30% scroll): Text reveal effect
      if (progress > 0.1 && progress <= 0.3) {
        const revealProgress = (progress - 0.1) / 0.2; // 0 to 1 over 20% scroll
        setTextRevealProgress(revealProgress);
      } else if (progress > 0.3) {
        setTextRevealProgress(1);
      }

      // Phase 3 (30-40% scroll): intro-description animation (after text reveal is complete)
      const descMoveProgress = progress > 0.3 && progress <= 0.4 
        ? Math.max(0, Math.min(1, (progress - 0.3) / 0.1)) 
        : progress > 0.4 ? 1 : 0;

      if (descRef.current) {
        // Show description when text movement is complete (10% scroll)
        const descOpacity = textMoveProgress >= 1 ? 1 : 0;
        
        // Calculate responsive gap and animation
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        let gap;
        
        if (viewportWidth >= 1920 && viewportHeight >= 1080) {
          // Fixed calculation for 1920x1080
          const initialTranslateY = 590; // Same as intro-text initial
          const finalTranslateY = 120; // 120px below intro-text final position
          const currentTranslateY = initialTranslateY - descMoveProgress * (initialTranslateY - finalTranslateY);
          descRef.current.style.transform = `translateX(-50%) translateY(${currentTranslateY}px)`;
        } else {
          // Dynamic calculation for other screen sizes
          if (viewportWidth <= 480) {
            gap = 50; // Responsive gap
          } else if (viewportWidth <= 768) {
            gap = 70;
          } else if (viewportWidth <= 992) {
            gap = 80;
          } else if (viewportWidth <= 1200) {
            gap = 90;
          } else if (viewportWidth <= 1440) {
            gap = 100;
          } else {
            gap = 120; // Default 120px gap
          }
          
          // Calculate initial and final positions for description
          const initialBottomGap = viewportWidth <= 480 ? 100 : 
                                   viewportWidth <= 768 ? 150 :
                                   viewportWidth <= 992 ? 180 :
                                   viewportWidth <= 1200 ? 160 :
                                   viewportWidth <= 1440 ? 140 : 150;
          
          const initialTranslateY = viewportHeight - initialBottomGap - (viewportHeight * 0.32 + 16 + 24);
          const finalTranslateY = gap; // Gap below intro-text
          
          const currentTranslateY = Math.max(finalTranslateY, initialTranslateY - descMoveProgress * (initialTranslateY - finalTranslateY));
          descRef.current.style.transform = `translateX(-50%) translateY(${currentTranslateY}px)`;
        }
        
        descRef.current.style.opacity = descOpacity;
      }
      
      // Phase 4 (40-100% scroll): Description text reveal
      if (progress > 0.4) {
        const revealProgress = (progress - 0.4) / 0.6; // 0 to 1 over 60% scroll
        setDescRevealProgress(Math.min(1, revealProgress));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="intro-bod-section" ref={containerRef}>
      <div className="intro-sticky-wrapper" ref={stickyRef}>
        <div className="intro-content">
          {/* WHO WE ARE cố định */}
          <div className="intro-header">
            <span className="bodytext-3--no-margin">WHO WE ARE</span>
          </div>

          {/* Text với parallax scrolling từ dưới lên */}
          <div className="intro-text">
            <h1
              className="heading-1--no-margin intro-line"
              ref={lineRef}
            >
              <span className="text-reveal-wrapper">
                {text.split("").map((char, index) => {
                  const charProgress = (index + 1) / text.length; // +1 so first char starts at progress > 0
                  const isRevealed = textRevealProgress >= charProgress;
                  
                  return (
                    <span
                      key={index}
                      className={`text-reveal-char ${isRevealed ? 'revealed' : ''}`}
                      style={{
                        color: isRevealed 
                          ? 'rgba(0, 0, 0, 1)' 
                          : 'rgba(0, 0, 0, 0.10)',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  );
                })}
              </span>
            </h1>
          </div>

          {/* Description text */}
          <div className="intro-description" ref={descRef}>
            <p className="bodytext-1--no-margin">
              {descText.split("").map((char, index) => {
                const charProgress = (index + 1) / descText.length; // +1 so first char starts at progress > 0
                const isRevealed = descRevealProgress >= charProgress;
                
                return (
                  <span
                    key={index}
                    className={`desc-reveal-char ${isRevealed ? 'revealed' : ''}`}
                    style={{
                      color: isRevealed 
                        ? 'rgba(0, 0, 0, 1)' 
                        : 'rgba(0, 0, 0, 0.10)',
                      transition: 'color 0.15s ease'
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroBOD;
