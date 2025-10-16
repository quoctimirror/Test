import React from 'react';
import './OrderSuccessModal.css';
import ShineGlassButton from '../common/button/ShineGlassButton';

const OrderSuccessModal = ({ isOpen, onClose, orderDetails }) => {
    if (!isOpen || !orderDetails) return null;

    const handleOverlayClick = (e) => {
        if (e.target.className === 'order-success-overlay') {
            onClose();
        }
    };

    return (
        <div className="order-success-overlay" onClick={handleOverlayClick}>
            <div className="order-success-modal">
                <div className="order-success-icon">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="38" stroke="#d4567d" strokeWidth="3" fill="rgba(212, 86, 125, 0.1)" />
                        <path
                            d="M25 40L35 50L55 30"
                            stroke="#d4567d"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <h2 className="order-success-title heading-2--no-margin">Order Submitted Successfully!</h2>

                <p className="order-success-message bodytext-3--no-margin">
                    Thank you for your order. We have received your request and will contact you shortly to confirm the details and payment arrangements.
                </p>

                <div className="order-success-details">
                    <div className="order-success-card">
                        <h3 className="bodytext-2--no-margin">Order Reference</h3>
                        <p className="order-reference heading-3--no-margin">#{orderDetails.id || 'Pending'}</p>
                    </div>

                    <div className="order-success-info">
                        <div className="order-info-row">
                            <span className="bodytext-4--no-margin">Customer Name:</span>
                            <span className="bodytext-3--no-margin">{orderDetails.customerName}</span>
                        </div>
                        <div className="order-info-row">
                            <span className="bodytext-4--no-margin">Email:</span>
                            <span className="bodytext-3--no-margin">{orderDetails.customerEmail}</span>
                        </div>
                        <div className="order-info-row">
                            <span className="bodytext-4--no-margin">Product:</span>
                            <span className="bodytext-3--no-margin">{orderDetails.productName}</span>
                        </div>
                        <div className="order-info-row">
                            <span className="bodytext-4--no-margin">Total Amount:</span>
                            <span className="bodytext-3--no-margin order-amount">
                                ${orderDetails.totalAmount?.toLocaleString() || '0'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="order-success-next-steps">
                    <h3 className="bodytext-2--no-margin">What's Next?</h3>
                    <ul className="next-steps-list">
                        <li className="bodytext-4--no-margin">
                            <span className="step-number">1</span>
                            You will receive a confirmation email shortly
                        </li>
                        <li className="bodytext-4--no-margin">
                            <span className="step-number">2</span>
                            Our team will review your order and contact you within 24 hours
                        </li>
                        <li className="bodytext-4--no-margin">
                            <span className="step-number">3</span>
                            We'll discuss payment terms and delivery timeline
                        </li>
                        <li className="bodytext-4--no-margin">
                            <span className="step-number">4</span>
                            Your custom piece will be crafted with care
                        </li>
                    </ul>
                </div>

                <div className="order-success-actions">
                    <ShineGlassButton
                        theme="footer"
                        onClick={onClose}
                        className="continue-shopping-btn"
                    >
                        Continue Shopping
                    </ShineGlassButton>
                </div>

                <p className="order-success-contact bodytext-4--no-margin">
                    Questions? Contact us at <a href="mailto:orders@mirrorfuturediamond.com">orders@mirrorfuturediamond.com</a>
                </p>
            </div>
        </div>
    );
};

export default OrderSuccessModal;
