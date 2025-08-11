import React from 'react';
import './Button.css';

const themes = {
  default: {
    fill: 'rgba(0, 0, 0, 0.1)',
    stroke: 'rgba(0, 0, 0, 0.5)',
    textFill: 'rgba(0, 0, 0, 0.75)',
    hoverFill: 'rgba(0, 0, 0, 0.75)',
    hoverStroke: 'rgba(0, 0, 0, 0.8)',
    hoverTextFill: 'white'
  },
  white: {
    fill: 'rgba(255, 255, 255, 0.1)',
    stroke: 'rgba(255, 255, 255, 0.5)',
    textFill: 'white',
    hoverFill: 'rgba(255, 255, 255, 0.75)',
    hoverStroke: 'rgba(255, 255, 255, 0.8)',
    hoverTextFill: 'black'
  },
  pink: {
    fill: 'rgba(255, 255, 255, 0.1)',
    stroke: 'rgba(255, 255, 255, 0.5)',
    textFill: 'white',
    hoverFill: '#bc224c',
    hoverStroke: '#bc224c',
    hoverTextFill: 'white'
  },
  glass: {
    fill: 'rgba(255, 255, 255, 0.02)',
    stroke: 'rgba(255, 255, 255, 0.3)',
    textFill: 'white',
    hoverFill: 'rgba(255, 255, 255, 0.75)',
    hoverStroke: 'rgba(255, 255, 255, 0.5)',
    hoverTextFill: 'black'
  },
  outline: {
    fill: 'white',
    stroke: '#BC224C',
    textFill: '#BC224C',
    hoverFill: '#BC224C',
    hoverStroke: '#BC224C',
    hoverTextFill: 'white'
  }
};

const Button = ({ 
  children, 
  width = 189, 
  height = 57, 
  onClick, 
  className = '',
  textClassName = 'bodytext-4',
  theme = 'default'
}) => {
  const rx = height / 2;
  const currentTheme = themes[theme] || themes.default;

  return (
    <button 
      className={`common-button common-button--${theme} ${className}`} 
      onClick={onClick}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="0.5"
          width={width - 1}
          height={height - 1}
          rx={rx - 0.5}
          fill={currentTheme.fill}
          stroke={currentTheme.stroke}
          className="button-background"
        />
        <text
          x={width / 2}
          y={height / 2 + 5}
          textAnchor="middle"
          fill={currentTheme.textFill}
          className={`button-text ${textClassName}`}
        >
          {children}
        </text>
      </svg>
    </button>
  );
};

export default Button;