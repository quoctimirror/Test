import React from 'react';
import './TimeOverlay.css';
import StarlightEffect from './StarlightEffect';

const TimeOverlay = () => {
    return (
        <div className="droplet-container">
            {/* Chỉ có 1 thanh sáng hướng 6 giờ */}
            <div className="starlight-6-oclock">
                <StarlightEffect direction="falling" height={110} />
            </div>
        </div>
    );
};

export default TimeOverlay;