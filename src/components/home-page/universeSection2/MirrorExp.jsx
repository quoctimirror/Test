import React, { useState, useEffect } from 'react';
import './MirrorExp.css';



const MirrorExp = () => {
    // Unified overlay state
    const [overlays, setOverlays] = useState({
        circle: { show: false, closing: false, origin: { x: 0, y: 0 } },
        heart: { show: false, closing: false, origin: { x: 0, y: 0 } },
        droplet: { show: false, closing: false, origin: { x: 0, y: 0 } },
        rect: { show: false, closing: false, origin: { x: 0, y: 0 } }
    });

    const [backgroundFaded, setBackgroundFaded] = useState(false);

    // Unified handlers
    const handleOpenOverlay = (overlayType) => (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        setOverlays(prev => ({
            ...prev,
            [overlayType]: {
                ...prev[overlayType],
                show: true,
                origin: { x: centerX, y: centerY }
            }
        }));
        setBackgroundFaded(true);
    };

    const handleCloseOverlay = (overlayType) => () => {
        setOverlays(prev => ({
            ...prev,
            [overlayType]: { ...prev[overlayType], closing: true }
        }));

        setTimeout(() => {
            setOverlays(prev => ({
                ...prev,
                [overlayType]: { show: false, closing: false, origin: { x: 0, y: 0 } }
            }));
            setBackgroundFaded(false);
        }, 800);
    };

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                Object.keys(overlays).forEach(overlayType => {
                    if (overlays[overlayType].show) {
                        handleCloseOverlay(overlayType)();
                    }
                });
            }
        };

        const anyOverlayOpen = Object.values(overlays).some(overlay => overlay.show);
        if (anyOverlayOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [overlays]);

    const overlayStyle = {
        opacity: backgroundFaded ? 0.2 : 1,
        filter: backgroundFaded ? 'blur(2px)' : 'blur(0px)',
        transition: 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pointerEvents: backgroundFaded ? 'none' : 'auto'
    };

    const clickableStyle = {
        opacity: 1,
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pointerEvents: 'auto',
        cursor: 'pointer'
    };

    // Helper function to render overlay
    const renderOverlay = (show, closing, origin, overlayClass, Component, onClose) => {
        if (!show) return null;

        return (
            <div
                className={`base-overlay ${overlayClass} ${show && !closing ? 'overlay-open' : ''} ${closing ? 'overlay-closing' : ''}`}
                style={{
                    '--origin-x': `${origin.x}px`,
                    '--origin-y': `${origin.y}px`,
                    display: show ? 'block' : 'none'
                }}
                onClick={onClose}
            >
                <Component />
            </div>
        );
    };

    return (
        <>
            <div className="mirror-exp-container">
                <div className="mirror-exp-scaled-container">
                    <div className="bodytext1-section" style={overlayStyle}>
                        <span className="bodytext1">
                            Awakening luxury through your senses, in every time, space <br />
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
                            onClick={handleOpenOverlay('circle')}
                            style={clickableStyle}
                        />
                        <span className="hover-text">Presence</span>
                    </div>
                    <div className="hover-wrapper heart-senses-wrapper">
                        <img
                            src="/universeSection/heart-senses.png"
                            alt="Heart Senses"
                            className="heart-senses"
                            onClick={handleOpenOverlay('heart')}
                            style={clickableStyle}
                        />
                        <span className="hover-text">Senses</span>
                    </div>
                    <div className="hover-wrapper droplet-time-wrapper">
                        <img
                            src="/universeSection/droplet-time.png"
                            alt="Droplet Time"
                            className="droplet-time"
                            onClick={handleOpenOverlay('droplet')}
                            style={clickableStyle}
                        />
                        <span className="hover-text">Time</span>
                    </div>
                    <div className="hover-wrapper rect-space-wrapper">
                        <img
                            src="/universeSection/rect-space.png"
                            alt="Rect Space"
                            className="rect-space"
                            onClick={handleOpenOverlay('rect')}
                            style={clickableStyle}
                        />
                        <span className="hover-text">Space</span>
                    </div>
                </div>
            </div>
            {/* {renderOverlay(overlays.circle.show, overlays.circle.closing, overlays.circle.origin, 'presence-overlay', PresenceOverlay2, handleCloseOverlay('circle'))} */}
            {/* {renderOverlay(overlays.heart.show, overlays.heart.closing, overlays.heart.origin, 'heart-overlay', SensesOverlay2, handleCloseOverlay('heart'))} */}
            {/* {renderOverlay(overlays.droplet.show, overlays.droplet.closing, overlays.droplet.origin, 'droplet-overlay', TimeOverlay, handleCloseOverlay('droplet'))} */}
            {/* {renderOverlay(overlays.rect.show, overlays.rect.closing, overlays.rect.origin, 'rect-overlay', SpaceOverlay, handleCloseOverlay('rect'))} */}
        </>
    );
};

export default MirrorExp;