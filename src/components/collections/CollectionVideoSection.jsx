import React, { useEffect, useRef } from "react";
import "./CollectionVideoSection.css";

const CollectionVideoSection = () => {
  const sectionRef = useRef(null);

  // Parallax effect for video background
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const windowHeight = window.innerHeight;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollDistance = windowHeight - rect.top;
      const totalDistance = windowHeight + rect.height;
      const scrollRatio = Math.max(0, Math.min(1, scrollDistance / totalDistance));

      // Background moves DOWN slowly (0% → 30%)
      const bgParallax = scrollRatio * 30;

      sectionRef.current.style.setProperty("--parallax-bg-offset", `${bgParallax}%`);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={sectionRef} className="collection-video-section" data-navbar-theme="white">
      {/* Sử dụng cùng background gif như trong Collection.css */}
      <div className="video-background"></div>
    </div>
  );
};

export default CollectionVideoSection;