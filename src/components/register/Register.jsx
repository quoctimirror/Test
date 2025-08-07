import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import './Register.css';

// Tách SVG ra để dùng lại, cho code gọn gàng
const EyeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const EyeSlashIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9790 12.3809 15.0670 11.9781 15.0744C11.5753 15.0818 11.1749 15.0085 10.8007 14.8590C10.4266 14.7096 10.0875 14.4873 9.80385 14.2037C9.52016 13.9200 9.29792 13.5809 9.14843 13.2068C8.99895 12.8326 8.92559 12.4322 8.93303 12.0294C8.94047 11.6266 9.02848 11.2293 9.19239 10.8614C9.35630 10.4934 9.59270 10.1621 9.88748 9.88748M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12L9.88 9.88M14.12 14.12L20 20M9.88 9.88L4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);


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
            await api.post('/api/v1/auth/register', payload);

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
            {isVisible ? <EyeSlashIcon /> : <EyeIcon />}
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
                    <button type="submit" className="create-account-button bodytext-4--no-margin" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create account'}
                    </button>
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