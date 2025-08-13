// src/pages/Profile/Profile.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { remoteApi } from '../../api/axiosConfig'; // <-- SỬ DỤNG REMOTE API CHO PROFILE
import './Profile.css';
import '@styles/typography.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ChangePassword from './ChangePassword';
import GlassButton from '../common/GlassButton';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const navigate = useNavigate();
    // Bây giờ chỉ cần 'logout' từ context, không cần 'handleApiError' nữa
    const { logout } = useAuth();

    // ... (Các state và hằng số không thay đổi)
    const titles = ['Ms', 'Mrs', 'Mr'];
    const navItems = ['My Passport', 'Orders', 'Services', 'Address Book', 'Wishlist'];

    // Danh sách các quốc gia
    const countries = [
        'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
        'Bangladesh', 'Belgium', 'Brazil', 'Bulgaria', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia',
        'Croatia', 'Czech Republic', 'Denmark', 'Egypt', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany',
        'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
        'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'South Korea', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania',
        'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Pakistan',
        'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'Slovakia',
        'Slovenia', 'South Africa', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
        'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam'
    ];

    const [formData, setFormData] = useState({
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        phoneNumber: '',
        nationality: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeNavItem, setActiveNavItem] = useState('My Passport');
    const [showChangePassword, setShowChangePassword] = useState(false);

    // ... (Các hàm validate, handleInputChange, handlePhoneChange, etc. không thay đổi)
    const validateForm = () => {
        const newErrors = {};
        const { firstName, lastName, email, phoneNumber, dateOfBirth } = formData;

        if (!firstName.trim()) newErrors.firstName = 'First Name is required';
        else if (firstName.trim().length < 2) newErrors.firstName = 'First Name must be at least 2 characters';
        else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(firstName.trim())) newErrors.firstName = 'First Name contains invalid characters';

        if (!lastName.trim()) newErrors.lastName = 'Last Name is required';
        else if (lastName.trim().length < 2) newErrors.lastName = 'Last Name must be at least 2 characters';
        else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(lastName.trim())) newErrors.lastName = 'Last Name contains invalid characters';

        if (!email.trim()) newErrors.email = 'Email Address is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email address is invalid';

        if (phoneNumber && phoneNumber.length < 10) newErrors.phoneNumber = 'Phone number is too short';

        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 18 || age > 120) newErrors.dateOfBirth = 'Please enter a valid date of birth';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handlePhoneChange = (phone) => {
        setFormData(prev => ({ ...prev, phoneNumber: phone }));
        if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: null }));
    };

    const handleTitleSelect = (title) => {
        setFormData(prev => ({ ...prev, title }));
    };

    const handleNationalityChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, nationality: value }));
        if (errors.nationality) setErrors(prev => ({ ...prev, nationality: null }));
    };

    const handleNavClick = (navItem) => {
        setActiveNavItem(navItem);
    };

    const handleLogout = () => {
        logout(); // Gọi thẳng hàm logout từ context
    };


    // useEffect để lấy thông tin user - ĐƠN GIẢN HƠN RẤT NHIỀU
    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            try {
                // Chỉ cần gọi remoteApi.get. Mọi thứ khác đã được interceptor xử lý.
                const response = await remoteApi.get('/api/v1/users/me');
                let userData = response.data;
                if (userData.dateOfBirth) {
                    userData.dateOfBirth = userData.dateOfBirth.split('T')[0];
                }
                setFormData(prev => ({ ...prev, ...userData }));
            } catch (error) {
                // Lỗi ở đây có nghĩa là request đã thất bại ngay cả sau khi thử lại
                console.error('Failed to fetch user profile:', error);
                setErrors({ form: 'Could not load your profile. Please log in again.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        // Chuyển đổi date format từ yyyy-MM-dd sang MM/dd/yyyy
        let formattedDateOfBirth = null;
        if (formData.dateOfBirth) {
            const date = new Date(formData.dateOfBirth);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            formattedDateOfBirth = `${month}/${day}/${year}`;
        }

        const payload = {
            title: formData.title,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            dateOfBirth: formattedDateOfBirth,  // <-- Sử dụng format đã chuyển đổi
            phoneNumber: formData.phoneNumber,
            nationality: formData.nationality,
        };

        try {
            await remoteApi.put('/api/v1/users/me', payload);
            // alert('Your changes have been saved successfully!');
        } catch (error) {
            console.error('Failed to save profile:', error);
            const errorMessage = error.response?.data?.message || 'Save failed. Please try again.';
            setErrors({ form: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };


    // Phần JSX return không có gì thay đổi
    if (isLoading && !formData.firstName) { // Chỉ hiển thị loading nếu chưa có dữ liệu
        return <div className="profile-loading">Loading Profile...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-form-wrapper">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-info">
                        <h1 className="heading-1 profile-name">{formData.firstName}<br />{formData.lastName}</h1>
                        <div className="profile-logout" onClick={handleLogout}>Logout</div>
                    </div>
                    <div className="profile-center"><div className="profile-logo"></div></div>
                    <div className="profile-tier">
                        <p className="tier-level">Tier 3</p>
                        <p className="tier-name">hewhewe</p>
                    </div>
                </div>

                {/* Header Navigation */}
                <div className="profile-nav-header">
                    <nav className="profile-nav">
                        {navItems.map(item => (
                            <div key={item} className={`profile-nav-item ${activeNavItem === item ? 'active' : ''}`} onClick={() => handleNavClick(item)}>
                                {item}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Form Content */}
                <div className="profile-form-content">
                    <form className="profile-form" onSubmit={handleSubmit} noValidate>
                        {/* Title */}
                        <div className="title-group">
                            <label className="bodytext-3--no-margin">Title*</label>
                            <div className="title-options">
                                {titles.map(title => (
                                    <span
                                        key={title}
                                        onClick={() => handleTitleSelect(title)}
                                        className={`title-option bodytext-3--no-margin ${formData.title?.toLowerCase() === title.toLowerCase() ? 'active' : ''}`}
                                    >
                                        {title}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="form-field-container">
                            <label className="bodytext-3--no-margin">First Name*</label>
                            <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="form-input bodytext-3--no-margin" required />
                            {errors.firstName && <p className="input-error bodytext-4--no-margin">{errors.firstName}</p>}
                        </div>
                        <div className="form-field-container">
                            <label className="bodytext-3--no-margin">Last name*</label>
                            <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="form-input bodytext-3--no-margin" required />
                            {errors.lastName && <p className="input-error bodytext-4--no-margin">{errors.lastName}</p>}
                        </div>
                        <div className="form-field-container">
                            <label className="bodytext-3--no-margin">Email Address*</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="form-input bodytext-3--no-margin" required />
                            {errors.email && <p className="input-error bodytext-4--no-margin">{errors.email}</p>}
                        </div>
                        <div className="form-field-container">
                            <label className="bodytext-3--no-margin">Day of Birth</label>
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} className="form-input bodytext-3--no-margin" />
                            {errors.dateOfBirth && <p className="input-error bodytext-4--no-margin">{errors.dateOfBirth}</p>}
                        </div>

                        <div className="phone-input-container">
                            <label className="bodytext-3--no-margin">Phone Number</label>
                            <PhoneInput
                                country={'vn'}
                                value={formData.phoneNumber}
                                onChange={handlePhoneChange}
                                inputClass="phone-input-field bodytext-3--no-margin"
                                containerClass="phone-input-control"
                                buttonClass="phone-dropdown-button"
                            />
                            {errors.phoneNumber && <p className="input-error bodytext-4--no-margin">{errors.phoneNumber}</p>}
                        </div>

                        <div className="form-field-container">
                            <label className="bodytext-3--no-margin">Nationality</label>
                            <select
                                name="nationality"
                                value={formData.nationality || ''}
                                onChange={handleNationalityChange}
                                className="form-input nationality-dropdown bodytext-3--no-margin"
                            >
                                <option value="">Select a country</option>
                                {countries.map(country => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        {errors.form && <div className="form-field-container"><p className="input-error bodytext-4--no-margin">{errors.form}</p></div>}

                        <div className="action-buttons-container">
                            <GlassButton
                                width={200}
                                height={50}
                                theme="outline"
                                onClick={() => setShowChangePassword(true)}
                                className="change-password-button"
                            >
                                Change Password
                            </GlassButton>
                            <GlassButton
                                width={200}
                                height={50}
                                theme="outline"
                                onClick={() => { }}
                                className="save-profile-button"
                            >
                                {isLoading ? 'Saving...' : 'Save Profile'}
                            </GlassButton>
                        </div>
                    </form>
                </div>
            </div>
            {showChangePassword && (
                <ChangePassword onClose={() => setShowChangePassword(false)} />
            )}
        </div>
    );
};

export default Profile;