import React, { useState } from 'react';
import './OrderFormModal.css';
import { ordersAPI, handleAPIError } from '@services/api';
import { useAuth } from '@/context/AuthContext';

const OrderFormModal = ({ isOpen, onClose, productDetails, onSuccess }) => {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: '',
        specialRequests: '',
        paymentPreference: 'DEPOSIT'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Name is required';
        }

        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
            newErrors.customerEmail = 'Please enter a valid email';
        }

        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Phone number is required';
        }

        if (!formData.deliveryAddress.trim()) {
            newErrors.deliveryAddress = 'Delivery address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const subtotal = productDetails.price * productDetails.quantity;

            // Get user info if logged in
            const userId = user?.id || 'guest';

            // Prepare order data matching backend requirements
            const orderData = {
                // Required fields from validation errors
                userId: userId,
                productId: productDetails.id || 'PRD000024', // Mirror Custom Ring
                subtotalAmount: subtotal,
                paymentTermsType: 'CUSTOM', // Will be updated by admin when confirming

                // Customer information
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                deliveryAddress: formData.deliveryAddress,

                // Product details
                productName: productDetails.name,
                productConfiguration: {
                    shape: productDetails.shape,
                    metal: productDetails.metal,
                    band: productDetails.band,
                    size: productDetails.size,
                    quantity: productDetails.quantity
                },

                // Pricing
                totalAmount: subtotal,
                currency: 'USD',

                // Additional information
                specialRequests: formData.specialRequests || null,
                paymentPreference: formData.paymentPreference,

                // Status
                status: 'NEW'
            };

            // Submit to backend
            const response = await ordersAPI.create(orderData);

            // Success - call onSuccess callback with order details
            onSuccess(response.data);

        } catch (err) {
            const apiError = handleAPIError(err, 'Failed to submit order');
            setSubmitError(apiError.message);
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === 'order-form-overlay') {
            onClose();
        }
    };

    return (
        <div className="order-form-overlay" onClick={handleOverlayClick}>
            <div className="order-form-modal">
                <div className="order-form-header">
                    <h2 className="order-form-title heading-2--no-margin">Complete Your Order</h2>
                    <button
                        className="order-form-close"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <div className="order-form-content">
                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3 className="bodytext-2--no-margin">Order Summary</h3>
                        <div className="order-summary-details">
                            <p className="bodytext-3--no-margin"><strong>{productDetails.name}</strong></p>
                            <div className="order-summary-specs">
                                <span className="bodytext-4--no-margin">Shape: {productDetails.shape}</span>
                                <span className="bodytext-4--no-margin">Metal: {productDetails.metal}</span>
                                <span className="bodytext-4--no-margin">Band: {productDetails.band}</span>
                                <span className="bodytext-4--no-margin">Size: {productDetails.size}</span>
                                <span className="bodytext-4--no-margin">Quantity: {productDetails.quantity}</span>
                            </div>
                            <p className="order-summary-price heading-3--no-margin">
                                ${(productDetails.price * productDetails.quantity).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Order Form */}
                    <form onSubmit={handleSubmit} className="order-form">
                        <div className="form-section">
                            <h3 className="bodytext-2--no-margin">Contact Information</h3>

                            <div className="form-group">
                                <label className="bodytext-4--no-margin">Full Name *</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.customerName ? 'error' : ''}`}
                                    placeholder="Enter your full name"
                                    disabled={isSubmitting}
                                />
                                {errors.customerName && (
                                    <span className="form-error bodytext-4--no-margin">{errors.customerName}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="bodytext-4--no-margin">Email Address *</label>
                                <input
                                    type="email"
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.customerEmail ? 'error' : ''}`}
                                    placeholder="your.email@example.com"
                                    disabled={isSubmitting}
                                />
                                {errors.customerEmail && (
                                    <span className="form-error bodytext-4--no-margin">{errors.customerEmail}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="bodytext-4--no-margin">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.customerPhone ? 'error' : ''}`}
                                    placeholder="+1 (555) 000-0000"
                                    disabled={isSubmitting}
                                />
                                {errors.customerPhone && (
                                    <span className="form-error bodytext-4--no-margin">{errors.customerPhone}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="bodytext-2--no-margin">Delivery Information</h3>

                            <div className="form-group">
                                <label className="bodytext-4--no-margin">Delivery Address *</label>
                                <textarea
                                    name="deliveryAddress"
                                    value={formData.deliveryAddress}
                                    onChange={handleInputChange}
                                    className={`form-textarea ${errors.deliveryAddress ? 'error' : ''}`}
                                    placeholder="Enter your complete delivery address"
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                                {errors.deliveryAddress && (
                                    <span className="form-error bodytext-4--no-margin">{errors.deliveryAddress}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="bodytext-2--no-margin">Payment Preference</h3>

                            <div className="payment-options">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentPreference"
                                        value="FULL"
                                        checked={formData.paymentPreference === 'FULL'}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    />
                                    <span className="bodytext-4--no-margin">Full Payment</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentPreference"
                                        value="DEPOSIT"
                                        checked={formData.paymentPreference === 'DEPOSIT'}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    />
                                    <span className="bodytext-4--no-margin">50% Deposit (Recommended)</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentPreference"
                                        value="CUSTOM"
                                        checked={formData.paymentPreference === 'CUSTOM'}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    />
                                    <span className="bodytext-4--no-margin">Custom Terms (We'll contact you)</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="bodytext-2--no-margin">Additional Information</h3>

                            <div className="form-group">
                                <label className="bodytext-4--no-margin">Special Requests (Optional)</label>
                                <textarea
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleInputChange}
                                    className="form-textarea"
                                    placeholder="Any special requests or customizations?"
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {submitError && (
                            <div className="form-error-message">
                                {submitError}
                            </div>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="form-button form-button-secondary bodytext-4--no-margin"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="form-button form-button-primary bodytext-4--no-margin"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrderFormModal;
