import React from 'react';
import './SensesOverlay.css';
import StarlightEffect from './StarlightEffect';

const SensesOverlay = () => {
    return (
        <div className="heart-container">
            <h1 className="heading-1 senses-title">Senses</h1>
            <div className="starlight-11-oclock">
                <StarlightEffect direction="falling" height={130} />
            </div>
            <p className="bodytext-1 sight-text">Sight</p>
            {/* 4 thanh sáng theo 4 hướng đồng hồ */}
            <div className="starlight-2-oclock">
                <StarlightEffect direction="falling" height={120} />
            </div>
            <p className="bodytext-1 touch-text">Touch</p>
            <div className="starlight-4-oclock">
                <StarlightEffect direction="falling" height={60} />
            </div>
            <p className="bodytext-1 taste-text">Taste</p>
            {/* Thanh sáng chính - hướng 6 giờ */}
            {/* <div className="starlight-6-oclock">
                <StarlightEffect direction="falling" height={92} />
            </div>
            <p className="bodytext-1 sound-text">Sound</p> */}
            {/* <div className="starlight-8-oclock">
                <StarlightEffect direction="falling" height={82} />
            </div>
            <p className="bodytext-1 scent-text">Scent</p> */}


        </div>
    );
};

export default SensesOverlay;