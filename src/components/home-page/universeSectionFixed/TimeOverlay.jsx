import { useEffect } from 'react';
import './TimeOverlay.css';
import StarlightEffect from '../universeSection/StarlightEffect';

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
                <h2 className="time-overlay__title heading2--no-margin">Time</h2>
                <div className="time-overlay__starlight-down">
                    <StarlightEffect direction="falling" height={150} />
                </div>
                <div className="time-overlay__bottom-text">
                    <span className="bodytext-6--no-margin">
                        From anticipation to aftercare, we're<br />
                        there for every moment: the ordinary,<br />
                        the rare, the timeless. Each<br />
                        experience becomes more personal,<br />
                        more lasting - like the bond<br />
                        between you and what you wear.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TimeOverlay;