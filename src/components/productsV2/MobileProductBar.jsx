import React, { useState, useEffect } from 'react';
import { MediaImage } from '@components/common/media';
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
                    <MediaImage
                        src={greyCaretUp}
                        alt=""
                        className="pv2-mobile-bar-caret-up"
                        onClick={handleOpenModal}
                    />
                    <h1 className="pv2-mobile-product-title heading-2--no-margin">Lumina Olivia 5</h1>
                    <button className="pv2-mobile-order-btn bodytext-4--no-margin">
                        Order Now
                    </button>
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
