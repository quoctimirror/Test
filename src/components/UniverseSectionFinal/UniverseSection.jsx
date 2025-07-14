// UniverseSection.jsx - Enhanced Version with Even Distribution
import React, { useState, useEffect } from 'react';
import './UniverseSection.css';
import WhitePlanet from './WhitePlanet';
import SpaceOverlay from './SpaceOverlay';
import BaseOverlay from './BaseOverlay';
import PresenceOverlay from './PresenceOverlay';
import TimeOverlay from './TimeOverlay';
import SensesOverlay from './SensesOverlay';

const UniverseSection = () => {
    const orbitRadii = { 1: '22.5%', 2: '31%', 3: '39.5%', 4: '48%', 5: '56.5%' };

    const whitePlanetsData = [
        { name: 'Presence', orbitRing: 2, angle: '8deg', size: 'clamp(16px, 1.3vw, 20px)' },
        { name: 'Senses', orbitRing: 3, angle: '225deg', size: 'clamp(30px, 2.1vw, 42px)' },
        { name: 'Time', orbitRing: 4, angle: '135deg', size: 'clamp(18px, 1.5vw, 26px)' },
        { name: 'Space', orbitRing: 5, angle: '45deg', size: 'clamp(22px, 1.8vw, 30px)' },
    ];

    const BASE_SPEED = 15;
    const SPEED_INCREMENT = 4;
    const grayPlanetResponsiveSize = 'clamp(10px, 1.1vw, 16px)';

    const grayPlanets = [
        { orbitRing: 1, direction: 'clockwise', pulseDuration: '2.5s', color: 'default' },
        { orbitRing: 2, direction: 'counter-clockwise', pulseDuration: '3.0s', color: 'blue-tint' },
        { orbitRing: 3, direction: 'clockwise', pulseDuration: '2.8s', color: 'purple-tint' },
        { orbitRing: 4, direction: 'counter-clockwise', pulseDuration: '3.2s', color: 'green-tint' },
        { orbitRing: 5, direction: 'clockwise', pulseDuration: '2.3s', color: 'orange-tint' }
    ];

    const [activePlanet, setActivePlanet] = useState(null);
    const [overlayStyle, setOverlayStyle] = useState({});
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handlePlanetClick = (event, planetName) => {
        // Ngăn click khi đang transition
        if (isTransitioning) return;

        const rect = event.currentTarget.getBoundingClientRect();
        setOverlayStyle({
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
        });

        const planetLower = planetName.toLowerCase();
        
        // Nếu click vào cùng một planet đang active, đóng overlay
        if (activePlanet === planetLower) {
            closeOverlay();
            return;
        }

        // Set transition state và mở overlay mới
        setIsTransitioning(true);
        setActivePlanet(planetLower);
        
        // Clear transition state sau khi animation hoàn thành
        setTimeout(() => {
            setIsTransitioning(false);
        }, 700); // Match với CSS transition duration
    };

    const closeOverlay = () => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        setActivePlanet(null);
        
        // Clear transition state sau khi close animation hoàn thành
        setTimeout(() => {
            setIsTransitioning(false);
        }, 700);
    };

    // ✨ =================================================================== ✨
    // ✨                        THÊM LOGIC XỬ LÝ ESCAPE                      ✨
    // ✨ =================================================================== ✨
    useEffect(() => {
        // Định nghĩa hàm xử lý sự kiện keydown
        const handleKeyDown = (event) => {
            // Kiểm tra nếu phím được nhấn là 'Escape'
            if (event.key === 'Escape') {
                closeOverlay(); // Gọi hàm đóng overlay
            }
        };

        // Thêm event listener vào document khi component được mount
        document.addEventListener('keydown', handleKeyDown);

        // Hàm dọn dẹp: Xóa event listener khi component unmount
        // Điều này cực kỳ quan trọng để tránh memory leaks.
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // Mảng rỗng `[]` đảm bảo effect này chỉ chạy một lần khi component mount.
    // ✨ =================================================================== ✨

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
                        const directionValue = planet.direction === 'clockwise' ? 'reverse' : 'normal';

                        // ✨ [THAY ĐỔI] Tính toán delay âm để rải đều các hành tinh ✨
                        // Logic: Chia vòng tròn cho số hành tinh và đặt vị trí bắt đầu bằng delay âm.
                        const startOffsetDelay = - (speed * (index / grayPlanets.length));

                        const planetStyle = {
                            '--orbit-radius': orbitRadii[planet.orbitRing],
                            '--orbit-duration': `${speed}s`,
                            '--orbit-direction': directionValue,
                            '--planet-size': grayPlanetResponsiveSize,
                            '--pulse-duration': planet.pulseDuration,
                            // Áp dụng delay âm
                            animationDelay: `${startOffsetDelay}s`,
                        };

                        return (
                            <div
                                key={`gray-${index}`}
                                className={`planet gray-planet animated ${planet.color}`}
                                style={planetStyle}
                                title={`Gray Planet ${index + 1}`}
                            ></div>
                        );
                    })}

                    <div className="center-circle">
                        <div className="center-text">MIRROR<br />EXPERIENCE</div>
                    </div>
                </div>
            </div>

            <PresenceOverlay
                isActive={activePlanet === 'presence'}
                overlayStyle={overlayStyle}
                onClose={closeOverlay}
            />

            <SpaceOverlay
                isActive={activePlanet === 'space'}
                overlayStyle={overlayStyle}
                onClose={closeOverlay}
            />

            <TimeOverlay
                isActive={activePlanet === 'time'}
                overlayStyle={overlayStyle}
                onClose={closeOverlay}
            />

            <SensesOverlay
                isActive={activePlanet === 'senses'}
                overlayStyle={overlayStyle}
                onClose={closeOverlay}
            />


            {/* <BaseOverlay
                isActive={activePlanet === 'space'}
                overlayStyle={overlayStyle}
                onClose={closeOverlay}
            /> */}
        </div>
    );
};

export default UniverseSection;