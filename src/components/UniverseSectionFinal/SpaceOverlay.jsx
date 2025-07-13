// SpaceOverlay.jsx

import React from 'react';
import './SpaceOverlay.css';

const SpaceOverlay = ({
    isActive,
    overlayStyle,
    onClose
}) => {
    // Ngăn chặn sự kiện click lan ra ngoài khi click vào nội dung bên trong
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className={`space-overlay ${isActive ? 'show' : ''}`}
            style={overlayStyle}
            onClick={onClose}
            onMouseLeave={onClose}
        >
            <div className="space-content-wrapper" onClick={handleContentClick}>
                {/* 4 đường line tạo thành 8 đỉnh */}
                <div className="cross-lines">
                    <div className="line line-vertical"></div>
                    <div className="line line-horizontal"></div>
                    <div className="line line-diagonal-1"></div>
                    <div className="line line-diagonal-2"></div>
                </div>

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

                    {/* Chữ Space title */}
                    <h2 className="space-title">Space</h2>
                </div>
            </div>
        </div>
    );
};

export default SpaceOverlay;