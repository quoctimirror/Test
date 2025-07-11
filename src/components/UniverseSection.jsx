// src/components/UniverseSection.jsx

// ✨ BƯỚC 1: IMPORT 'useState' VÀ 'useRef' TỪ REACT ✨
import React, { useState, useRef } from 'react';
import WhitePlanet1 from './universe-section/WhitePlanet1';
import WhitePlanet2 from './universe-section/WhitePlanet2';
import WhitePlanet3 from './universe-section/WhitePlanet3';
import WhitePlanet4 from './universe-section/WhitePlanet4';
import './universe_section.css';
import './universe-section/demo.css';

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

  // ✨ STATE MỚI: Lưu style cho animation
  const [circleStyle, setCircleStyle] = useState({});
  const [isSensesVisible, setIsSensesVisible] = useState(false);

  // ✨ BƯỚC 2: TẠO REF CHO VÒNG TRÒN TRUNG TÂM
  const centerCircleRef = useRef(null);

  // ✨ BƯỚC 2: CẬP NHẬT HANDLER KHI CLICK HÀNH TINH với Transform Origin FIX
  const handlePlanetClick = (event) => {
    event.stopPropagation(); // Ngăn sự kiện nổi bọt

    // Lấy vị trí thực tế của planet tại thời điểm click (vị trí hiện tại)
    const clickedRect = event.currentTarget.getBoundingClientRect();
    
    // Lấy vị trí của vòng tròn trung tâm (mục tiêu cố định)
    if (!centerCircleRef.current) return;
    const centerRect = centerCircleRef.current.getBoundingClientRect();

    // --- LOGIC TÍNH TOÁN HƯỚNG CHÍNH XÁC ---

    // 1. Tính toán tâm thực tế của planet tại thời điểm click
    const clickedCenterX = clickedRect.left + clickedRect.width / 2;
    const clickedCenterY = clickedRect.top + clickedRect.height / 2;
    
    // 2. Tính toán tâm của center-circle (luôn cố định)
    const targetCenterX = centerRect.left + centerRect.width / 2;
    const targetCenterY = centerRect.top + centerRect.height / 2;

    // 3. Tính vector hướng từ vị trí click hiện tại đến center
    const dx = targetCenterX - clickedCenterX;
    const dy = targetCenterY - clickedCenterY;

    // 4. Chuẩn hóa vector để có hướng chuẩn
    const length = Math.sqrt(dx * dx + dy * dy);
    const normDx = length > 0 ? dx / length : 0;
    const normDy = length > 0 ? dy / length : 0;

    // 5. Tính transform-origin để circle nở VỀ PHÍA center
    // Logic: Nếu center ở bên phải của planet, origin sẽ ở bên phải của circle
    // Điều này làm cho circle expand từ bên phải về phía center
    const originX = 50 + normDx * 40; // Tăng từ 30% lên 40% để rõ ràng hơn
    const originY = 50 + normDy * 40;
    
    // Giới hạn origin trong khoảng hợp lý (10% - 90%)
    const clampedOriginX = Math.max(10, Math.min(90, originX));
    const clampedOriginY = Math.max(10, Math.min(90, originY));

    // --- KẾT THÚC LOGIC TÍNH TOÁN ---

    // Set style với vị trí click thực tế và transform-origin đã tính
    setCircleStyle({
      top: `${clickedRect.top}px`,
      left: `${clickedRect.left}px`,
      width: `${clickedRect.width}px`,
      height: `${clickedRect.height}px`,
      transformOrigin: `${clampedOriginX}% ${clampedOriginY}%`,
    });

    setTimeout(() => {
      setIsSensesVisible(true);
    }, 10);
  };

  // ✨ BƯỚC 3: CẬP NHẬT HANDLER ĐỂ ĐÓNG GIAO DIỆN
  const closeSensesInterface = (event) => {
    // Đóng khi click vào nền overlay hoặc mouse leave khỏi circle
    if (event.target === event.currentTarget || event.type === 'mouseleave') {
      setIsSensesVisible(false);
    }
  };



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
                "--orbit-size": orbitRingSizes[planet.orbitRing],
                "--orbit-angle": planet.angle,
              }}
            >
              <div
                className="planet gray-planet"
                style={{ "--planet-size": grayPlanetResponsiveSize }}
              ></div>
            </div>
          ))}

          {/* TỰ ĐỘNG RENDER ĐOÀN TÀU 4 HÀNH TINH */}
          {whitePlanetsData.map((planetData, index) => {
            const initialAngle = index * ANGLE_SEPARATION;
            const speed = TRAIN_SPEED + (planetData.orbitRing - 2) * 8;
            const animationDelay = -(speed / 360) * initialAngle;

            // Select the appropriate planet component based on index
            const PlanetComponents = [WhitePlanet1, WhitePlanet2, WhitePlanet3, WhitePlanet4];
            const PlanetComponent = PlanetComponents[index];

            return (
              <PlanetComponent
                key={`white-${index}`}
                planetData={planetData}
                index={index}
                orbitSize={orbitRingSizes[planetData.orbitRing]}
                speed={speed}
                animationDelay={animationDelay}
                direction={TRAIN_DIRECTION}
                onClick={handlePlanetClick}
              />
            );
          })}

          {/* Center circle */}
          <div 
            className="center-circle"
            ref={centerCircleRef}
          >
            <div className="center-text">
              MIRROR<br />EXPERIENCE
            </div>
          </div>

        </div>
      </div>

      {/* ✨ BƯỚC 4: CẤU TRÚC MỚI CHO HIỆU ỨNG VÀ GIAO DIỆN SENSES với Circle Grow */}
      <div
        className={`senses-overlay ${isSensesVisible ? 'show' : ''}`}
        style={circleStyle}
        onClick={closeSensesInterface}
      >
        <div 
          className="senses-content-wrapper"
          onMouseLeave={closeSensesInterface}
        >
          {/* Decorative white lines inside circle */}
          <div className="internal-lines">
            <div className="line line-vertical"></div>
            <div className="line line-horizontal"></div>
            <div className="line line-diagonal-1"></div>
            <div className="line line-diagonal-2"></div>
          </div>
          
          <h2 className="senses-title">Space</h2>
          <div className="senses-items">
            <div className="sense-item sight">Sight</div>
            <div className="sense-item touch">Touch</div>
            <div className="sense-item scent">Scent</div>
            <div className="sense-item sound">Sound</div>
            <div className="sense-item taste">Taste</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniverseSection;
