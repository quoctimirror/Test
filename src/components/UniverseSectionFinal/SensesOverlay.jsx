// SensesOverlay.jsx
import React from 'react';
import BaseOverlay from './BaseOverlay'; // Sử dụng BaseOverlay đã được cập nhật
import './SensesOverlay.css';       // CSS vẫn cần thiết cho viền ngoài và wrapper nội dung

/**
 * SensesOverlay là một component hiển thị overlay cho chủ đề 'Senses'.
 * Nó được xây dựng dựa trên BaseOverlay để có hiệu ứng chuyển cảnh đồng nhất.
 * Nó vô hiệu hóa hành vi đóng khi click vào trong, người dùng sẽ đóng bằng phím Escape
 * hoặc di chuột ra ngoài.
 *
 * @param {boolean} isActive - Trạng thái hiển thị của overlay.
 * @param {object} overlayStyle - Style ban đầu cho hiệu ứng chuyển cảnh từ điểm click.
 * @param {function} onClose - Hàm callback để đóng overlay.
 */
const SensesOverlay = ({ isActive, overlayStyle, onClose }) => {

    return (
        <BaseOverlay
            isActive={isActive}
            overlayStyle={overlayStyle}
            onClose={onClose} // onClose sẽ được kích hoạt bởi onMouseLeave của BaseOverlay
            customClassName="senses-overlay"
            disableDefaultClose={true} // Vẫn giữ để ngăn đóng khi click vào nội dung
        >
            <div className="senses-content-wrapper">
                {/* Container chính để bố trí các senses */}
                <div className="senses-container">
                    {/* Sight - Top */}
                    <div className="sense-item sense-sight">
                        Sight
                    </div>

                    {/* Touch - Top Right */}
                    <div className="sense-item sense-touch">
                        Touch
                    </div>

                    {/* Central Senses text */}
                    <div className="senses-title">
                        Senses
                    </div>

                    {/* Scent - Left */}
                    <div className="sense-item sense-scent">
                        Scent
                    </div>

                    {/* Sound - Bottom Left */}
                    <div className="sense-item sense-sound">
                        Sound
                    </div>

                    {/* Taste - Bottom Right */}
                    <div className="sense-item sense-taste">
                        Taste
                    </div>
                </div>
            </div>
        </BaseOverlay>
    );
};

export default SensesOverlay;