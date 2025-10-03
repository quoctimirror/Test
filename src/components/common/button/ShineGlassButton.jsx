import React, { useRef, useEffect } from "react";
import "./ShineGlassButton.css";

const ShineGlassButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  width, // Optional - only use if explicitly needed
  height, // Optional - only use if explicitly needed
  fontSize, // Optional - only use if explicitly needed
  theme = "shine", // 'shine' | 'light' | 'footer'
  variant = "default", // 'default' | 'custom'
}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const shineLayer = button.querySelector(".shine-layer");
    if (!shineLayer) return;

    // Variables for smooth interpolation
    let currentX = 50;
    let currentY = 50;
    let targetX = 50;
    let targetY = 50;
    let animationFrame = null;

    // Lerp function for smooth interpolation
    const lerp = (start, end, factor) => start + (end - start) * factor;

    // Animation loop
    const updateShinePosition = () => {
      // Interpolate towards target position (0.15 = 15% per frame for smooth lag)
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);

      // Update CSS variables
      shineLayer.style.setProperty("--mouse-x", currentX + "%");
      shineLayer.style.setProperty("--mouse-y", currentY + "%");

      // Continue animation if there's still movement needed
      if (
        Math.abs(currentX - targetX) > 0.1 ||
        Math.abs(currentY - targetY) > 0.1
      ) {
        animationFrame = requestAnimationFrame(updateShinePosition);
      } else {
        animationFrame = null;
      }
    };

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update target position
      targetX = (x / rect.width) * 100;
      targetY = (y / rect.height) * 100;

      // Start animation if not already running
      if (!animationFrame) {
        animationFrame = requestAnimationFrame(updateShinePosition);
      }
    };

    const handleMouseEnter = (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set initial position
      targetX = (x / rect.width) * 100;
      targetY = (y / rect.height) * 100;
      currentX = targetX;
      currentY = targetY;

      // Set initial position immediately
      shineLayer.style.setProperty("--mouse-x", currentX + "%");
      shineLayer.style.setProperty("--mouse-y", currentY + "%");
    };

    const handleMouseLeave = () => {
      // Smoothly return to center
      targetX = 50;
      targetY = 50;

      // Continue animation to return to center
      if (!animationFrame) {
        animationFrame = requestAnimationFrame(updateShinePosition);
      }

      // Clean up animation after returning to center
      setTimeout(() => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }, 500);
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="shine-button-wrap">
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        className={`shine-glass-button shine-glass-button--${theme} shine-glass-button--variant-${variant} bodytext-4--no-margin ${className}`}
        style={{
          ...(width && { width: `${width}px` }),
          ...(height && { height: `${height}px` }),
          ...(fontSize && { fontSize: `${fontSize}px` }),
        }}
      >
        <div className="glass-layer"></div>
        <div className="shine-layer"></div>
        <span className="button-text bodytext-4--no-margin">{children}</span>
        <div className="border-layer"></div>
      </button>
    </div>
  );
};

export default ShineGlassButton;
