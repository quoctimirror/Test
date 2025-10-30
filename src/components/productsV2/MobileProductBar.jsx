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
                <div className="pv2-mobile-product-content">
                    <img
                        src={greyCaretUp}
                        alt=""
                        className="pv2-mobile-bar-caret-up"
                        onClick={() => setShowConfigModal(true)}
                    />
                    <h1 className="pv2-mobile-product-title heading-2--no-margin">Lumina Olivia 5</h1>
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
