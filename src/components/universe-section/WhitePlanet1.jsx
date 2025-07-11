// src/components/universe-section/WhitePlanet1.jsx
import React, { useState } from 'react';

const WhitePlanet1 = ({
  planetData,
  index,
  orbitSize,
  speed,
  animationDelay,
  direction,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const wrapperStyle = {
    '--orbit-size': orbitSize,
    '--orbit-duration': `${speed}s`,
    '--orbit-direction': direction === 'clockwise' ? 'reverse' : 'normal',
    'animation-delay': `${animationDelay}s`,
    animationPlayState: isHovered ? 'paused' : 'running',
  };

  return (
    <div
      className={`planet-wrapper animated ${isHovered ? 'paused' : ''}`}
      style={wrapperStyle}
    >
      <div
        className="planet white-planet clickable"
        style={{
          '--planet-size': planetData.responsiveSize,
          position: 'relative',
          borderRadius: '50%', // Ensure hover area is circular
          overflow: 'visible' // Allow tooltip to show outside
        }}
        onMouseEnter={() => {
          console.log('WhitePlanet1 HOVER ENTER');
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          console.log('WhitePlanet1 HOVER LEAVE');
          setIsHovered(false);
        }}
        onClick={onClick}
      >
        {index + 1}
        <div className="planet-content">{planetData.content}</div>
      </div>
    </div>
  );
};

export default WhitePlanet1;