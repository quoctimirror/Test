import React from 'react';
import './GlassButton.css';

const GlassButton = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  width = 189,
  height = 57,
  fontSize = 14,
  theme = 'glass' // 'glass' | 'light'
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`glass-button glass-button--${theme} bodytext-4--no-margin ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${fontSize}px`
      }}
    >
      {children}
    </button>
  );
};

export default GlassButton;