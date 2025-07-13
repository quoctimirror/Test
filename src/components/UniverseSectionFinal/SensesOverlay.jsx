// ============================================================= //
//                    SensesOverlay.jsx (UPDATED)                //
// ============================================================= //
import React from 'react';
import BaseOverlay from './BaseOverlay';
import './SensesOverlay.css';

const SensesOverlay = ({ isActive, overlayStyle, onClose }) => {
    return (
        <BaseOverlay
            isActive={isActive}
            overlayStyle={overlayStyle}
            onClose={onClose}
            customClassName="senses-overlay"
            disableDefaultClose={true}
            closeOnMouseLeave={true} // ✨ BẬT TÍNH NĂNG: Đóng khi di chuột ra ngoài
        >
            <div className="senses-content-wrapper">
                <div className="senses-container">
                    <div className="sense-item sense-sight">Sight</div>
                    <div className="sense-item sense-touch">Touch</div>
                    <div className="senses-title">Senses</div>
                    <div className="sense-item sense-scent">Scent</div>
                    <div className="sense-item sense-sound">Sound</div>
                    <div className="sense-item sense-taste">Taste</div>
                </div>
            </div>
        </BaseOverlay>
    );
};

export default SensesOverlay;