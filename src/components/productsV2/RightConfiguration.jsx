import React, { useState } from 'react';
import './RightConfiguration.css';
import opaqueIcon from '../../assets/images/opaque_gts.svg';
import whiteIcon from '../../assets/images/white_gts.svg';
import ShineGlassButton from '../common/button/ShineGlassButton';
import SizeSelector from './SizeSelector';

const RightConfiguration = ({ hideButtons = false, productConfig, setProductConfig, onOrderNow }) => {
    const [showSizeSelector, setShowSizeSelector] = useState(false);

    // Use productConfig if provided, otherwise use local state
    const quantity = productConfig?.quantity || 1;
    const size = productConfig?.size || '6.0';

    const handleQuantityChange = (increment) => {
        const newQuantity = Math.max(1, quantity + increment);
        if (setProductConfig) {
            setProductConfig(prev => ({ ...prev, quantity: newQuantity }));
        }
    };

    const handleSizeSelect = (sizeItem) => {
        const newSize = sizeItem.size.toString();
        if (setProductConfig) {
            setProductConfig(prev => ({ ...prev, size: newSize }));
        }
        setShowSizeSelector(false);
    };

    const handleOrderNowClick = () => {
        if (onOrderNow) {
            onOrderNow();
        }
    };

    return (
        <div className="pv2-right-configuration">
            <div className="pv2-product-info">
                <h1 className="pv2-product-title heading-1--no-margin">LUMINA OLIVIA 5</h1>

                <div className="pv2-configuration-options">
                    <div className="pv2-option-row">
                        <span className="pv2-option-label bodytext-3--no-margin">Shape</span>
                        <div className="pv2-option-value-container">
                            <span className="pv2-option-value bodytext-1--no-margin">Pear</span>
                            <img src={opaqueIcon} alt="" className="pv2-option-icon" />
                        </div>
                    </div>

                    <div className="pv2-option-row">
                        <span className="pv2-option-label bodytext-3--no-margin">Metal</span>
                        <div className="pv2-option-value-container">
                            <span className="pv2-option-value bodytext-1--no-margin">Yellow Gold</span>
                            <img src={opaqueIcon} alt="" className="pv2-option-icon" />
                        </div>
                    </div>

                    <div className="pv2-option-row">
                        <span className="pv2-option-label bodytext-3--no-margin">Band</span>
                        <div className="pv2-option-value-container">
                            <span className="pv2-option-value bodytext-1--no-margin">Single band</span>
                            <img src={opaqueIcon} alt="" className="pv2-option-icon" />
                        </div>
                    </div>

                    <div className="pv2-option-row pv2-size-row">
                        <span className="pv2-option-label bodytext-3--no-margin">Size</span>
                        <div className="pv2-size-selector" onClick={() => setShowSizeSelector(true)}>
                            <span className="pv2-size-value bodytext-1--no-margin">{size}</span>
                            <img src={whiteIcon} alt="" className="pv2-size-arrow-icon" />
                        </div>
                    </div>

                    <div className="pv2-option-row pv2-quantity-row">
                        <span className="pv2-option-label bodytext-3--no-margin">Quantity</span>
                        <div className="pv2-quantity-selector">
                            <button
                                className="pv2-quantity-btn"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="pv2-quantity-value bodytext-1--no-margin"
                                min="1"
                            />
                            <button
                                className="pv2-quantity-btn"
                                onClick={() => handleQuantityChange(1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pv2-additional-info">
                    <p className="pv2-shipping-info bodytext-4--no-margin">Complimentary shipping & returns</p>
                    <a href="#" className="pv2-contact-link bodytext-4--no-margin">Contact us</a>
                </div>

                <div className="pv2-price-section">
                    <span className="pv2-price heading-3--no-margin">$15,600</span>
                </div>

                {!hideButtons && (
                    <>
                        <div className="pv2-action-buttons">
                            <ShineGlassButton
                                className="pv2-wishlist-btn-glass"
                                width={56}
                                height={56}
                                theme="footer"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </ShineGlassButton>

                            <div className="pv2-appointment-btn-glass">
                                <ShineGlassButton
                                    theme="footer"
                                >
                                    Book An Appointment
                                </ShineGlassButton>
                            </div>
                        </div>

                        <button
                            className="pv2-order-btn bodytext-4--no-margin"
                            onClick={handleOrderNowClick}
                        >
                            Order Now
                        </button>
                    </>
                )}
            </div>

            {/* Size Selector Modal */}
            {showSizeSelector && (
                <SizeSelector
                    onClose={() => setShowSizeSelector(false)}
                    onSelectSize={handleSizeSelect}
                />
            )}
        </div>
    );
};

export default RightConfiguration;