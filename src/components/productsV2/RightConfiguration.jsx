import React, { useState } from 'react';
import './RightConfiguration.css';
import opaqueIcon from '../../assets/images/opaque_gts.svg';
import whiteIcon from '../../assets/images/white_gts.svg';
import ShineGlassButton from '../common/button/ShineGlassButton';

const RightConfiguration = () => {
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('6.0');

    const handleQuantityChange = (increment) => {
        setQuantity(prev => Math.max(1, prev + increment));
    };

    return (
        <div className="right-configuration">
            <div className="product-info">
                <h1 className="product-title heading-1--no-margin">LUMINA OLIVIA 5</h1>

                <div className="configuration-options">
                    <div className="option-row">
                        <span className="option-label bodytext-3--no-margin">Shape</span>
                        <div className="option-value-container">
                            <span className="option-value bodytext-1--no-margin">Pear</span>
                            <img src={opaqueIcon} alt="" className="option-icon" />
                        </div>
                    </div>

                    <div className="option-row">
                        <span className="option-label bodytext-3--no-margin">Metal</span>
                        <div className="option-value-container">
                            <span className="option-value bodytext-1--no-margin">Yellow Gold</span>
                            <img src={opaqueIcon} alt="" className="option-icon" />
                        </div>
                    </div>

                    <div className="option-row">
                        <span className="option-label bodytext-3--no-margin">Band</span>
                        <div className="option-value-container">
                            <span className="option-value bodytext-1--no-margin">Single band</span>
                            <img src={opaqueIcon} alt="" className="option-icon" />
                        </div>
                    </div>

                    <div className="option-row size-row">
                        <span className="option-label bodytext-3--no-margin">Size</span>
                        <div className="size-selector">
                            <span className="size-value bodytext-1--no-margin">{size}</span>
                            <img src={whiteIcon} alt="" className="size-arrow-icon" />
                        </div>
                    </div>

                    <div className="option-row quantity-row">
                        <span className="option-label bodytext-3--no-margin">Quantity</span>
                        <div className="quantity-selector">
                            <button
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="quantity-value bodytext-1--no-margin"
                                min="1"
                            />
                            <button
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="additional-info">
                    <p className="shipping-info bodytext-4--no-margin">Complimentary shipping & returns</p>
                    <a href="#" className="contact-link bodytext-4--no-margin">Contact us</a>
                </div>

                <div className="price-section">
                    <span className="price heading-3--no-margin">$15,600</span>
                </div>

                <div className="action-buttons">
                    <ShineGlassButton
                        className="wishlist-btn-glass"
                        width={56}
                        height={56}
                        theme="footer"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </ShineGlassButton>

                    <ShineGlassButton
                        className="appointment-btn-glass"
                        theme="light"
                        width={330}
                    >
                        Book An Appointment
                    </ShineGlassButton>
                </div>

                <button className="order-btn">
                    Order Now
                </button>
            </div>
        </div>
    );
};

export default RightConfiguration;