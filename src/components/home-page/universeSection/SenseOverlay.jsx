import { useEffect, useCallback } from 'react';
import './SenseOverlay.css';
import StarlightEffect from './StarlightEffect';
import ShineGlassButton from '../../common/button/ShineGlassButton';

const SenseOverlay = ({ isVisible, onClose }) => {
    const handleEscKey = useCallback((event) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

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

    return (
        <div className="sense-overlay" onClick={onClose}>
            <div className="sense-overlay__content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <div className="sense-overlay__close-button">
                    <ShineGlassButton
                        onClick={onClose}
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

                <h2 className="sense-overlay__title heading2--no-margin">Senses</h2>
                {/* <div className="sense-overlay__center-dot"></div> */}
                <div className="sense-overlay__starlight">
                    <StarlightEffect direction="falling" height={58} />
                </div>
                <div className="sense-overlay__starlight-2h">
                    <StarlightEffect direction="falling" height={58} />
                </div>
                <div className="sense-overlay__starlight-4h">
                    <StarlightEffect direction="falling" height={58} />
                </div>
                <div className="sense-overlay__starlight-8h">
                    <StarlightEffect direction="falling" height={58} />
                </div>
                <div className="sense-overlay__starlight-10h">
                    <StarlightEffect direction="falling" height={58} />
                </div>
                <div className="sense-overlay__sound-text">
                    <span className="bodytext1--no-margin">Sound</span>
                </div>
                <div className="sense-overlay__taste-text">
                    <span className="bodytext1--no-margin">Taste</span>
                </div>
                <div className="sense-overlay__scent-text">
                    <span className="bodytext1--no-margin">Scent</span>
                </div>
                <div className="sense-overlay__sight-text">
                    <span className="bodytext1--no-margin">Sight</span>
                </div>
                <div className="sense-overlay__touch-text">
                    <span className="bodytext1--no-margin">Touch</span>
                </div>
            </div>
        </div>
    );
};

export default SenseOverlay;