import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

// Tách SVG ra cho sạch sẽ
const EyeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const EyeSlashIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9790 12.3809 15.0670 11.9781 15.0744C11.5753 15.0818 11.1749 15.0085 10.8007 14.8590C10.4266 14.7096 10.0875 14.4873 9.80385 14.2037C9.52016 13.9200 9.29792 13.5809 9.14843 13.2068C8.99895 12.8326 8.92559 12.4322 8.93303 12.0294C8.94047 11.6266 9.02848 11.2293 9.19239 10.8614C9.35630 10.4934 9.59270 10.1621 9.88748 9.88748M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12L9.88 9.88M14.12 14.12L20 20M9.88 9.88L4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);

const Login = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;
  //   console.log('Form is valid:', { login: loginInput.trim(), password });
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     alert(`Login simulation for "${loginInput.trim()}" finished!`);
  //   }, 2000);
  // };

  const handleSubmit = async (e) => { // Chuyển thành hàm async
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Xóa lỗi cũ trước khi gọi API

    try {
      const response = await axios.post('http://localhost:8081/api/v1/auth/authenticate', {
        username: loginInput.trim(), // Backend của bạn đang chờ 'username'
        password: password
      });

      // --- XỬ LÝ KHI THÀNH CÔNG ---
      const { accessToken, refreshToken } = response.data;

      // Lưu token vào localStorage để sử dụng cho các lần gọi API sau
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Thiết lập header mặc định cho axios để tự động gửi token
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      alert('Login successful!');
      navigate('/dashboard'); // Chuyển hướng đến trang dashboard hoặc trang chính

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
        <h1 className="login-title">WELCOME BACK!</h1>

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
                placeholder="Username/Email"
                required
              />
            </div>
            {/* Chuyển lỗi ra ngoài input-group */}
            {errors.login && <p className="input-error">{errors.login}</p>}
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
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {/* Chuyển lỗi ra ngoài input-group */}
            {errors.password && <p className="input-error">{errors.password}</p>}
          </div>

          {/* === KẾT THÚC THAY ĐỔI === */}

          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>

          <button type="submit" className="sign-in-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="register-prompt">
          Not a member?{' '}
          <Link to="/auth/register" className="register-link">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;