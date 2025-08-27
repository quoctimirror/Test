import React, { useRef, useEffect } from 'react';
import './ShineGlassButton.css';

const ShineGlassButton = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  width = 189,
  height = 57,
  fontSize = 14,
  theme = 'shine', // 'shine' | 'light' | 'footer'
  variant = 'default' // 'default' | 'custom'
}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to percentage
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      // Update CSS variables
      button.style.setProperty("--mouse-x", xPercent + "%");
      button.style.setProperty("--mouse-y", yPercent + "%");
    };

    const handleMouseLeave = () => {
      // Reset to center when mouse leaves
      button.style.setProperty("--mouse-x", "50%");
      button.style.setProperty("--mouse-y", "50%");
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
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
          width: `${width}px`,
          height: `${height}px`,
          fontSize: `${fontSize}px`
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