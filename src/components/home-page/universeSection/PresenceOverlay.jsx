import React from 'react';
import './PresenceOverlay.css';
import StarlightEffect from './StarlightEffect';
const PresenceOverlay = () => {
    return (
        <div className="presence-container">
            <h1 className="heading-2">Presence</h1>
            <StarlightEffect direction="rising" height={130} />
            <div className="bodytext-6--no-margin presence-text-flex">
                <span>We</span> <span>remember</span> <span>your</span> <span>milestones.</span>
            </div>

            <div className="bodytext-6--no-margin presence-text-flex">
                <span>We</span> <span>grow</span> <span>with</span> <span>your</span> <span>journey.</span>
            </div>

            <p className="bodytext-6--no-margin presence-text-center">
                Each piece becomes part of your story.<br />
                From a ring that catches the light<br />
                to a necklace that moves as<br />
                you do - we're there,<br />
                quietly shining<br />
                with you.
            </p>
        </div>
    );
};

export default PresenceOverlay;