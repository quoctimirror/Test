import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import api from '@api/axiosConfig';
import EyeIconSvg from '@assets/images/icons/EyeIcon.svg';
import EyeSlashIconSvg from '@assets/images/icons/EyeSlashIcon.svg';

const Login = () => {
  const navigate = useNavigate();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when component mounts (when navigating from register)
  useEffect(() => {
    setLoginInput('');
    setPassword('');
    setShowPassword(false);
    setErrors({});

    // Force reset any cached styles
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
      toggle.style.color = 'var(--transparent-black-50, rgba(0, 0, 0, 0.50))';
    });
  }, []);

  const isEmailFormat = (input) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(input).toLowerCase());
  };

  const hasWhitespace = (input) => /\s/.test(input);

  const validateForm = () => {
    const newErrors = {};
    const trimmedLoginInput = loginInput.trim();
    if (!trimmedLoginInput) {
      newErrors.login = 'Username or Email is required';
    } else if (!isEmailFormat(trimmedLoginInput) && hasWhitespace(trimmedLoginInput)) {
      newErrors.login = 'Username cannot contain spaces';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => { // Chuyển thành hàm async
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Xóa lỗi cũ trước khi gọi API

    const payload = {
      username: loginInput.trim(),
      password: password
    };

    try {
      // --- DEBUG LOGGING ---
      // console.log("Sending request to URL:", api.defaults.baseURL + '/api/v1/auth/authenticate');
      // console.log("With payload:", payload);
      // -----------------------------

      const response = await api.post('/api/v1/auth/authenticate', payload);

      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // alert('Login successful!');
      navigate('/user-profile');

    } catch (error) {
      // --- XỬ LÝ KHI THẤT BẠI ---
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.response) {
        // Lỗi từ server (4xx, 5xx)
        console.error("API Error:", error.response.data);
        errorMessage = error.response.data.message || 'Invalid username or password.';
        if (error.response.status === 401) {
          setErrors({ password: 'Password is incorrect.' });
        } else {
          setErrors({ login: 'User not found or account is locked.' });
        }
      } else if (error.request) {
        // Lỗi không kết nối được server
        errorMessage = 'Cannot connect to the server. Please check your network.';
        setErrors({ form: errorMessage });
      }
      console.error('Login failed:', error);
      // Bạn có thể hiển thị lỗi này trên form
      // setErrors(prev => ({...prev, form: errorMessage}));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    if (errors[e.target.name]) {
      setErrors(prevErrors => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1 className="heading-1 login-title">WELCOME BACK!</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* === THAY ĐỔI BẮT ĐẦU TỪ ĐÂY === */}

          {/* Cụm Input cho Username/Email */}
          <div className="form-field-container">
            <div className="input-group">
              <input
                type="text"
                id="login"
                name="login"
                value={loginInput}
                onChange={(e) => handleInputChange(e, setLoginInput)}
                placeholder=" "
                required
              />
              <label htmlFor="login" className="bodytext-3--no-margin floating-label">Username/Email</label>
            </div>
            {/* Chuyển lỗi ra ngoài input-group */}
            {errors.login && <p className="bodytext-4--no-margin input-error">{errors.login}</p>}
          </div>

          {/* Cụm Input cho Password */}
          <div className="form-field-container">
            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => handleInputChange(e, setPassword)}
                placeholder=" "
                required
              />
              <label htmlFor="password" className="bodytext-3--no-margin floating-label">Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img src={showPassword ? EyeSlashIconSvg : EyeIconSvg} alt={showPassword ? "Hide password" : "Show password"} width="20" height="20" />
              </button>
            </div>
            {/* Chuyển lỗi ra ngoài input-group */}
            {errors.password && <p className="bodytext-4--no-margin input-error">{errors.password}</p>}
          </div>

          {/* === KẾT THÚC THAY ĐỔI === */}

          <Link to="/forgot-password" className="bodytext-4--no-margin forgot-password-link">
            Forgot password?
          </Link>

          <button
            type="submit"
            className="bodytext-4--no-margin sign-in-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="bodytext-3--no-margin register-prompt">
          Not a member?{' '}
          <Link to="/auth/register" className="bodytext-3--no-margin register-link">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;