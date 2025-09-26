import { useEffect } from 'react';
import './SpaceOverlay.css';
import StarlightEffect from '../universeSection/StarlightEffect';

const SpaceOverlay = ({ isVisible, onClose }) => {
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
        <div className="space-overlay" onClick={onClose}>
            <div className="space-overlay__content" onClick={(e) => e.stopPropagation()}>
                <div className="space-overlay__top-text">
                    <div className="space-overlay__top-line">
                        <span className="bodytext-6--no-margin">With</span>
                        <span className="bodytext-6--no-margin">immersive</span>
                        <span className="bodytext-6--no-margin">technology,</span>
                    </div>
                    <div className="space-overlay__top-line">
                        <span className="bodytext-6--no-margin">we</span>
                        <span className="bodytext-6--no-margin">gently</span>
                        <span className="bodytext-6--no-margin">blur</span>
                        <span className="bodytext-6--no-margin">the</span>
                        <span className="bodytext-6--no-margin">line</span>
                    </div>
                    <div className="space-overlay__top-line">
                        <span className="bodytext-6--no-margin">between</span>
                        <span className="bodytext-6--no-margin">digital</span>
                        <span className="bodytext-6--no-margin">and</span>
                        <span className="bodytext-6--no-margin">physical.</span>
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
                        <span className="bodytext-6--no-margin">Our</span>
                        <span className="bodytext-6--no-margin">jewelry</span>
                        <span className="bodytext-6--no-margin">isn't</span>
                        <span className="bodytext-6--no-margin">meant</span>
                        <span className="bodytext-6--no-margin">to</span>
                        <span className="bodytext-6--no-margin">be</span>
                    </div>
                    <div className="space-overlay__bottom-line">
                        <span className="bodytext-6--no-margin">kept</span>
                        <span className="bodytext-6--no-margin">behind</span>
                        <span className="bodytext-6--no-margin">glass</span>
                        <span className="bodytext-6--no-margin">-</span>
                        <span className="bodytext-6--no-margin">it's</span>
                        <span className="bodytext-6--no-margin">made</span>
                    </div>
                    <div className="space-overlay__bottom-line">
                        <span className="bodytext-6--no-margin">to</span>
                        <span className="bodytext-6--no-margin">belong</span>
                        <span className="bodytext-6--no-margin">with</span>
                        <span className="bodytext-6--no-margin">you,</span>
                        <span className="bodytext-6--no-margin">in</span>
                        <span className="bodytext-6--no-margin">every</span>
                    </div>
                    <div className="space-overlay__bottom-line">
                        <span className="bodytext-6--no-margin">moment</span>
                        <span className="bodytext-6--no-margin">that</span>
                        <span className="bodytext-6--no-margin">matters.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaceOverlay;