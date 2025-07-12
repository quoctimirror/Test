// TimeOverlay.jsx - NEW FILE

import React, { useEffect } from 'react';
import BaseOverlay from './BaseOverlay';
import './TimeOverlay.css'; // Import file CSS mới

const TimeOverlay = ({ isActive, overlayStyle, onClose }) => {

    // useEffect để thêm và gỡ bỏ event listener cho phím ESC
    useEffect(() => {
        // Hàm xử lý sự kiện nhấn phím
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose(); // Gọi hàm đóng overlay
            }
        };

        // Chỉ thêm event listener khi overlay đang được hiển thị
        if (isActive) {
            document.addEventListener('keydown', handleKeyDown);
        }

        // Hàm dọn dẹp: gỡ bỏ event listener khi component bị unmount
        // hoặc khi isActive chuyển thành false. Điều này rất quan trọng để tránh memory leak.
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive, onClose]); // Dependencies: chạy lại effect khi isActive hoặc onClose thay đổi

    return (
        <BaseOverlay
            isActive={isActive}
            overlayStyle={overlayStyle}
            onClose={onClose}
            // ✨ [QUAN TRỌNG] Vô hiệu hóa hành vi đóng mặc định của BaseOverlay
            disableDefaultClose={true}
            // ✨ [QUAN TRỌNG] Áp dụng theme CSS mới
            customClassName="time-overlay-theme"
        >
            {/* ✨ [THAY ĐỔI] Thêm container và nội dung văn bản mới */}
            <div className="time-overlay-content">
                <h1 className="time-title">
                    Time
                </h1>
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