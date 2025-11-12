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

                    {/* Mobile: Single Order Now button */}
                    <div className="pv2-mobile-bar-order-btn pv2-mobile-only">
                        <ShineGlassButton theme="light" className="bodytext-4--no-margin">
                            Order Now
                        </ShineGlassButton>
                    </div>

                    {/* Tablet: Two buttons - Book Appointment + Order Now */}
                    <div className="pv2-mobile-bar-buttons-wrapper pv2-tablet-only">
                        <div className="pv2-mobile-bar-buttons-container">
                            <div className="pv2-mobile-bar-appointment-btn">
                                <ShineGlassButton theme="light" className="bodytext-4--no-margin">
                                    Book An Appointment
                                </ShineGlassButton>
                            </div>
                            <div className="pv2-mobile-bar-order-btn">
                                <ShineGlassButton theme="light" className="bodytext-4--no-margin">
                                    Order Now
                                </ShineGlassButton>
                            </div>
                        </div>
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
