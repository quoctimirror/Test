import React from 'react';
import BaseOverlay from './BaseOverlay';
import './SpaceOverlay.css';

const SpaceOverlay = ({
    isActive,
    overlayStyle,
    onClose
}) => {
    // Prevent click event propagation when clicking on inner content
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <BaseOverlay
            isActive={isActive}
            overlayStyle={overlayStyle}
            onClose={onClose}
            customClassName="space-overlay"
            disableDefaultClose={false}
            closeOnMouseLeave={true}
        >
            <div className="space-content-wrapper" onClick={handleContentClick}>
                <div className="space-content-container">
                    <div className="space-description">
                        <p>Mirror moves with you — from glowing showrooms<br />
                            to calming spas, from salons to your personal screen.</p>

                        <p className="text-gray">
                            Wherever life takes you, we're there<br />
                            — seamlessly integrated, never intrusive.<br />
                            With immersive technology, we gently blur the line<br />
                            between digital and physical.<br />
                            Our jewelry isn't meant to be kept behind glass<br />
                            – it's made to belong with you, in every moment that matters.
                        </p>
                    </div>

                    {/* Space title text */}
                    <h2 className="space-title">Space</h2>
                </div>
            </div>
        </BaseOverlay>
    );
};

export default SpaceOverlay;