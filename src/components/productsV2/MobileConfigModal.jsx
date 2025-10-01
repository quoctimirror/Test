import React, { useState } from 'react';
import './MobileConfigModal.css';
import opaqueIcon from '../../assets/images/opaque_gts.svg';
import whiteIcon from '../../assets/images/white_gts.svg';
import greyCaretUp from '../../assets/images/grey-caret-up.svg';
import ShineGlassButton from '../common/button/ShineGlassButton';
import SizeSelector from './SizeSelector';

const MobileConfigModal = ({ isOpen, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('6.0');
    const [showSizeSelector, setShowSizeSelector] = useState(false);

    const handleQuantityChange = (increment) => {
        setQuantity(prev => Math.max(1, prev + increment));
    };

    const handleSizeSelect = (sizeItem) => {
        setSize(sizeItem.size.toString());
        setShowSizeSelector(false);
    };

    return (
        <>
            <div className={`mobile-config-modal ${isOpen ? 'open' : 'closed'}`}>
                <div className="mobile-config-content">
                    <h1 className="mobile-config-title heading-1--no-margin">LUMINA OLIVIA 5</h1>

                    <div className="mobile-configuration-options">
                        <div className="mobile-option-row">
                            <span className="mobile-option-label bodytext-3--no-margin">Shape</span>
                            <div className="mobile-option-value-container">
                                <span className="mobile-option-value bodytext-1--no-margin">Pear</span>
                                <img src={opaqueIcon} alt="" className="mobile-option-icon" />
                            </div>
                        </div>

                        <div className="mobile-option-row">
                            <span className="mobile-option-label bodytext-3--no-margin">Metal</span>
                            <div className="mobile-option-value-container">
                                <span className="mobile-option-value bodytext-1--no-margin">Yellow Gold</span>
                                <img src={opaqueIcon} alt="" className="mobile-option-icon" />
                            </div>
                        </div>

                        <div className="mobile-option-row">
                            <span className="mobile-option-label bodytext-3--no-margin">Band</span>
                            <div className="mobile-option-value-container">
                                <span className="mobile-option-value bodytext-1--no-margin">Single band</span>
                                <img src={opaqueIcon} alt="" className="mobile-option-icon" />
                            </div>
                        </div>

                        <div className="mobile-option-row mobile-size-row">
                            <span className="mobile-option-label bodytext-3--no-margin">Size</span>
                            <div className="mobile-size-selector" onClick={() => setShowSizeSelector(true)}>
                                <span className="mobile-size-value bodytext-1--no-margin">{size}</span>
                                <img src={whiteIcon} alt="" className="mobile-size-arrow-icon" />
                            </div>
                        </div>

                        <div className="mobile-option-row mobile-quantity-row">
                            <span className="mobile-option-label bodytext-3--no-margin">Quantity</span>
                            <div className="mobile-quantity-selector">
                                <button
                                    className="mobile-quantity-btn"
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="mobile-quantity-value bodytext-1--no-margin"
                                    min="1"
                                />
                                <button
                                    className="mobile-quantity-btn"
                                    onClick={() => handleQuantityChange(1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mobile-additional-info">
                        <p className="mobile-shipping-info bodytext-4--no-margin">Complimentary shipping & returns</p>
                        <a href="#" className="mobile-contact-link bodytext-4--no-margin">Contact us</a>
                    </div>

                    <div className="mobile-price-section">
                        <span className="mobile-price heading-3--no-margin">$15,600</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mobile-modal-action-buttons">
                        <ShineGlassButton
                            className="mobile-modal-wishlist-btn"
                            width={44}
                            height={44}
                            theme="footer"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </ShineGlassButton>

                        <div className="mobile-modal-appointment-btn">
                            <ShineGlassButton theme="footer">
                                Book An Appointment
                            </ShineGlassButton>
                        </div>
                    </div>

                    <button className="mobile-modal-order-btn bodytext-4--no-margin">
                        Order Now
                    </button>
                </div>

                {/* Caret Down to close */}
                <img
                    src={greyCaretUp}
                    alt=""
                    className="mobile-config-caret-down"
                    onClick={onClose}
                />

                {/* Size Selector Modal */}
                {showSizeSelector && (
                    <SizeSelector
                        onClose={() => setShowSizeSelector(false)}
                        onSelectSize={handleSizeSelect}
                    />
                )}
            </div>
        </>
    );
};

export default MobileConfigModal;
