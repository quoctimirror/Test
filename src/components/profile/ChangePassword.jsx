import React, { useState } from 'react';
import axios from 'axios';
import './ChangePassword.css';

// Tách SVG ra cho sạch sẽ
const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EyeSlashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9790 12.3809 15.0670 11.9781 15.0744C11.5753 15.0818 11.1749
  15.0085 10.8007 14.8590C10.4266 14.7096 10.0875 14.4873 9.80385 14.2037C9.52016 13.9200 9.29792 13.5809 9.14843 13.2068C8.99895 12.8326 8.92559 12.4322       
  8.93303 12.0294C8.94047 11.6266 9.02848 11.2293 9.19239 10.8614C9.35630 10.4934 9.59270 10.1621 9.88748 9.88748M17.94 17.94C16.2306 19.243 14.1491
  19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356
  21.6691 14.2048 20.84 15.19M14.12 14.12L9.88 9.88M14.12 14.12L20 20M9.88 9.88L4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" />
    </svg>
);

const ChangePassword = ({ onClose }) => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    // SỬA TÊN FUNCTION
    const getAuthToken = () => {
        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        console.log('AccessToken found:', !!accessToken);
        console.log('Token preview:', accessToken ? accessToken.substring(0, 50) + '...' : 'null');
        return accessToken;
    };

    const validateForm = () => {
        const newErrors = {};
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword.trim()) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!newPassword.trim()) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 8) {
            newErrors.newPassword = 'New password must be at least 8 characters';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const accessToken = getAuthToken(); // SỬA TÊN FUNCTION CALL

            if (!accessToken) {
                console.error('No accessToken found in storage');
                setErrors({ form: 'Please login again to change password' });
                setIsLoading(false);
                return;
            }

            console.log('Sending request to change password...');

            const response = await axios.post('http://localhost:8081/api/v1/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Password changed successfully:', response.data);
            alert('Password changed successfully!');
            onClose();
        } catch (error) {
            console.error('Password change failed:', error);
            console.error('Error response:', error.response?.data);

            if (error.response?.status === 401) {
                setErrors({ form: 'Session expired. Please login again.' });
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
                setErrors({ form: errorMessage });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="change-password-overlay">
            <div className="change-password-modal">
                <div className="change-password-header">
                    <h2>Change Password</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="change-password-form">
                    <div className="form-field-container">
                        <label className="form-field-label">Current Password*</label>
                        <div className="password-input-container">
                            <input
                                type={showPasswords.currentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handleInputChange}
                                className="form-input password-input"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => togglePasswordVisibility('currentPassword')}
                                aria-label={showPasswords.currentPassword ? "Hide password" : "Show password"}
                            >
                                {showPasswords.currentPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.currentPassword && <p className="input-error">{errors.currentPassword}</p>}
                    </div>

                    <div className="form-field-container">
                        <label className="form-field-label">New Password*</label>
                        <div className="password-input-container">
                            <input
                                type={showPasswords.newPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handleInputChange}
                                className="form-input password-input"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => togglePasswordVisibility('newPassword')}
                                aria-label={showPasswords.newPassword ? "Hide password" : "Show password"}
                            >
                                {showPasswords.newPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.newPassword && <p className="input-error">{errors.newPassword}</p>}
                    </div>

                    <div className="form-field-container">
                        <label className="form-field-label">Confirm New Password*</label>
                        <div className="password-input-container">
                            <input
                                type={showPasswords.confirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handleInputChange}
                                className="form-input password-input"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => togglePasswordVisibility('confirmPassword')}
                                aria-label={showPasswords.confirmPassword ? "Hide password" : "Show password"}
                            >
                                {showPasswords.confirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="input-error">{errors.confirmPassword}</p>}
                    </div>

                    {errors.form && <div className="form-field-container"><p className="input-error">{errors.form}</p></div>}

                    <div className="change-password-buttons">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="submit-button">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
