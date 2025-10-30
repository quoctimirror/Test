import { useEffect, useCallback, useState } from 'react';
import './SpaceOverlay.css';
import StarlightEffect from './StarlightEffect';
import ShineGlassButton from '../../common/button/ShineGlassButton';

const SpaceOverlay = ({ isVisible, onClose, origin }) => {
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
            '/universeSection/dk-rect-space.svg'
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
                // Even on error, count as loaded to prevent blocking
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
            <div className="space-overlay">
                <div className="space-overlay__content" style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}>
                    {/* Loading placeholder - can add spinner here if needed */}
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
            className="space-overlay"
            onClick={handleOverlayClick}
        >
            {/* Close Button - moved outside content to prevent jumping */}
            <div className={`space-overlay__close-button ${isClosing ? 'space-overlay__close-button--closing' : ''}`}>
                <ShineGlassButton
                    onClick={handleClose}
                    theme="footer"
                    width={44}
                    height={44}
                    className="space-overlay__close-btn"
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
                className={`space-overlay__content ${isClosing ? 'space-overlay__content--closing' : ''}`}
                style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            >
                <div className="space-overlay__top-text">
                    <div className="space-overlay__top-line">
                        <span className="bodytext-6--no-margin">With </span>
                        <span className="bodytext-6--no-margin">immersive </span>
                        <span className="bodytext-6--no-margin">technology,</span>
                    </div>
                    <div className="space-overlay__top-line">
                        <span className="bodytext-6--no-margin">we </span>
                        <span className="bodytext-6--no-margin">gently </span>
                        <span className="bodytext-6--no-margin">blur </span>
                        <span className="bodytext-6--no-margin">the </span>
                        <span className="bodytext-6--no-margin">line </span>
                    </div>
                    <div className="space-overlay__top-line">
                        <span className="bodytext-6--no-margin">between </span>
                        <span className="bodytext-6--no-margin">digital </span>
                        <span className="bodytext-6--no-margin">and </span>
                        <span className="bodytext-6--no-margin">physical. </span>
                    </div>
                </div>
                <div className="space-overlay__starlight-up">
                    <StarlightEffect direction="falling" height={150} />
                </div>
                <h2 className="space-overlay__title heading2--no-margin">Space</h2>
                <div className="space-overlay__starlight-down">
                    <StarlightEffect direction="falling" height={150} />
                </div>
                <div className="space-overlay__bottom-text">
                    <div className="space-overlay__bottom-line">
                        <span className="bodytext-6--no-margin">Our </span>
                        <span className="bodytext-6--no-margin">jewelry </span>
                        <span className="bodytext-6--no-margin">isn't </span>
                        <span className="bodytext-6--no-margin">meant </span>
                        <span className="bodytext-6--no-margin">to </span>
                        <span className="bodytext-6--no-margin">be </span>
                    </div>
                    <div className="space-overlay__bottom-line">
                        <span className="bodytext-6--no-margin">kept </span>
                        <span className="bodytext-6--no-margin">behind </span>
                        <span className="bodytext-6--no-margin">glass </span>
                        <span className="bodytext-6--no-margin">-</span>
                        <span className="bodytext-6--no-margin">it's </span>
                        <span className="bodytext-6--no-margin">made </span>
                    </div>
                    <div className="space-overlay__bottom-line">
                        <span className="bodytext-6--no-margin">to </span>
                        <span className="bodytext-6--no-margin">belong </span>
                        <span className="bodytext-6--no-margin">with </span>
                        <span className="bodytext-6--no-margin">you, </span>
                        <span className="bodytext-6--no-margin">in </span>
                        <span className="bodytext-6--no-margin">every </span>
                    </div>
                    <div className="space-overlay__bottom-line">
                        <span className="bodytext-6--no-margin">moment </span>
                        <span className="bodytext-6--no-margin">that </span>
                        <span className="bodytext-6--no-margin">matters. </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaceOverlay;