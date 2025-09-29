import { useEffect, useCallback } from 'react';
import './PresenceOverlay.css';
import StarlightEffect from './StarlightEffect';
import ShineGlassButton from '../../common/button/ShineGlassButton';

const PresenceOverlay = ({ isVisible, onClose }) => {

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
        <div className="presence-overlay" onClick={onClose}>
            <div className="presence-overlay__content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <div className="presence-overlay__close-button">
                    <ShineGlassButton
                        onClick={onClose}
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

                <h2 className="presence-overlay__title heading2--no-margin">Presence</h2>
                <div className="presence-overlay__starlight">
                    <StarlightEffect
                        direction="falling"
                        height={200}
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