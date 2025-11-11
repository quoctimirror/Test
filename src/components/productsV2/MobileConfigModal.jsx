import React, { useState } from 'react';
import './MobileConfigModal.css';
import opaqueIcon from '../../assets/images/opaque_gts.svg';
import whiteIcon from '../../assets/images/white_gts.svg';
import greyCaretUp from '../../assets/images/grey-caret-up.svg';
import ShineGlassButton from '../common/button/ShineGlassButton';
import SizeSelector from './SizeSelector';
import ShapeSelector from './ShapeSelector';
import { getShapeConfig } from './shapeConfig';

const MobileConfigModal = ({ isOpen, isVisible = true, hasOpenedModal = false, onClose, selectedShape, onShapeChange, selectedSize, onSizeChange }) => {
    const [quantity, setQuantity] = useState(1);
    const [showSizeSelector, setShowSizeSelector] = useState(false);
    const [showShapeSelector, setShowShapeSelector] = useState(false);

    // Use selectedShape from props, fallback to 'Fiston'
    const currentShape = selectedShape || 'Fiston';
    // Use selectedSize from props, fallback to '3.0'
    const currentSize = selectedSize || '3.0';

    const handleQuantityChange = (increment) => {
        setQuantity(prev => Math.max(1, prev + increment));
    };

    const handleSizeSelect = (sizeItem) => {
        const newSize = sizeItem.size.toString();
        if (onSizeChange) {
            onSizeChange(newSize);
        }
        setShowSizeSelector(false);
    };

    const handleShapeSelect = (shapeConfig) => {
        if (onShapeChange) {
            onShapeChange(shapeConfig);
        }
        setShowShapeSelector(false);
    };

    // Determine modal state class
    const getModalClass = () => {
        if (!isVisible) return 'hidden'; // ProductBar is hidden (scroll away)
        if (!hasOpenedModal) return 'hidden'; // Modal has never been opened yet
        if (isOpen) return 'open'; // Modal is opened
        return 'closed'; // Modal was opened before, now closed
    };

    return (
        <>
            <div className={`pv2-mobile-config-modal ${getModalClass()}`}>
                <div className="pv2-mobile-config-content">
                    {/* Caret Down to close - Moved to top */}
                    <img
                        src={greyCaretUp}
                        alt=""
                        className="pv2-mobile-config-caret-down"
                        onClick={onClose}
                    />

                    <h1 className="pv2-mobile-config-title heading-2--no-margin">Lumina Olivia 5</h1>

                    {/* Group 1: Configuration Options + Additional Info */}
                    <div className="pv2-mobile-config-group-top">
                        <div className="pv2-mobile-configuration-options">
                            <div className="pv2-mobile-option-row pv2-mobile-shape-row" onClick={() => setShowShapeSelector(true)}>
                                <span className="pv2-mobile-option-label bodytext-6--no-margin">Shape</span>
                                <div className="pv2-mobile-option-value-container">
                                    <span className="pv2-mobile-option-value bodytext-3--no-margin">{currentShape}</span>
                                    <img src={whiteIcon} alt="" className="pv2-mobile-option-icon" />
                                </div>
                            </div>

                            <div className="pv2-mobile-option-row">
                                <span className="pv2-mobile-option-label bodytext-6--no-margin">Metal</span>
                                <div className="pv2-mobile-option-value-container">
                                    <span className="pv2-mobile-option-value bodytext-3--no-margin">Yellow Gold</span>
                                    <img src={opaqueIcon} alt="" className="pv2-mobile-option-icon" />
                                </div>
                            </div>

                            <div className="pv2-mobile-option-row">
                                <span className="pv2-mobile-option-label bodytext-6--no-margin">Band</span>
                                <div className="pv2-mobile-option-value-container">
                                    <span className="pv2-mobile-option-value bodytext-3--no-margin">Single band</span>
                                    <img src={opaqueIcon} alt="" className="pv2-mobile-option-icon" />
                                </div>
                            </div>

                            <div className="pv2-mobile-option-row pv2-mobile-size-row">
                                <span className="pv2-mobile-option-label bodytext-6--no-margin">Size</span>
                                <div className="pv2-mobile-size-selector" onClick={() => setShowSizeSelector(true)}>
                                    <span className="pv2-mobile-size-value bodytext-3--no-margin">{currentSize}</span>
                                    <img src={whiteIcon} alt="" className="pv2-mobile-size-arrow-icon" />
                                </div>
                            </div>

                            <div className="pv2-mobile-option-row pv2-mobile-quantity-row">
                                <span className="pv2-mobile-option-label bodytext-6--no-margin">Quantity</span>
                                <div className="pv2-mobile-quantity-selector">
                                    <button
                                        className="pv2-mobile-quantity-btn"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="pv2-mobile-quantity-value bodytext-3--no-margin"
                                        min="1"
                                    />
                                    <button
                                        className="pv2-mobile-quantity-btn"
                                        onClick={() => handleQuantityChange(1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pv2-mobile-additional-info">
                            <p className="pv2-mobile-shipping-info bodytext-4--no-margin">Complimentary shipping & returns</p>
                            <a href="#" className="pv2-mobile-contact-link bodytext-4--no-margin">Contact us</a>
                        </div>
                    </div>

                    {/* Group 2: Price + Buttons */}
                    <div className="pv2-mobile-config-group-bottom">
                        <div className="pv2-mobile-price-section">
                            <span className="pv2-mobile-price heading-3--no-margin">$15,600</span>
                        </div>

                        {/* 5️⃣ + 6️⃣ Buttons Container - Chứa cả Action Buttons và Order Button */}
                        <div className="pv2-mobile-buttons-container">
                            {/* Action Buttons (wishlist + appointment) */}
                            <div className="pv2-mobile-modal-action-buttons">
                                <ShineGlassButton
                                    className="pv2-mobile-modal-wishlist-btn"
                                    width={44}
                                    height={44}
                                    theme="footer"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ShineGlassButton>

                                <div className="pv2-mobile-modal-appointment-btn">
                                    <ShineGlassButton theme="footer">
                                        Book An Appointment
                                    </ShineGlassButton>
                                </div>
                            </div>

                            {/* Order Button */}
                            <button className="pv2-mobile-modal-order-btn">
                                Order Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Size Selector Modal */}
                {showSizeSelector && (
                    <SizeSelector
                        onClose={() => setShowSizeSelector(false)}
                        onSelectSize={handleSizeSelect}
                        selectedSize={currentSize}
                    />
                )}

                {/* Shape Selector Modal */}
                {showShapeSelector && (
                    <ShapeSelector
                        onClose={() => setShowShapeSelector(false)}
                        onSelectShape={handleShapeSelect}
                        selectedShape={currentShape}
                    />
                )}
            </div>
        </>
    );
};

export default MobileConfigModal;
