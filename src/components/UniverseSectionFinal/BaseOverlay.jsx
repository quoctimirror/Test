// // BaseOverlay.jsx
// import React from 'react';
// import './BaseOverlay.css';

// const BaseOverlay = ({
//     isActive,
//     overlayStyle,
//     onClose,
//     children // Thêm children prop để nhận content từ overlay con
// }) => {
//     return (
//         <div
//             className={`base-overlay ${isActive ? 'show' : ''}`}
//             style={overlayStyle}
//             onClick={onClose}
//             onMouseLeave={onClose}
//         >
//             {/* 4 đường cross-lines tạo thành 8 đỉnh */}
//             <div className="cross-lines">
//                 <div className="line line-vertical"></div>
//                 <div className="line line-horizontal"></div>
//                 <div className="line line-diagonal-1"></div>
//                 <div className="line line-diagonal-2"></div>
//             </div>

//             {/* Render children (content từ các overlay con) */}
//             {children}
//         </div>
//     );
// };

// export default BaseOverlay;



// BaseOverlay.jsx - UPDATED

// import React from 'react';
// import './BaseOverlay.css';
// import ReactDOM from 'react-dom';

// const BaseOverlay = ({
//     isActive,
//     overlayStyle,
//     onClose,
//     children,
//     customClassName = '',      // ✨ [THAY ĐỔI] Thêm prop để nhận class tùy chỉnh
//     disableDefaultClose = false // ✨ [THAY ĐỔI] Thêm prop để vô hiệu hóa đóng mặc định
// }) => {

//     // ✨ [THAY ĐỔI] Chỉ gọi onClose nếu không bị vô hiệu hóa
//     const handleClose = () => {
//         if (!disableDefaultClose) {
//             onClose();
//         }
//     };

//     return (
//         <div
//             // ✨ [THAY ĐỔI] Thêm customClassName vào danh sách class
//             className={`base-overlay ${isActive ? 'show' : ''} ${customClassName}`}
//             style={overlayStyle}
//             onClick={handleClose}
//             onMouseLeave={handleClose}
//         >
//             {/* 4 đường cross-lines tạo thành 8 đỉnh */}
//             <div className="cross-lines">
//                 <div className="line line-vertical"></div>
//                 <div className="line line-horizontal"></div>
//                 <div className="line line-diagonal-1"></div>
//                 <div className="line line-diagonal-2"></div>
//             </div>

//             {/* Render children (content từ các overlay con) */}
//             {children}
//         </div>
//     );
// };

// export default BaseOverlay;


// BaseOverlay.jsx

import React from 'react';
import ReactDOM from 'react-dom'; // ✨ 1. THÊM IMPORT NÀY
import './BaseOverlay.css';

const BaseOverlay = ({
    isActive,
    overlayStyle,
    onClose,
    children,
    customClassName = '',
    disableDefaultClose = false
}) => {

    const handleClose = () => {
        if (!disableDefaultClose) {
            onClose();
        }
    };

    // Toàn bộ JSX của bạn không thay đổi, chỉ cần bao bọc nó bằng Portal
    const overlayMarkup = (
        <div
            className={`base-overlay ${isActive ? 'show' : ''} ${customClassName}`}
            style={overlayStyle}
            onClick={handleClose}
        // onMouseLeave={onClose} // Giữ lại onClose ở đây cho trực quan
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

    // ✨ 2. SỬ DỤNG PORTAL ĐỂ RENDER MARKUP VÀO "overlay-root"
    return ReactDOM.createPortal(
        overlayMarkup,
        document.getElementById('overlay-root')
    );
};

export default BaseOverlay;