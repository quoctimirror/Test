import { useEffect } from 'react';
import './TimeOverlay.css';
import StarlightEffect from '../universeSection/StarlightEffect';
import ShineGlassButton from '../../common/button/ShineGlassButton';

const TimeOverlay = ({ isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const handleEscKey = (event) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleEscKey);
            return () => {
                document.removeEventListener('keydown', handleEscKey);
            };
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="time-overlay" onClick={onClose}>
            <div className="time-overlay__content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <div className="time-overlay__close-button">
                    <ShineGlassButton
                        onClick={onClose}
                        theme="footer"
                        width={44}
                        height={44}
                        className="time-overlay__close-btn"
                    >
                        <img
                            src="/src/assets/images/close-x-icon.svg"
                            alt="Close"
                            width="20"
                            height="20"
                        />
                    </ShineGlassButton>
                </div>

                <h2 className="time-overlay__title heading2--no-margin">Time</h2>
                <div className="time-overlay__starlight-down">
                    <StarlightEffect direction="falling" height={140} />
                </div>
                <div className="time-overlay__bottom-text">
                    <span className="bodytext-6--no-margin">
                        From anticipation to aftercare, we're there<br />
                        for every moment: the ordinary, the rare, the<br />
                        timeless. Each experience becomes more<br />
                        personal, more lasting - like the bond<br />
                        between you and what you wear.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TimeOverlay;