import React, { useState, useEffect } from 'react';
import './MobileProductBar.css';
import ShineGlassButton from '../common/button/ShineGlassButton';
import MobileConfigModal from './MobileConfigModal';
import greyCaretUp from '../../assets/images/grey-caret-up.svg';

const MobileProductBar = ({ isVisible, selectedShape, onShapeChange, selectedSize, onSizeChange }) => {
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [hasOpenedModal, setHasOpenedModal] = useState(false);

    // Auto-close modal when ProductBar becomes invisible
    useEffect(() => {
        if (!isVisible) {
            setShowConfigModal(false);
            setHasOpenedModal(false); // Reset when scrolling away
        }
    }, [isVisible]);

    const handleOpenModal = () => {
        setShowConfigModal(true);
        setHasOpenedModal(true);
    };

    return (
        <>
            <div className={`pv2-mobile-product-bar ${isVisible ? 'visible' : 'hidden'} ${showConfigModal ? 'fade-out' : ''}`}>
                <div className="pv2-mobile-product-content">
                    <img
                        src={greyCaretUp}
                        alt=""
                        className="pv2-mobile-bar-caret-up"
                        onClick={handleOpenModal}
                    />
                    <h1 className="pv2-mobile-product-title heading-2--no-margin">Lumina Olivia 5</h1>
                    <div className="pv2-mobile-bar-order-btn">
                        <ShineGlassButton theme="light" className="bodytext-4--no-margin">
                            Order Now
                        </ShineGlassButton>
                    </div>
                </div>
            </div>

            <MobileConfigModal
                isOpen={showConfigModal}
                isVisible={isVisible}
                hasOpenedModal={hasOpenedModal}
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
