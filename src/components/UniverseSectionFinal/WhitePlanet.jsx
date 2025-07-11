// WhitePlanet.jsx

import React from 'react';
import './WhitePlanet.css';

const WhitePlanet = ({ planets, orbitRadii }) => {
    return (
        <>
            {planets.map((planet) => {
                const radiusString = orbitRadii[planet.orbitRing];
                if (!radiusString) return null;

                const radiusValue = parseFloat(radiusString);

                // --- CẬP NHẬT TÍNH TOÁN VỊ TRÍ ---
                // ✨ Dùng parseFloat để lấy số từ chuỗi angle (ví dụ: '89deg' -> 89)
                const angleInDegrees = parseFloat(planet.angle);

                // Chuyển đổi góc từ độ sang radian để tính toán
                const angleInRad = (angleInDegrees * Math.PI) / 180;

                // Tính toán vị trí x và y
                const x = radiusValue * Math.cos(angleInRad);
                const y = radiusValue * Math.sin(angleInRad);

                // Tạo style inline để định vị hành tinh
                const planetStyle = {
                    left: `calc(50% + ${x}%)`,
                    top: `calc(50% + ${y}%)`,
                    // ✨ Sử dụng kích thước tùy chỉnh từ dữ liệu
                    '--planet-size': planet.size,
                };

                return (
                    <div
                        key={planet.name}
                        className="planet white-planet"
                        style={planetStyle}
                    >
                        <span className="planet-label">{planet.name}</span>
                    </div>
                );
            })}
        </>
    );
};

export default WhitePlanet;