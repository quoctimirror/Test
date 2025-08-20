import React from 'react';
import './SensesOverlay2.css';
import StarlightEffect from './StarlightEffect';

const SensesOverlay2 = () => {
    return (
        <div className="heart-container">
            {/* Thanh sáng hướng 11 giờ */}
            <div className="starlight-11-oclock">
                <StarlightEffect direction="falling" height={68} />
            </div>
            {/* Thanh sáng hướng 1 giờ */}
            <div className="starlight-1-oclock">
                <StarlightEffect direction="falling" height={68} />
            </div>
            {/* Thanh sáng hướng 4 giờ */}
            <div className="starlight-4-oclock">
                <StarlightEffect direction="falling" height={50} />
            </div>
            {/* Thanh sáng hướng 6 giờ */}
            <div className="starlight-6-oclock">
                <StarlightEffect direction="falling" height={70} />
            </div>
            {/* Thanh sáng hướng 8 giờ */}
            <div className="starlight-8-oclock">
                <StarlightEffect direction="falling" height={50} />
            </div>
        </div>
    );
};

export default SensesOverlay2;