import React, { useState, useEffect } from 'react';
import './MirrorExp.css';
import SensesOverlay2 from './SensesOverlay2';
import PresenceOverlay2 from './PresenceOverlay2';
import TimeOverlay from './TimeOverlay';
import SpaceOverlay from './SpaceOverlay';



const MirrorExp = () => {
    const [showCircle, setShowCircle] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [showDroplet, setShowDroplet] = useState(false);
    const [showRect, setShowRect] = useState(false);
    const [circleOrigin, setCircleOrigin] = useState({ x: 0, y: 0 });
    const [heartOrigin, setHeartOrigin] = useState({ x: 0, y: 0 });
    const [dropletOrigin, setDropletOrigin] = useState({ x: 0, y: 0 });
    const [rectOrigin, setRectOrigin] = useState({ x: 0, y: 0 });

    const handleOpenCircle = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setCircleOrigin({ x: centerX, y: centerY });
        setShowCircle(true);
    };

    const handleCloseCircle = () => {
        setShowCircle(false);
    };

    const handleOpenHeart = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setHeartOrigin({ x: centerX, y: centerY });
        setShowHeart(true);
    };

    const handleCloseHeart = () => {
        setShowHeart(false);
    };

    const handleOpenDroplet = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setDropletOrigin({ x: centerX, y: centerY });
        setShowDroplet(true);
    };

    const handleCloseDroplet = () => {
        setShowDroplet(false);
    };

    const handleOpenRect = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setRectOrigin({ x: centerX, y: centerY });
        setShowRect(true);
    };

    const handleCloseRect = () => {
        setShowRect(false);
    };

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setShowCircle(false);
                setShowHeart(false);
                setShowDroplet(false);
                setShowRect(false);
            }
        };

        if (showCircle || showHeart || showDroplet || showRect) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showCircle, showHeart, showDroplet, showRect]);

    const overlayStyle = {
        opacity: (showCircle || showHeart || showDroplet || showRect) ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: (showCircle || showHeart || showDroplet || showRect) ? 'none' : 'auto'
    };

    return (
        <>
            <div className="mirror-exp-container" style={{ display: (showCircle || showHeart || showDroplet || showRect) ? 'none' : 'flex' }}>
                <div className="bodytext1-section" style={overlayStyle}>
                    <span className="bodytext1">
                        Awakening luxury through your senses, in every time, space <br/>  
                        and presence.
                    </span>
                </div>
                <div className="layer layer5" style={overlayStyle}>
                    <img
                        src="/universeSection/layer5.png"
                        alt="Layer 5"
                    />
                    <img
                        src="/universeSection/meteoroid.svg"
                        alt="Meteoroid Layer 5-1"
                        className="meteoroid-layer-5 meteoroid-layer5-1"
                    />
                    <img
                        src="/universeSection/meteoroid.svg"
                        alt="Meteoroid Layer 5-2"
                        className="meteoroid-layer-5 meteoroid-layer5-2"
                    />
                    <img
                        src="/universeSection/meteoroid.svg"
                        alt="Meteoroid Layer 5-3"
                        className="meteoroid-layer-5 meteoroid-layer5-3"
                    />
                </div>
                <img
                    src="/universeSection/layer4.png"
                    alt="Layer 4"
                    className="layer layer4"
                    style={overlayStyle}
                />
                <img
                    src="/universeSection/layer3.png"
                    alt="Layer 3"
                    className="layer layer3"
                    style={overlayStyle}
                />
                <div className="layer layer2" style={overlayStyle}>
                    <img
                        src="/universeSection/layer2.png"
                        alt="Layer 2"
                    />
                    <img
                        src="/universeSection/meteoroid.svg"
                        alt="Meteoroid Layer 2"
                        className="meteoroid-layer-2 meteoroid-layer2-1"
                    />
                    <img
                        src="/universeSection/meteoroid.svg"
                        alt="Meteoroid Layer 2-2"
                        className="meteoroid-layer-2 meteoroid-layer2-2"
                    />
                </div>
                <div className="layer layer1" style={overlayStyle}>
                    <img
                        src="/universeSection/layer1.png"
                        alt="Layer 1"
                    />
                    <img
                        src="/universeSection/meteoroid.svg"
                        alt="Meteoroid 1"
                        className="meteoroid-layer-1 meteoroid-1"
                    />
                    <img
                        src="/universeSection/meteoroid.svg"
                        alt="Meteoroid 2"
                        className="meteoroid-layer-1 meteoroid-2"
                    />
                </div>
                <img
                    src="/universeSection/layer0.png"
                    alt="Layer 0"
                    className="layer layer0"
                    style={overlayStyle}
                />
                <img
                    src="/universeSection/mirror_experience_text.svg"
                    alt="Mirror Experience"
                    className="mirror-experience-text"
                    style={overlayStyle}
                />
                <div className="hover-wrapper circle-presence-wrapper">
                    <img
                        src="/universeSection/circle-presence.png"
                        alt="Circle Presence"
                        className="circle-presence"
                        onClick={handleOpenCircle}
                        style={{ ...overlayStyle, cursor: 'pointer' }}
                    />
                    <span className="hover-text">Presence</span>
                </div>
                <div className="hover-wrapper heart-senses-wrapper">
                    <img
                        src="/universeSection/heart-senses.png"
                        alt="Heart Senses"
                        className="heart-senses"
                        onClick={handleOpenHeart}
                        style={{ ...overlayStyle, cursor: 'pointer' }}
                    />
                    <span className="hover-text">Senses</span>
                </div>
                <div className="hover-wrapper droplet-time-wrapper">
                    <img
                        src="/universeSection/droplet-time.png"
                        alt="Droplet Time"
                        className="droplet-time"
                        onClick={handleOpenDroplet}
                        style={{ ...overlayStyle, cursor: 'pointer' }}
                    />
                    <span className="hover-text">Time</span>
                </div>
                <div className="hover-wrapper rect-space-wrapper">
                    <img
                        src="/universeSection/rect-space.png"
                        alt="Rect Space"
                        className="rect-space"
                        onClick={handleOpenRect}
                        style={{ ...overlayStyle, cursor: 'pointer' }}
                    />
                    <span className="hover-text">Space</span>
                </div>
            </div>
            {showCircle && (
                <div
                    className={`presence-overlay ${showCircle ? 'presence-overlay-open' : ''}`}
                    style={{
                        '--origin-x': `${circleOrigin.x}px`,
                        '--origin-y': `${circleOrigin.y}px`,
                        display: showCircle ? 'block' : 'none'
                    }}
                >
                    <PresenceOverlay2 />
                </div>
            )}
            {showHeart && (
                <div
                    className={`heart-overlay ${showHeart ? 'heart-overlay-open' : ''}`}
                    style={{
                        '--origin-x': `${heartOrigin.x}px`,
                        '--origin-y': `${heartOrigin.y}px`,
                        display: showHeart ? 'block' : 'none'
                    }}
                >
                    <SensesOverlay2 />
                </div>
            )}
            {showDroplet && (
                <div
                    className={`droplet-overlay ${showDroplet ? 'droplet-overlay-open' : ''}`}
                    style={{
                        '--origin-x': `${dropletOrigin.x}px`,
                        '--origin-y': `${dropletOrigin.y}px`,
                        display: showDroplet ? 'block' : 'none'
                    }}
                >
                    <TimeOverlay />
                </div>
            )}
            {showRect && (
                <div
                    className={`rect-overlay ${showRect ? 'rect-overlay-open' : ''}`}
                    style={{
                        '--origin-x': `${rectOrigin.x}px`,
                        '--origin-y': `${rectOrigin.y}px`,
                        display: showRect ? 'block' : 'none'
                    }}
                >
                    <SpaceOverlay />
                </div>
            )}
        </>
    );
};

export default MirrorExp;