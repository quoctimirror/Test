import { useEffect } from 'react';
import './SenseOverlay.css';
import StarlightEffect from '../universeSection/StarlightEffect';

const SenseOverlay = ({ isVisible, onClose }) => {
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
        <div className="sense-overlay" onClick={onClose}>
            <div className="sense-overlay__content" onClick={(e) => e.stopPropagation()}>
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