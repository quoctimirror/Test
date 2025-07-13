import React, { useState, useRef } from 'react';
import './universe_section_1.css';
import './demo.css';

const UniverseSection = () => {
  const orbitRingSizes = {
    1: '30%', 2: '42%', 3: '54%', 4: '66%', 5: '78%'
  };

  const whitePlanetsData = [
    { name: 'presence', orbitRing: 2, angle: '89deg', size: 'clamp(12px, 1vw, 16px)', offsetX: -10, offsetY: 20 },
    { name: 'senses', orbitRing: 3, angle: '325deg', size: 'clamp(20px, 1.5vw, 30px)', offsetX: 8, offsetY: 14 },
    { name: 'time', orbitRing: 4, angle: '240deg', size: 'clamp(14px, 1.2vw, 20px)', offsetX: 15, offsetY: 28 },
    { name: 'space', orbitRing: 5, angle: '135deg', size: 'clamp(10px, 0.9vw, 14px)', offsetX: -10, offsetY: 28 },
  ];

  const BASE_SPEED = 20;
  const SPEED_INCREMENT = 5;
  const grayPlanetResponsiveSize = 'clamp(8px, 0.9vw, 12px)';
  const grayPlanets = [
    { orbitRing: 1, angle: '180deg', direction: 'clockwise' },
    { orbitRing: 2, angle: '45deg', direction: 'counter-clockwise' },
    { orbitRing: 3, angle: '210deg', direction: 'counter-clockwise' },
    { orbitRing: 4, angle: '310deg', direction: 'clockwise' },
    { orbitRing: 5, angle: '120deg', direction: 'counter-clockwise' }
  ];

  const [activePlanet, setActivePlanet] = useState(null);
  const [circleStyle, setCircleStyle] = useState({});
  const centerCircleRef = useRef(null);

  const handlePlanetClick = (event, planetName) => {
    event.stopPropagation();
    const clickedRect = event.currentTarget.getBoundingClientRect();
    if (!centerCircleRef.current) return;
    const centerRect = centerCircleRef.current.getBoundingClientRect();
    const clickedCenterX = clickedRect.left + clickedRect.width / 2;
    const clickedCenterY = clickedRect.top + clickedRect.height / 2;
    const targetCenterX = centerRect.left + centerRect.width / 2;
    const targetCenterY = centerRect.top + centerRect.height / 2;
    const dx = targetCenterX - clickedCenterX;
    const dy = targetCenterY - clickedCenterY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const normDx = length > 0 ? dx / length : 0;
    const normDy = length > 0 ? dy / length : 0;
    const originX = 50 + normDx * 40;
    const originY = 50 + normDy * 40;
    const clampedOriginX = Math.max(10, Math.min(90, originX));
    const clampedOriginY = Math.max(10, Math.min(90, originY));
    setCircleStyle({
      top: `${clickedRect.top}px`,
      left: `${clickedRect.left}px`,
      width: `${clickedRect.width}px`,
      height: `${clickedRect.height}px`,
      transformOrigin: `${clampedOriginX}% ${clampedOriginY}%`,
    });
    setTimeout(() => {
      setActivePlanet(planetName);
    }, 10);
  };

  const closeOverlay = (event) => {
    if (event.target === event.currentTarget || event.type === 'mouseleave') {
      setActivePlanet(null);
    }
  };

  return (
    <div className="universe-section">
      <div className="universe-container">
        <div className="orbit-system">
          <div className="orbit-ring orbit-ring-1"></div>
          <div className="orbit-ring orbit-ring-2"></div>
          <div className="orbit-ring orbit-ring-3"></div>
          <div className="orbit-ring orbit-ring-4"></div>
          <div className="orbit-ring orbit-ring-5"></div>

          {grayPlanets.map((planet, index) => {
            const speed = BASE_SPEED + (planet.orbitRing - 1) * SPEED_INCREMENT;
            const directionValue = planet.direction === 'clockwise' ? 'reverse' : 'normal';
            const initialAngleValue = parseFloat(planet.angle);
            const animationDelayValue = -(speed / 360) * initialAngleValue;
            const wrapperStyle = {
              '--orbit-size': orbitRingSizes[planet.orbitRing],
              '--orbit-duration': `${speed}s`,
              '--orbit-direction': directionValue,
              animationDelay: `${animationDelayValue}s`,
            };
            return (
              <div key={`gray-${index}`} className="planet-wrapper animated" style={wrapperStyle}>
                <div className="planet gray-planet" style={{ '--planet-size': grayPlanetResponsiveSize }}></div>
              </div>
            );
          })}

          {whitePlanetsData.map((planet) => {
            const angleDegrees = parseFloat(planet.angle);
            const offsetX = planet.offsetX || 0;
            const offsetY = planet.offsetY || 0;

            const labelStyle = {
              opacity: activePlanet ? 0 : 1,
              visibility: activePlanet ? 'hidden' : 'visible',
              transition: 'opacity 0.2s, visibility 0.2s',
              transform: `translateX(calc(-50% + ${offsetX}px)) translateY(calc(-15px + ${offsetY}px)) rotate(-${angleDegrees}deg)`,
            };

            return (
              <div
                key={planet.name}
                className="planet-wrapper static-planet-wrapper"
                style={{ '--orbit-size': orbitRingSizes[planet.orbitRing], '--orbit-angle': planet.angle }}
              >
                <div
                  className="planet white-planet clickable"
                  style={{ '--planet-size': planet.size, border: '1px solid white' }}
                  onClick={(e) => handlePlanetClick(e, planet.name)}
                >
                  <div className="planet-content" style={labelStyle}>
                    {planet.name.charAt(0).toUpperCase() + planet.name.slice(1)}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="center-circle" ref={centerCircleRef}>
            <div className="center-text">MIRROR<br />EXPERIENCE</div>
          </div>
        </div>
      </div>

      <div
        className={`senses-overlay ${activePlanet ? 'show' : ''}`}
        style={circleStyle}
        onClick={closeOverlay}
        onMouseLeave={closeOverlay}
      >
        <div className="senses-content-wrapper">
          {/* Render đường kẻ có điều kiện */}
          {activePlanet === 'senses' && <div className="internal-lines"></div>}

          {/* Giao diện cho "SENSES" */}
          {activePlanet === 'senses' && (
            <>
              <h2 className="senses-title">Senses</h2>
              <div className="senses-items">
                <div className="sense-item sight">Sight</div>
                <div className="sense-item touch">Touch</div>
                <div className="sense-item scent">Scent</div>
                <div className="sense-item sound">Sound</div>
                <div className="sense-item taste">Taste</div>
              </div>
            </>
          )}

          {/* Giao diện cho "SPACE" */}
          {activePlanet === 'space' && (
            <>
              {/* 4 đường line tạo thành 8 đỉnh */}
              <div className="cross-lines">
                <div className="line line-vertical"></div>
                <div className="line line-horizontal"></div>
                <div className="line line-diagonal-1"></div>
                <div className="line line-diagonal-2"></div>
              </div>

              <div className="space-content-container">
                <div className="space-description">
                  <p>Mirror moves with you — from glowing showrooms<br />
                    to calming spas, from salons to your personal screen.</p>

                  <p className="text-gray">
                    Wherever life takes you, we're there<br />
                    — seamlessly integrated, never intrusive.<br />
                    With immersive technology, we gently blur the line<br />
                    between digital and physical.<br />
                    Our jewelry isn't meant to be kept behind glass<br />
                    – it's made to belong with you, in every moment that matters.
                  </p>
                </div>

                {/* Chữ Space title */}
                <h2 className="senses-title space-title">Space</h2>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniverseSection;