import { useEffect, useCallback, useState } from 'react';
import './TimeOverlay.css';
import StarlightEffect from './StarlightEffect';
import ShineGlassButton from '../../common/button/ShineGlassButton';

const TimeOverlay = ({ isVisible, onClose, origin }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);

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
            '/universeSection/dk-droplet-time.svg'
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
            <div className="time-overlay">
                <div className="time-overlay__content" style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}>
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
            className="time-overlay"
            onClick={handleOverlayClick}
        >
            {/* Close Button - moved outside content to prevent jumping */}
            <div className={`time-overlay__close-button ${isClosing ? 'time-overlay__close-button--closing' : ''}`}>
                <ShineGlassButton
                    onClick={handleClose}
                    theme="footer"
                    width={44}
                    height={44}
                    className="time-overlay__close-btn"
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
                className={`time-overlay__content ${isClosing ? 'time-overlay__content--closing' : ''}`}
                style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            >
                <h2 className="time-overlay__title heading2--no-margin">Time</h2>
                <div className="time-overlay__starlight-down">
                    <StarlightEffect direction="falling" height={160} />
                </div>
                <div className="time-overlay__bottom-text">
                    <span className="bodytext-6--no-margin">
                        From anticipation to aftercare, we're there
                        for every moment: the ordinary, the rare, the
                        timeless. Each experience becomes more
                        personal, more lasting - like the bond
                        between you and what you wear.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TimeOverlay;