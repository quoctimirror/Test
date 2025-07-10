// src/components/UniverseSection.jsx

// ✨ BƯỚC 1: IMPORT 'useState' TỪ REACT ✨
import React, { useState } from 'react';
import './universe_section.css';

const UniverseSection = () => {
  // "Bản đồ" quỹ đạo (không đổi)
  const orbitRingSizes = {
    1: '30%', 2: '42%', 3: '54%', 4: '66%', 5: '78%'
  };
  // Dữ liệu hành tinh xám (không đổi)
  const grayPlanetResponsiveSize = 'clamp(8px, 0.9vw, 12px)';
  const grayPlanets = [
    { orbitRing: 2, angle: '195deg' },
    { orbitRing: 3, angle: '60deg' },
    { orbitRing: 5, angle: '-40deg' }
  ];

  // Bảng điều khiển đoàn tàu (không đổi)
  const TRAIN_SPEED = 20;
  const TRAIN_DIRECTION = 'counter-clockwise';
  const ANGLE_SEPARATION = 90;

  // Dữ liệu hành tinh trắng (không đổi)
  const whitePlanetsData = [
    { orbitRing: 2, responsiveSize: 'clamp(12px, 1vw, 16px)', content: "Data Analytics" },
    { orbitRing: 3, responsiveSize: 'clamp(20px, 1.5vw, 30px)', content: "AI & Machine Learning" },
    { orbitRing: 4, responsiveSize: 'clamp(14px, 1.2vw, 20px)', content: "Cloud Infrastructure" },
    { orbitRing: 5, responsiveSize: 'clamp(10px, 0.9vw, 14px)', content: "User Experience" },
  ];

  // ✨ BƯỚC 2: TẠO STATE ĐỂ LƯU LẠI HÀNH TINH ĐANG ĐƯỢC HOVER ✨
  // `null` có nghĩa là không có hành tinh nào được hover.
  const [hoveredPlanetIndex, setHoveredPlanetIndex] = useState(null);


  return (
    <div className="universe-section">
      <div className="universe-container">
        <div className="orbit-system">
          {/* Orbit rings */}
          <div className="orbit-ring orbit-ring-1"></div>
          <div className="orbit-ring orbit-ring-2"></div>
          <div className="orbit-ring orbit-ring-3"></div>
          <div className="orbit-ring orbit-ring-4"></div>
          <div className="orbit-ring orbit-ring-5"></div>

          {/* Render các hành tinh XÁM (tĩnh) */}
          {grayPlanets.map((planet, index) => (
            <div
              key={`gray-${index}`}
              className="planet-wrapper"
              style={{
                '--orbit-size': orbitRingSizes[planet.orbitRing],
                '--orbit-angle': planet.angle
              }}
            >
              <div
                className="planet gray-planet"
                style={{ '--planet-size': grayPlanetResponsiveSize }}
              ></div>
            </div>
          ))}

          {/* TỰ ĐỘNG RENDER ĐOÀN TÀU 4 HÀNH TINH */}
          {whitePlanetsData.map((planetData, index) => {
            const initialAngle = index * ANGLE_SEPARATION;
            const speed = TRAIN_SPEED + (planetData.orbitRing - 2) * 8;
            const animationDelay = -(speed / 360) * initialAngle;

            const wrapperStyle = {
              '--orbit-size': orbitRingSizes[planetData.orbitRing],
              '--orbit-duration': `${speed}s`,
              '--orbit-direction': TRAIN_DIRECTION === 'clockwise' ? 'reverse' : 'normal',
              'animation-delay': `${animationDelay}s`,

              // ✨ BƯỚC 3: ĐIỀU KHIỂN 'animationPlayState' BẰNG STATE ✨
              // Nếu index của hành tinh này TRÙNG với index đang được hover -> 'paused'
              // Nếu không -> 'running'
              animationPlayState: hoveredPlanetIndex === index ? 'paused' : 'running',
            };

            return (
              <div
                key={`white-${index}`}
                className="planet-wrapper animated"
                style={wrapperStyle}
                // ✨ BƯỚC 4: THÊM CÁC EVENT HANDLER ĐỂ CẬP NHẬT STATE ✨
                onMouseEnter={() => setHoveredPlanetIndex(index)}
                onMouseLeave={() => setHoveredPlanetIndex(null)}
              >
                <div
                  className="planet white-planet"
                  style={{ '--planet-size': planetData.responsiveSize }}
                >
                  {index + 1}
                  {/* Nội dung vẫn có thể hiển thị bằng CSS như cũ, 
                      hoặc bạn có thể điều khiển bằng state `hoveredPlanetIndex === index` */}
                  <div className="planet-content">{planetData.content}</div>
                </div>
              </div>
            );
          })}

          {/* Center circle */}
          <div className="center-circle">
            <div className="center-text">
              MIRROR<br />EXPERIENCE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniverseSection;