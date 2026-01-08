/**
 * EventLoginPage - Login page for Mirror Diamond Event
 * Design based on provided mockup
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import ShineGlassButton from '@components/common/button/ShineGlassButton';

import './EventLoginPage.css';

const EventLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    // TODO: Implement actual sign in logic
    navigate(ROUTES.EVENT_NAME);
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    console.log('Forgot password');
  };

  const handleSignUp = () => {
    // TODO: Navigate to sign up
    console.log('Sign up');
  };

  return (
    <div className="event-login">
      {/* Background */}
      <div className="event-login__bg"></div>

      {/* Login Card */}
      <div className="event-login__card">
        <h1 className="event-login__title">Welcome back!</h1>

        <form className="event-login__form" onSubmit={handleSignIn}>
          {/* Email Field */}
          <div className="event-login__field">
            <label className="event-login__label">Email</label>
            <input
              type="email"
              className="event-login__input"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="event-login__field">
            <div className="event-login__field-header">
              <label className="event-login__label">Password</label>
              <button
                type="button"
                className="event-login__forgot"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              className="event-login__input"
              placeholder="Fill your password here"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Sign In Button */}
          <div className="event-login__submit">
            <ShineGlassButton theme="light" type="submit">
              Sign in
            </ShineGlassButton>
          </div>
        </form>

        {/* Social Login */}
        <div className="event-login__social">
          <span className="event-login__social-text">Or continue with</span>
          <button
            type="button"
            className="event-login__social-btn"
            onClick={() => handleSocialLogin('google')}
            aria-label="Login with Google"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="event-login__signup">
          <span>Not a member?</span>
          <button type="button" onClick={handleSignUp}>
            Sign up now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventLoginPage;
