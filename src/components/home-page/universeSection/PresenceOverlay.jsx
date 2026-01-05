import { useEffect, useCallback, useState, useRef } from 'react';
import { MediaImage } from '@components/common/media';
import './PresenceOverlay.css';
import StarlightEffect from './StarlightEffect';
import ShineGlassButton from '@components/common/button/ShineGlassButton';
import CirclePresenceSVG from './svg/CirclePresenceSVG';

const PresenceOverlay = ({ isVisible, onClose, origin }) => {
    const [isClosing, setIsClosing] = useState(false);
    const closeTimeoutRef = useRef(null);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        closeTimeoutRef.current = setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    }, [onClose]);

    const handleEscKey = useCallback((event) => {
        if (event.key === 'Escape') {
            handleClose();
        }
    }, [handleClose]);

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

    // Cleanup setTimeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    if (!isVisible) return null;

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

    const handleContentClick = (e) => {
        // Only close if clicking directly on the content div (not on any child elements)
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div
            className="presence-overlay"
            onClick={handleOverlayClick}
        >
            {/* Liquid Glass Effect Layers - only on desktop */}
            <div className="presence-overlay__glass-background">
                <div className="liquidGlass-effect"></div>
                <div className="liquidGlass-tint"></div>
                <div className="liquidGlass-shine"></div>
            </div>
            {/* Close Button - moved outside content to prevent jumping */}
            <div
                className={`presence-overlay__close-button ${isClosing ? 'presence-overlay__close-button--closing' : ''}`}
            >
                <ShineGlassButton
                    onClick={handleClose}
                    theme="light"
                    className="presence-overlay__close-btn"
                >
                    <MediaImage
                        src="universeSection/close-x-icon.svg"
                        alt="Close"
                        width="20"
                        height="20"
                    />
                </ShineGlassButton>
            </div>

            <div
                className={`presence-overlay__content ${isClosing ? 'presence-overlay__content--closing' : ''}`}
                style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
                onClick={handleContentClick}
            >
                {/* Inline SVG for click detection */}
                <CirclePresenceSVG className="presence-overlay__svg" />
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