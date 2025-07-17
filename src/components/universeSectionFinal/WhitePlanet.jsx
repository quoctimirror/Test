// WhitePlanet.jsx

import React from 'react';
import './WhitePlanet.css';

const WhitePlanet = ({ planets, orbitRadii, onPlanetClick }) => {
    return (
        <>
            {planets.map((planet) => {
                const radiusString = orbitRadii[planet.orbitRing];
                if (!radiusString) return null;

                const radiusValue = parseFloat(radiusString);

                // Dùng parseFloat để lấy số từ chuỗi angle (ví dụ: '89deg' -> 89)
                const angleInDegrees = parseFloat(planet.angle);

                // Chuyển đổi góc từ độ sang radian để tính toán
                const angleInRad = (angleInDegrees * Math.PI) / 180;

                // Tính toán vị trí x và y
                const x = radiusValue * Math.cos(angleInRad);
                const y = radiusValue * Math.sin(angleInRad);

                // Tạo style inline để định vị hành tinh
                // Sử dụng 'width' và 'height' thay vì biến CSS để đảm bảo tính nhất quán
                const planetStyle = {
                    left: `calc(50% + ${x}%)`,
                    top: `calc(50% + ${y}%)`,
                    width: planet.size,
                    height: planet.size,
                };

                return (
                    <div
                        key={planet.name}
                        className="planet white-planet"
                        data-planet={planet.name}
                        style={planetStyle}
                        onClick={(e) => onPlanetClick && onPlanetClick(e, planet.name)}
                    >
                        <span className="planet-label">{planet.name}</span>
                    </div>
                );
            })}
        </>
    );
};

export default WhitePlanet;