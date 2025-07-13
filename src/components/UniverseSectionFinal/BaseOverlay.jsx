// ============================================================= //
//                    BaseOverlay.jsx (UPDATED)                  //
// ============================================================= //
import React from 'react';
import ReactDOM from 'react-dom';
import './BaseOverlay.css';

const BaseOverlay = ({
    isActive,
    overlayStyle,
    onClose,
    children,
    customClassName = '',
    disableDefaultClose = false,
    closeOnMouseLeave = false // ✨ Prop này là "công tắc" để bật/tắt tính năng
}) => {

    const handleCloseOnClick = () => {
        if (!disableDefaultClose) {
            onClose();
        }
    };

    // Handler này chỉ được gọi khi chuột rời khỏi
    const handleMouseLeave = () => {
        // Chỉ gọi hàm onClose nếu "công tắc" closeOnMouseLeave được bật
        if (closeOnMouseLeave) {
            onClose();
        }
    };

    const overlayMarkup = (
        <div
            className={`base-overlay ${isActive ? 'show' : ''} ${customClassName}`}
            style={overlayStyle}
            onClick={handleCloseOnClick}
            onMouseLeave={handleMouseLeave} // ✨ Gắn sự kiện vào đây
        >
            <div className="cross-lines">
                <div className="line line-vertical"></div>
                <div className="line line-horizontal"></div>
                <div className="line line-diagonal-1"></div>
                <div className="line line-diagonal-2"></div>
            </div>
            {children}
        </div>
    );

    return ReactDOM.createPortal(
        overlayMarkup,
        document.getElementById('overlay-root')
    );
};

export default BaseOverlay;