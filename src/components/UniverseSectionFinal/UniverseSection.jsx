// UniverseSection.jsx

import React from 'react';
import './UniverseSection.css';
import WhitePlanet from './WhitePlanet';

const UniverseSection = () => {
    // Dữ liệu BÁN KÍNH quỹ đạo cho tất cả các hành tinh
    const orbitRadii = { 1: '15.2%', 2: '21%', 3: '27.5%', 4: '33.2%', 5: '39%' };

    // ✨ DỮ LIỆU MỚI CHO CÁC HÀNH TINH TRẮNG ✨
    const whitePlanetsData = [
        { name: 'Presence', orbitRing: 2, angle: '-2deg', size: 'clamp(12px, 1vw, 16px)' },
        { name: 'Senses', orbitRing: 3, angle: '235deg', size: 'clamp(20px, 1.5vw, 30px)' },
        { name: 'Time', orbitRing: 4, angle: '145deg', size: 'clamp(14px, 1.2vw, 20px)' },
        { name: 'Space', orbitRing: 5, angle: '55deg', size: 'clamp(10px, 0.9vw, 14px)' },
    ];

    // Dữ liệu hành tinh xám (giữ nguyên)
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

    return (
        <div className="universe-section">
            <div className="universe-container">
                <div className="orbit-system">
                    {/* Các vòng quỹ đạo */}
                    <div className="orbit-ring orbit-ring-1"></div>
                    <div className="orbit-ring orbit-ring-2"></div>
                    <div className="orbit-ring orbit-ring-3"></div>
                    <div className="orbit-ring orbit-ring-4"></div>
                    <div className="orbit-ring orbit-ring-5"></div>

                    {/* Hiển thị các hành tinh trắng tĩnh với dữ liệu mới */}
                    <WhitePlanet planets={whitePlanetsData} orbitRadii={orbitRadii} />

                    {/* Render các hành tinh xám chuyển động (giữ nguyên) */}
                    {grayPlanets.map((planet, index) => {
                        const speed = BASE_SPEED + (planet.orbitRing - 1) * SPEED_INCREMENT;
                        const directionValue = planet.direction === 'clockwise' ? 'reverse' : 'normal';

                        const planetStyle = {
                            '--orbit-radius': orbitRadii[planet.orbitRing],
                            '--orbit-duration': `${speed}s`,
                            '--orbit-direction': directionValue,
                            '--planet-size': grayPlanetResponsiveSize,
                        };

                        return (
                            <div
                                key={`gray-${index}`}
                                className="planet gray-planet animated"
                                style={planetStyle}
                            ></div>
                        );
                    })}

                    {/* Vòng tròn trung tâm */}
                    <div className="center-circle">
                        <div className="center-text">MIRROR<br />EXPERIENCE</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniverseSection;