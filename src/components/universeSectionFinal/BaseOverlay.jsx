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
    closeOnMouseLeave = false // ✨ This prop is a "switch" to enable/disable the feature
}) => {

    const handleCloseOnClick = () => {
        if (!disableDefaultClose) {
            onClose();
        }
    };

    // This handler is only called when mouse leaves
    const handleMouseLeave = () => {
        // Only call onClose function if the "switch" closeOnMouseLeave is enabled
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