// ============================================================= //
//                    TimeOverlay.jsx (UPDATED)                  //
// ============================================================= //
import React from 'react'; // Bỏ import useEffect vì không còn dùng
import BaseOverlay from './BaseOverlay';
import './TimeOverlay.css';

const TimeOverlay = ({ isActive, overlayStyle, onClose }) => {

    // ✨ Đoạn code xử lý phím Escape đã được XÓA BỎ ✨

    return (
        <BaseOverlay
            isActive={isActive}
            overlayStyle={overlayStyle}
            onClose={onClose}
            disableDefaultClose={true}
            customClassName="time-overlay-theme"
            closeOnMouseLeave={true} // ✨ BẬT TÍNH NĂNG: Đóng khi di chuột ra ngoài
        >
            <div className="time-overlay-content">
                <h1 className="time-title">Time</h1>
                <p className="time-tagline">
                    Mirror is not a fleeting trend<br />- it's designed to grow with you
                </p>
                <p className="time-description">
                    From anticipation to aftercare, we’re there for every moment:
                    <br />
                    the ordinary, the rare, the timeless.
                    <br />
                    Each experience becomes more personal, more lasting
                    <br />
                    - like the bond between you and what you wear.
                </p>
            </div>
        </BaseOverlay>
    );
};

export default TimeOverlay;