import React, { useEffect, useRef, useState } from "react";
import "./InroBOD.css";

const InroBOD = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !stickyRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;

      // Calculate scroll progress within the sticky container (0 to 1)
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));

      // Phase 1 (0-50% scroll): intro-text xuất hiện từ dưới lên
      if (progress <= 0.5) {
        const textProgress = Math.max(0, Math.min(1, progress / 0.5));

        if (line1Ref.current) {
          const translateY = Math.max(-100, 400 - textProgress * 500);
          line1Ref.current.style.transform = `translateY(${translateY}px)`;
          line1Ref.current.style.opacity = Math.min(1, textProgress * 2);
        }

        if (line2Ref.current) {
          const translateY = Math.max(-80, 500 - textProgress * 580);
          line2Ref.current.style.transform = `translateY(${translateY}px)`;
          line2Ref.current.style.opacity = Math.min(1, textProgress * 2);
        }

        if (line3Ref.current) {
          const translateY = Math.max(-60, 600 - textProgress * 660);
          line3Ref.current.style.transform = `translateY(${translateY}px)`;
          line3Ref.current.style.opacity = Math.min(1, textProgress * 2);
        }
      }

      // Phase 2 (50-100% scroll): intro-description xuất hiện từ dưới lên
      const descProgress =
        progress > 0.5 ? Math.max(0, Math.min(1, (progress - 0.5) / 0.5)) : 0;

      if (descRef.current) {
        const translateY = Math.max(0, 700 - descProgress * 700);
        descRef.current.style.transform = `translateY(${translateY}px)`;
        descRef.current.style.opacity = Math.min(1, descProgress * 2);
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
              className="heading-1--no-margin intro-line intro-line-1"
              ref={line1Ref}
            >
              THE MINDS
            </h1>
            <h1
              className="heading-1--no-margin intro-line intro-line-2"
              ref={line2Ref}
            >
              BEHIND
            </h1>
            <h1
              className="heading-1--no-margin intro-line intro-line-3"
              ref={line3Ref}
            >
              MIRROR
            </h1>
          </div>

          {/* Description text */}
          <div className="intro-description" ref={descRef}>
            <p className="bodytext-1--no-margin">
              Mirror is led by a{" "}
              <span className="light-text">
                collective of visionaries, blending innovation
              </span>
              <br />
              <span className="light-text">with deep human insight to</span>
              <span className="light-text">
                craft extraordinary experiences
              </span>
              <br />
              <span className="light-text">
                rooted in love, craft, and meaningful connections.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InroBOD;
