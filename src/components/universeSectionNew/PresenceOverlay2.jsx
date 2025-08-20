import React from 'react';
import './PresenceOverlay2.css';
import StarlightEffect from './StarlightEffect';

const PresenceOverlay2 = () => {
    return (
        <div className="presence-container">
            <img 
                src="/universeSection/circle-presence-planet.svg" 
                alt="Circle Presence Planet"
                className="presence-planet-image"
            />
            <div className="starlight-6-oclock">
                <StarlightEffect direction="falling" height={82} />
            </div>
        </div>
    );
};

export default PresenceOverlay2;