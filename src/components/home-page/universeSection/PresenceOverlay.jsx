import { useEffect, useCallback, useState } from 'react';
import './PresenceOverlay.css';
import StarlightEffect from './StarlightEffect';
import ShineGlassButton from '../../common/button/ShineGlassButton';

const PresenceOverlay = ({ isVisible, onClose, origin }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [fontLoaded, setFontLoaded] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    }, [onClose]);

    const handleEscKey = useCallback((event) => {
        if (event.key === 'Escape') {
            handleClose();
        }
    }, [handleClose]);

    // Preload background images immediately when component mounts
    useEffect(() => {
        const imagesToPreload = [
            '/universeSection/dk-circle-presence.svg'
        ];

        let loadedCount = 0;
        const totalImages = imagesToPreload.length;

        imagesToPreload.forEach((src) => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    setImagesLoaded(true);
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    setImagesLoaded(true);
                }
            };
            img.src = src;
        });
    }, []); // Empty dependency array - run once on mount

    // Check if Saol Display font is loaded
    useEffect(() => {
        if (document.fonts) {
            document.fonts.load('300 italic 60px "Saol Display"').then(() => {
                setFontLoaded(true);
            }).catch(() => {
                // If font fails to load, show text anyway after timeout
                setTimeout(() => setFontLoaded(true), 1000);
            });
        } else {
            // Fallback for browsers without Font Loading API
            setFontLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (isVisible) {
            // Prevent body scroll when overlay is open
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscKey);

            return () => {
                document.removeEventListener('keydown', handleEscKey);
                // Restore body scroll when overlay is closed
                document.body.style.overflow = '';
            };
        }
    }, [isVisible, handleEscKey]);

    if (!isVisible) return null;

    // Don't show content until images are loaded
    if (!imagesLoaded) {
        return (
            <div className="presence-overlay">
                <div className="presence-overlay__content" style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}>
                    {/* Loading placeholder */}
                </div>
            </div>
        );
    }

    const handleOverlayClick = (e) => {
        // Disable click-to-close for mobile and tablet (< 1024px)
        if (window.innerWidth < 1024) {
            return;
        }
        // Desktop: close when clicking on background
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div
            className="presence-overlay"
            onClick={handleOverlayClick}
        >
            {/* Close Button - moved outside content to prevent jumping */}
            <div
                className={`presence-overlay__close-button ${isClosing ? 'presence-overlay__close-button--closing' : ''}`}
            >
                <ShineGlassButton
                    onClick={handleClose}
                    theme="footer"
                    width={44}
                    height={44}
                    className="presence-overlay__close-btn"
                >
                    <img
                        src="/universeSection/close-x-icon.svg"
                        alt="Close"
                        width="20"
                        height="20"
                    />
                </ShineGlassButton>
            </div>

            <div
                className={`presence-overlay__content ${isClosing ? 'presence-overlay__content--closing' : ''}`}
                style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            >
                <h2 className="presence-overlay__title heading2--no-margin">Presence</h2>
                <div className="presence-overlay__starlight">
                    <StarlightEffect
                        direction="falling"
                        height={window.innerWidth >= 1024 ? 400 : window.innerWidth >= 481 ? 200 : 140}
                    />
                </div>
                <div className="presence-overlay__milestone-text">
                    <span className="bodytext-6--no-margin">We</span>
                    <span className="bodytext-6--no-margin">remember</span>
                    <span className="bodytext-6--no-margin">your</span>
                    <span className="bodytext-6--no-margin">milestones.</span>
                </div>
                <div className="presence-overlay__journey-text">
                    <span className="bodytext-6--no-margin">We</span>
                    <span className="bodytext-6--no-margin">grow</span>
                    <span className="bodytext-6--no-margin">with</span>
                    <span className="bodytext-6--no-margin">your</span>
                    <span className="bodytext-6--no-margin">journey.</span>
                </div>
                <div className="presence-overlay__story-text">
                    <div className="bodytext-6--no-margin">Each piece becomes part of your story.</div>
                    <div className="bodytext-6--no-margin">From a ring that catches the light</div>
                    <div className="bodytext-6--no-margin">to a necklace that moves as</div>
                    <div className="bodytext-6--no-margin">you do - we're there,</div>
                    <div className="bodytext-6--no-margin">quietly shining</div>
                    <div className="bodytext-6--no-margin">with you.</div>
                </div>
            </div>
        </div>
    );
};

export default PresenceOverlay;