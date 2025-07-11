// src/components/universe-section/WhitePlanet4.jsx
import React, { useState } from 'react';

const WhitePlanet4 = ({
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
          borderRadius: '50%',
          overflow: 'visible'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {index + 1}
        <div className="planet-content">{planetData.content}</div>
      </div>
    </div>
  );
};

export default WhitePlanet4;