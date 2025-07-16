// ============== FILE: UniverseSection.jsx ==============
import React, { useState, useEffect } from "react";
import "./UniverseSection.css";
import WhitePlanet from "./WhitePlanet";
import SpaceOverlay from "./SpaceOverlay";
import PresenceOverlay from "./PresenceOverlay";
import TimeOverlay from "./TimeOverlay";
import SensesOverlay from "./SensesOverlay";

const UniverseSection = () => {
  // ✨ [CẬP NHẬT] Đồng bộ bán kính quỹ đạo với file CSS mới của bạn
  const orbitRadii = {
    1: "25%", // Tương ứng với width 50%
    2: "35%", // Tương ứng với width 70%
    3: "45%", // Tương ứng với width 90%
    4: "55%", // Tương ứng với width 110%
    5: "65%", // Tương ứng với width 130%
  };

  // ✨ [CẬP NHẬT] Thêm 'glowColor' và 'animationDelay' để tạo hiệu ứng chớp tắt riêng
  const whitePlanetsData = [
    {
      name: "Presence",
      orbitRing: 2,
      angle: "8deg",
      size: "clamp(18px, 2.5vw, 35px)",
      glowColor: "#23B3BB",
      animationDelay: "0s",
    },
    {
      name: "Senses",
      orbitRing: 3,
      angle: "225deg",
      size: "clamp(24px, 3.5vw, 45px)",
      glowColor: "#BB234C",
      animationDelay: "-1.2s",
    },
    {
      name: "Time",
      orbitRing: 4,
      angle: "135deg",
      size: "clamp(20px, 3vw, 40px)",
      glowColor: "#9D23BB",
      animationDelay: "-0.5s",
    },
    {
      name: "Space",
      orbitRing: 5,
      angle: "45deg",
      size: "clamp(16px, 2vw, 30px)",
      glowColor: "#2358BB",
      animationDelay: "-2.1s",
    },
  ];

  const BASE_SPEED = 15;
  const SPEED_INCREMENT = 4;
  const grayPlanetResponsiveSize = "clamp(10px, 1.1vw, 16px)";

  const grayPlanets = [
    { orbitRing: 1, direction: "clockwise", pulseDuration: "2.5s" },
    { orbitRing: 2, direction: "counter-clockwise", pulseDuration: "3.0s" },
    { orbitRing: 3, direction: "clockwise", pulseDuration: "2.8s" },
    { orbitRing: 4, direction: "counter-clockwise", pulseDuration: "3.2s" },
    { orbitRing: 5, direction: "clockwise", pulseDuration: "2.3s" },
  ];

  const [activePlanet, setActivePlanet] = useState(null);
  const [overlayStyle, setOverlayStyle] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePlanetClick = (event, planetName) => {
    if (isTransitioning) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setOverlayStyle({
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    const planetLower = planetName.toLowerCase();
    if (activePlanet === planetLower) {
      closeOverlay();
      return;
    }
    setIsTransitioning(true);
    setActivePlanet(planetLower);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const closeOverlay = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActivePlanet(null);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeOverlay();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="universe-section">
      <div className="universe-container">
        <div className="orbit-system">
          <div className="orbit-ring orbit-ring-1"></div>
          <div className="orbit-ring orbit-ring-2"></div>
          <div className="orbit-ring orbit-ring-3"></div>
          <div className="orbit-ring orbit-ring-4"></div>
          <div className="orbit-ring orbit-ring-5"></div>

          <WhitePlanet
            planets={whitePlanetsData}
            orbitRadii={orbitRadii}
            onPlanetClick={handlePlanetClick}
          />

          {grayPlanets.map((planet, index) => {
            const speed = BASE_SPEED + (planet.orbitRing - 1) * SPEED_INCREMENT;
            const directionValue =
              planet.direction === "clockwise" ? "reverse" : "normal";
            const startOffsetDelay = -(speed * (index / grayPlanets.length));

            const planetStyle = {
              "--orbit-radius": orbitRadii[planet.orbitRing],
              "--orbit-duration": `${speed}s`,
              "--orbit-direction": directionValue,
              "--planet-size": grayPlanetResponsiveSize,
              "--pulse-duration": planet.pulseDuration,
              animationDelay: `${startOffsetDelay}s`,
            };

            return (
              <div
                key={`gray-${index}`}
                className="planet gray-planet animated"
                style={planetStyle}
                title={`Gray Planet ${index + 1}`}
              ></div>
            );
          })}

          <div className="center-circle">
            <div className="center-text">
              MIRROR
              <br />
              EXPERIENCE
            </div>
          </div>
        </div>
      </div>

      <PresenceOverlay
        isActive={activePlanet === "presence"}
        overlayStyle={overlayStyle}
        onClose={closeOverlay}
      />
      <SpaceOverlay
        isActive={activePlanet === "space"}
        overlayStyle={overlayStyle}
        onClose={closeOverlay}
      />
      <TimeOverlay
        isActive={activePlanet === "time"}
        overlayStyle={overlayStyle}
        onClose={closeOverlay}
      />
      <SensesOverlay
        isActive={activePlanet === "senses"}
        overlayStyle={overlayStyle}
        onClose={closeOverlay}
      />
    </div>
  );
};

export default UniverseSection;
