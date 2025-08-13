import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { remoteApi } from '@api/axiosConfig';
import './Register.css';
import EyeIconSvg from '@assets/images/icons/EyeIcon.svg';
import EyeSlashIconSvg from '@assets/images/icons/EyeSlashIcon.svg';
import GlassButton from '../common/GlassButton';


const Register = () => {
    const navigate = useNavigate();
    const titles = ['Ms', 'Mrs', 'Mr'];

    const [formData, setFormData] = useState({
        title: 'Ms',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        const { firstName, lastName, username, email, password, confirmPassword } = formData;

        if (!firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last Name is required';
        if (!username.trim()) newErrors.username = 'Username is required';
        if (!email.trim()) {
            newErrors.email = 'Email Address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Email address is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) { // Cập nhật độ dài tối thiểu theo backend (nếu có)
            newErrors.password = 'Password must be at least 8 characters long.';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password && password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- BƯỚC 3: CẬP NHẬT HOÀN CHỈNH HÀM SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Thực hiện validation phía client trước
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({}); // Xóa lỗi cũ trước khi gửi

        // Tạo payload để gửi đi, chỉ chứa các trường backend cần
        const payload = {
            title: formData.title,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            // phoneNumber là optional, có thể thêm vào nếu form có
        };

        try {
            await remoteApi.post('/api/v1/auth/register', payload);

            // alert('Account created successfully! Please log in.');
            navigate('/auth/login');

        } catch (error) {
            // Xử lý khi thất bại
            let errorMessage = 'Registration failed. Please try again.';

            // Lấy thông báo lỗi cụ thể từ response của backend
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;

                // Hiển thị lỗi ngay tại trường input tương ứng
                if (errorMessage.toLowerCase().includes('username')) {
                    setErrors({ username: errorMessage });
                } else if (errorMessage.toLowerCase().includes('email')) {
                    setErrors({ email: errorMessage });
                } else if (errorMessage.toLowerCase().includes('password')) {
                    setErrors({ password: errorMessage });
                } else {
                    // Lỗi chung không thuộc trường nào
                    setErrors({ form: errorMessage });
                }
            } else {
                // Lỗi mạng hoặc lỗi không xác định
                console.error('Registration failed:', error);
                setErrors({ form: 'Cannot connect to the server. Please try again later.' });
            }
        } finally {
            setIsLoading(false); // Luôn dừng loading sau khi hoàn tất
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const renderPasswordToggle = (isVisible, toggleVisibility) => (
        <button type="button" className="password-toggle" onClick={toggleVisibility} aria-label={isVisible ? "Hide password" : "Show password"}>
            <img src={isVisible ? EyeSlashIconSvg : EyeIconSvg} alt={isVisible ? "Hide password" : "Show password"} width="20" height="20" />
        </button>
    );

    return (
        <div className="register-container">
            <div className="register-form-wrapper">
                <h1 className="heading-1 register-title">CREATE YOUR ACCOUNT</h1>
                <form className="register-form" onSubmit={handleSubmit} noValidate>
                    {/* Hiển thị lỗi chung của form */}
                    {errors.form && <p className="input-error form-error bodytext-4--no-margin">{errors.form}</p>}

                    <div className="title-group">
                        <label className="bodytext-3--no-margin">Title*</label>
                        <div className="title-options">
                            {titles.map((title) => (
                                <span key={title} className={`title-option ${formData.title === title ? 'active' : ''}`} onClick={() => setFormData(prev => ({ ...prev, title }))}>
                                    {title}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-field-container">
                        <div className="input-group">
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="firstName" className="bodytext-3--no-margin">First Name*</label>
                        </div>
                        {errors.firstName && <p className="input-error bodytext-3--no-margin">{errors.firstName}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group">
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="lastName" className="bodytext-3--no-margin">Last name*</label>
                        </div>
                        {errors.lastName && <p className="input-error bodytext-3--no-margin">{errors.lastName}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group">
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="username" className="bodytext-3--no-margin">Username*</label>
                        </div>
                        {errors.username && <p className="input-error bodytext-3--no-margin">{errors.username}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group">
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="email" className="bodytext-3--no-margin">Email Address*</label>
                        </div>
                        {errors.email && <p className="input-error bodytext-3--no-margin">{errors.email}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group password-group">
                            <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="password" className="bodytext-3--no-margin">Password*</label>
                            {renderPasswordToggle(showPassword, () => setShowPassword(!showPassword))}
                        </div>
                        {errors.password && <p className="input-error bodytext-3--no-margin">{errors.password}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group password-group">
                            <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="confirmPassword" className="bodytext-3--no-margin">Confirm Password*</label>
                            {renderPasswordToggle(showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
                        </div>
                        {errors.confirmPassword && <p className="input-error bodytext-3--no-margin">{errors.confirmPassword}</p>}
                    </div>

                    <div className="password-requirements">
                        <p className="bodytext-5--no-margin">Password requirements</p>
                        <ul>
                            <li className="bodytext-5--no-margin">No repetition of more than two characters</li>
                            <li className="bodytext-5--no-margin">One lowercase character</li>
                            <li className="bodytext-5--no-margin">One number</li>
                            <li className="bodytext-5--no-margin">One uppercase character</li>
                            <li className="bodytext-5--no-margin">At least 1 special character(s)</li>
                            <li className="bodytext-5--no-margin">8 characters minimum</li>
                            <li className="bodytext-5--no-margin">{'Allowed special character(s) from !#$€£%&()*+,-./:;<=>?@[]^_~'}</li>
                        </ul>
                    </div>
                    <p className="privacy-info bodytext-4--no-margin"> For further information about how <br /> we use your personal information, please see our <strong>Privacy Policy</strong> </p>
                    <div className="create-account-button-wrapper">
                        <GlassButton 
                            width={300} 
                            height={50} 
                            theme="glass"
                            onClick={() => {}} 
                            className="create-account-button"
                        >
                            {isLoading ? 'Creating Account...' : 'Create account'}
                        </GlassButton>
                    </div>
                    <p className="bodytext-3--no-margin login-prompt">
                        Already a member?{' '}
                        <a onClick={() => navigate('/auth/login')} className="bodytext-3--no-margin return-login-link">
                            Login now
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;