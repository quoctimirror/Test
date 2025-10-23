import React, { useState } from 'react';
import './MobileProductBar.css';
import ShineGlassButton from '../common/button/ShineGlassButton';
import MobileConfigModal from './MobileConfigModal';
import greyCaretUp from '../../assets/images/grey-caret-up.svg';

const MobileProductBar = ({ isVisible, selectedShape, onShapeChange, selectedSize, onSizeChange }) => {
    const [showConfigModal, setShowConfigModal] = useState(false);

    return (
        <>
            <div className={`pv2-mobile-product-bar ${isVisible ? 'visible' : 'hidden'}`}>
                <img
                    src={greyCaretUp}
                    alt=""
                    className="pv2-mobile-bar-caret-up"
                    onClick={() => setShowConfigModal(true)}
                />
                <div className="pv2-mobile-product-content">
                <h1 className="pv2-mobile-product-title heading-1--no-margin">LUMINA OLIVIA 5</h1>

                <div className="pv2-mobile-action-buttons">
                    <ShineGlassButton
                        className="pv2-mobile-wishlist-btn-glass"
                        width={36}
                        height={36}
                        theme="footer"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </ShineGlassButton>

                    <div className="pv2-mobile-appointment-btn-glass">
                        <ShineGlassButton
                            theme="footer"
                        >
                            Book An Appointment
                        </ShineGlassButton>
                    </div>
                </div>

                <button className="pv2-mobile-order-btn bodytext-4--no-margin">
                    Order Now
                </button>
                </div>
            </div>

        <MobileConfigModal
            isOpen={showConfigModal}
            onClose={() => setShowConfigModal(false)}
            selectedShape={selectedShape}
            onShapeChange={onShapeChange}
            selectedSize={selectedSize}
            onSizeChange={onSizeChange}
        />
        </>
    );
};

export default MobileProductBar;
