import { useEffect, useCallback, useState } from 'react';
import './SenseOverlay.css';
import StarlightEffect from './StarlightEffect';
import ShineGlassButton from '../../common/button/ShineGlassButton';

const SenseOverlay = ({ isVisible, onClose, origin }) => {
    const [selectedSense, setSelectedSense] = useState(null);
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
            '/universeSection/dk-heart-sense.svg'
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

    const renderDescription = () => {
        if (!selectedSense) return null;

        const descriptions = {
            sight: (
                <>
                    <p className="bodytext-6--no-margin">The dance of light through faceted stones, the glow of Viva Magenta reflecting off mirrored surfaces.
                        Each display is a painting.
                        Each showroom, a moving gallery.
                    </p>
                </>
            ),
            touch: (
                <>
                    <p className="bodytext-6--no-margin">The weight of gold, the chill of glass, the softness of velvet beneath your fingers.
                        Every texture, a whisper of refinement.  </p>
                </>
            ),
            scent: (
                <>
                    <p className="bodytext-6--no-margin">Our signature fragrance lingers in the air. A memory waiting to be written. </p>

                </>
            ),
            sound: (
                <>
                    <p className="bodytext-6--no-margin">Curated melodies. Ambient echoes that ground you in the now. The hum of craftsmanship, the pulse of elegance.</p>

                </>
            ),
            taste: (
                <>
                    <p className="bodytext-6--no-margin">Not in food, but in aftertaste. The lingering feeling of a moment made beautiful.</p>
                </>
            )
        };

        return descriptions[selectedSense];
    };

    if (!isVisible) return null;

    // Don't show content until images are loaded
    if (!imagesLoaded) {
        return (
            <div className="sense-overlay">
                <div className="sense-overlay__content" style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}>
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
            className="sense-overlay"
            onClick={handleOverlayClick}
        >
            {/* Close Button - moved outside content to prevent jumping */}
            <div
                className={`sense-overlay__close-button ${isClosing ? 'sense-overlay__close-button--closing' : ''}`}
            >
                <ShineGlassButton
                    onClick={handleClose}
                    theme="footer"
                    width={44}
                    height={44}
                    className="sense-overlay__close-btn"
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
                className={`sense-overlay__content ${isClosing ? 'sense-overlay__content--closing' : ''}`}
                style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            >
                <h2 className="sense-overlay__title heading2--no-margin">Senses</h2>
                {/* <div className="sense-overlay__center-dot"></div> */}
                <div className="sense-overlay__starlight">
                    <StarlightEffect direction="falling" height={60} />
                </div>
                <div className="sense-overlay__starlight-2h">
                    <StarlightEffect direction="falling" height={74} />
                </div>
                <div className="sense-overlay__starlight-4h">
                    <StarlightEffect direction="falling" height={70} />
                </div>
                <div className="sense-overlay__starlight-8h">
                    <StarlightEffect direction="falling" height={60} />
                </div>
                <div className="sense-overlay__starlight-10h">
                    <StarlightEffect direction="falling" height={60} />
                </div>
                <div
                    className={`sense-overlay__sound-text ${selectedSense === 'sound' ? 'sense-overlay__sound-text--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedSense('sound'); }}
                >
                    <span className="bodytext1--no-margin">Sound</span>
                </div>
                <div
                    className={`sense-overlay__taste-text ${selectedSense === 'taste' ? 'sense-overlay__taste-text--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedSense('taste'); }}
                >
                    <span className="bodytext1--no-margin">Taste</span>
                </div>
                <div
                    className={`sense-overlay__scent-text ${selectedSense === 'scent' ? 'sense-overlay__scent-text--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedSense('scent'); }}
                >
                    <span className="bodytext1--no-margin">Scent</span>
                </div>
                <div
                    className={`sense-overlay__sight-text ${selectedSense === 'sight' ? 'sense-overlay__sight-text--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedSense('sight'); }}
                >
                    <span className="bodytext1--no-margin">Sight</span>
                </div>
                <div
                    className={`sense-overlay__touch-text ${selectedSense === 'touch' ? 'sense-overlay__touch-text--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedSense('touch'); }}
                >
                    <span className="bodytext1--no-margin">Touch</span>
                </div>
                <div
                    key={selectedSense}
                    className={`sense-overlay__description ${selectedSense ? `sense-overlay__description--${selectedSense}` : ''}`}
                >
                    {renderDescription()}
                </div>
            </div>
        </div>
    );
};

export default SenseOverlay;