import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

// Tách SVG ra để dùng lại, cho code gọn gàng
const EyeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const EyeSlashIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9790 12.3809 15.0670 11.9781 15.0744C11.5753 15.0818 11.1749 15.0085 10.8007 14.8590C10.4266 14.7096 10.0875 14.4873 9.80385 14.2037C9.52016 13.9200 9.29792 13.5809 9.14843 13.2068C8.99895 12.8326 8.92559 12.4322 8.93303 12.0294C8.94047 11.6266 9.02848 11.2293 9.19239 10.8614C9.35630 10.4934 9.59270 10.1621 9.88748 9.88748M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12L9.88 9.88M14.12 14.12L20 20M9.88 9.88L4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);


const Register = () => {
    const navigate = useNavigate();
    const titles = ['Mr', 'Mrs', 'Ms'];

    // State cho toàn bộ form data
    const [formData, setFormData] = useState({
        title: 'Ms',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // State cho việc hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State cho lỗi và loading
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // --- LOGIC VALIDATION ---
    const validateForm = () => {
        const newErrors = {};
        const { firstName, lastName, username, email, password, confirmPassword } = formData;

        // Các kiểm tra cơ bản
        if (!firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last Name is required';
        if (!username.trim()) newErrors.username = 'Username is required';
        if (!email.trim()) {
            newErrors.email = 'Email Address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Email address is invalid';
        }

        // Kiểm tra mật khẩu phức tạp
        if (!password) {
            newErrors.password = 'Password is required';
        } else {
            if (password.length < 10) newErrors.password = 'Password must be at least 10 characters long.';
            else if (!/[a-z]/.test(password)) newErrors.password = 'Password must contain at least one lowercase character.';
            else if (!/[A-Z]/.test(password)) newErrors.password = 'Password must contain at least one uppercase character.';
            else if (!/[0-9]/.test(password)) newErrors.password = 'Password must contain at least one number.';
            else if (!/[!#$€£%&()*+,-./:;<=>?@\[\]\^_~]/.test(password)) newErrors.password = 'Password must contain at least one special character.';
            else if (/(.)\1\1/.test(password)) newErrors.password = 'Password cannot contain a repetition of more than two characters.';
        }

        // Kiểm tra xác nhận mật khẩu
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password && password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Hàm xử lý khi submit form
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     if (!validateForm()) return;

    //     setIsLoading(true);
    //     console.log("Form is valid, submitting data:", formData);

    //     setTimeout(() => {
    //         setIsLoading(false);
    //         alert('Account created successfully! Redirecting to login...');
    //         navigate('/auth/login');
    //     }, 2000);
    // };

    const handleSubmit = async (e) => { // Chuyển thành hàm async
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        // Tạo payload để gửi đi, chỉ chứa các trường backend cần
        const payload = {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            // phoneNumber là optional trong backend, có thể thêm nếu có input
        };

        try {
            await axios.post('http://localhost:8081/api/v1/auth/register', payload);

            // --- XỬ LÝ KHI THÀNH CÔNG ---
            alert('Account created successfully! Please log in.');
            navigate('/auth/login'); // Chuyển hướng đến trang đăng nhập

        } catch (error) {
            // --- XỬ LÝ KHI THẤT BẠI ---
            let errorMessage = 'Registration failed. Please try again.';
            if (error.response && error.response.data) {
                console.error("API Error:", error.response.data);
                errorMessage = error.response.data.message || errorMessage;
                // Hiển thị lỗi cụ thể
                if (errorMessage.toLowerCase().includes('username')) {
                    setErrors({ username: errorMessage });
                } else if (errorMessage.toLowerCase().includes('email')) {
                    setErrors({ email: errorMessage });
                } else if (errorMessage.toLowerCase().includes('password')) {
                    setErrors({ password: errorMessage });
                } else {
                    setErrors({ form: errorMessage });
                }
            } else {
                console.error('Registration failed:', error);
                setErrors({ form: 'Cannot connect to the server.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý chung cho việc thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Xóa lỗi khi người dùng bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Hàm render nút toggle password
    const renderPasswordToggle = (isVisible, toggleVisibility) => (
        <button type="button" className="password-toggle" onClick={toggleVisibility} aria-label={isVisible ? "Hide password" : "Show password"}>
            {isVisible ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
    );

    return (
        <div className="register-container">
            <div className="register-form-wrapper">
                <h1 className="register-title">CREATE YOUR ACCOUNT</h1>
                <form className="register-form" onSubmit={handleSubmit} noValidate>
                    <div className="title-group">
                        <label>Title*</label>
                        <div className="title-options">
                            {titles.map((title) => (
                                <span key={title} className={`title-option ${formData.title === title ? 'active' : ''}`} onClick={() => setFormData(prev => ({ ...prev, title }))}>
                                    {title}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* === CẤU TRÚC FORM ĐÃ ĐƯỢC CẬP NHẬT === */}
                    <div className="form-field-container">
                        <div className="input-group">
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="firstName">First Name*</label>
                        </div>
                        {errors.firstName && <p className="input-error">{errors.firstName}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group">
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="lastName">Last name*</label>
                        </div>
                        {errors.lastName && <p className="input-error">{errors.lastName}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group">
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="username">Username*</label>
                        </div>
                        {errors.username && <p className="input-error">{errors.username}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group">
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="email">Email Address*</label>
                        </div>
                        {errors.email && <p className="input-error">{errors.email}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group password-group">
                            <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="password">Password*</label>
                            {renderPasswordToggle(showPassword, () => setShowPassword(!showPassword))}
                        </div>
                        {errors.password && <p className="input-error">{errors.password}</p>}
                    </div>

                    <div className="form-field-container">
                        <div className="input-group password-group">
                            <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder=" " required />
                            <label htmlFor="confirmPassword">Confirm Password*</label>
                            {renderPasswordToggle(showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
                        </div>
                        {errors.confirmPassword && <p className="input-error">{errors.confirmPassword}</p>}
                    </div>


                    <div className="password-requirements">
                        <p>Password requirements</p>
                        <ul>
                            <li>No repetition of more than two characters</li>
                            <li>One lowercase character</li>
                            <li>One number</li>
                            <li>One uppercase character</li>
                            <li>At least 1 special character(s)</li>
                            <li>10 characters minimum</li>
                            <li>{'Allowed special character(s) from !#$€£%&()*+,-./:;<=>?@[]^_~'}</li>
                        </ul>
                    </div>
                    <p className="privacy-info"> For further information about how <br /> we use your personal information, please see our <strong>Privacy Policy</strong> </p>
                    <button type="submit" className="create-account-button" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create account'}
                    </button>
                    <a onClick={() => navigate('/auth/login')} className="return-login-link">
                        Return to Login
                    </a>
                </form>
            </div>
        </div>
    );
};

export default Register;