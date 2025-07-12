// PresenceOverlay.jsx - Cập nhật cho layout mới (ĐÃ SỬA LỖI)

import React from 'react';
import './BaseOverlay.css';
import './PresenceOverlay.css';

const PresenceOverlay = ({
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
            className={`base-overlay presence-overlay ${isActive ? 'show' : ''}`}
            style={overlayStyle}
            onClick={onClose}
            onMouseLeave={onClose}
        >
            {/* 4 đường cross-lines giữ nguyên */}
            <div className="cross-lines">
                <div className="line line-vertical"></div>
                <div className="line line-horizontal"></div>
                <div className="line line-diagonal-1"></div>
                <div className="line line-diagonal-2"></div>
            </div>

            {/* 
              Content wrapper LÀ SÂN KHẤU CHÍNH CHO TẤT CẢ NỘI DUNG.
              Nó sẽ có position: relative để các con bên trong định vị theo nó.
            */}
            <div className="presence-content-wrapper" onClick={handleContentClick}>

                {/* 1. TITLE được đặt ở đây để căn giữa theo SÂN KHẤU CHÍNH */}
                <h2 className="presence-title">Presence</h2>

                {/* 
                  2. CONTAINER cho 2 đoạn text. 
                  Nó cũng được đặt ở đây và sẽ là "sân khấu phụ" cho các đoạn text.
                */}
                <div className="presence-content-container">
                    <div className="presence-text-top">
                        <p>
                            Mirror evolves with you - reflecting your presence<br />
                            as it grows, shifts, and becomes.
                        </p>
                    </div>
                    <div className="presence-text-bottom">
                        <p>
                            We remember your milestones.<br />
                            We grow with your journey.<br />
                            Each piece becomes part of your story.<br />
                            From a ring that catches the light to a necklace<br />
                            that moves as you do - we're there, quietly shining with you.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PresenceOverlay;