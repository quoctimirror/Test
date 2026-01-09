/**
 * EventLoginPage - Login page for Mirror Diamond Event
 * Simple social login design
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import NavbarV4 from '@/components/navbar/NavbarV4';
import ShineGlassButton from '@components/common/button/ShineGlassButton';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import { signInWithGoogle, getCurrentUser, onAuthStateChange } from '@services/event/authService';
import { registerGoogleUser, checkExistingGoogleUser } from '@services/event/eventApi';
import useEventStore from '@/store/useEventStore';

import './EventLoginPage.css';

const EventLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  const {
    setUser,
    setIsDemo,
    setUserNote,
    setSelectedDiamond,
  } = useEventStore();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkExistingUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        await handleUserLogin(user);
      }
      setChecking(false);
    };

    checkExistingUser();

    // Subscribe to auth changes (for OAuth redirect callback)
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        await handleUserLogin(user);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle user login (register in database)
  const handleUserLogin = async (googleUser) => {
    setLoading(true);
    setError('');

    try {
      // First check if user already exists
      const existingCheck = await checkExistingGoogleUser(googleUser.id);

      // TODO: Re-enable this check after UI is done
      // if (existingCheck.exists && existingCheck.hasNote) {
      //   // User already has a note - restore state and go to result
      //   setUser(existingCheck.user);
      //   setSelectedDiamond(existingCheck.note.diamondShape);
      //   setUserNote({
      //     ...existingCheck.note,
      //     orderId: existingCheck.user.lightNumber,
      //     userDisplayName: existingCheck.user.displayName,
      //   });
      //   navigate(ROUTES.EVENT_RESULT);
      //   return;
      // }

      if (existingCheck.exists) {
        // User exists - go to name page
        setUser(existingCheck.user);
        navigate(ROUTES.EVENT_NAME);
        return;
      }

      // New user - register
      const result = await registerGoogleUser({
        googleId: googleUser.id,
        email: googleUser.email,
        displayName: googleUser.displayName,
      });

      if (result.success) {
        if (result.isDemo) {
          setIsDemo(true);
        }
        setUser(result.user);
        navigate(ROUTES.EVENT_NAME);
      } else {
        setError(result.error || 'Không thể đăng ký. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error || 'Đăng nhập thất bại');
      setLoading(false);
    }
    // If success, the page will redirect to Google OAuth
    // After redirect back, onAuthStateChange will handle the login
  };

  const handleBack = () => {
    navigate(ROUTES.EVENT_GUIDE);
  };

  const handleNext = () => {
    navigate(ROUTES.EVENT_NAME);
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'google') {
      handleGoogleLogin();
      return;
    }
    // TODO: Implement other social logins
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="event-login-wrapper">
      <NavbarV4 logoOnly />
      <div className="event-login" data-navbar-theme="black">
        {/* Background */}
        <div className="event-login__bg">
          <img
            src={getMediaUrl('mirror_DMM/Artboard-6.webp')}
            alt="Background"
            className="event-login__bg-img"
          />
        </div>

        {/* Navigation Buttons */}
        <ShineGlassButton theme="light" onClick={handleBack} className="event-login__nav-btn event-login__nav-btn--left">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ShineGlassButton>

        <ShineGlassButton theme="light" onClick={handleNext} className="event-login__nav-btn event-login__nav-btn--right">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ShineGlassButton>

        {/* Content - Right side */}
        <div className="event-login__content">
          <h1 className="event-login__title heading-2--no-margin">Just a moment.</h1>

          <div className="event-login__divider">
            <span className="event-login__divider-line"></span>
            <span className="event-login__divider-text bodytext-6--no-margin">Let's sign up with</span>
            <span className="event-login__divider-line"></span>
          </div>

          {/* Error Message */}
          {error && <p className="event-login__error">{error}</p>}

          {/* Social Login Buttons */}
          <div className="event-login__social">
            {/* Google */}
            <ShineGlassButton
              theme="light"
              onClick={() => handleSocialLogin('google')}
              className="event-login__social-btn"
              disabled={loading || checking}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.8081 8.14476H10.213V11.9894H15.7263C15.6377 12.5335 15.4387 13.0689 15.1473 13.5569C14.8134 14.1161 14.4005 14.5419 13.9775 14.866C12.7101 15.8373 11.2325 16.0358 10.2063 16.0358C7.61409 16.0358 5.3992 14.3604 4.54176 12.0838C4.50716 12.0012 4.48419 11.9159 4.45621 11.8315C4.26673 11.2521 4.1632 10.6384 4.1632 10.0006C4.1632 9.33685 4.27531 8.70145 4.47971 8.10134C5.28601 5.73451 7.55083 3.96671 10.2082 3.96671C10.7427 3.96671 11.2574 4.03034 11.7455 4.15724C12.861 4.44725 13.6501 5.01844 14.1337 5.47024L17.0511 2.6131C15.2764 0.985972 12.963 0 10.2033 0C7.99722 -4.74828e-05 5.96041 0.687318 4.29134 1.84899C2.93776 2.79108 1.82764 4.0524 1.0784 5.51731C0.381576 6.87555 0 8.38075 0 9.99914C0 11.6176 0.382159 13.1384 1.079 14.4841V14.4932C1.81509 15.9219 2.89145 17.1519 4.19967 18.0896C5.34253 18.9089 7.3918 20 10.2033 20C11.8202 20 13.2531 19.7085 14.5169 19.1622C15.4285 18.7682 16.2362 18.2541 16.9677 17.5935C17.9339 16.7206 18.6906 15.6409 19.2072 14.3987C19.7237 13.1565 20 11.7518 20 10.2289C20 9.51964 19.9288 8.79934 19.8081 8.14469V8.14476Z" fill="currentColor"/>
              </svg>
            </ShineGlassButton>

            {/* Facebook */}
            <ShineGlassButton
              theme="light"
              onClick={() => handleSocialLogin('facebook')}
              className="event-login__social-btn"
              disabled={loading || checking}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 14.9912 3.65684 19.1283 8.4375 19.8785V12.8906H5.89844V10H8.4375V7.79688C8.4375 5.29063 9.93047 3.90625 12.2146 3.90625C13.3084 3.90625 14.4531 4.10156 14.4531 4.10156V6.5625H13.1922C11.95 6.5625 11.5625 7.3334 11.5625 8.125V10H14.3359L13.8926 12.8906H11.5625V19.8785C16.3432 19.1283 20 14.9912 20 10Z" fill="currentColor"/>
              </svg>
            </ShineGlassButton>

            {/* Apple */}
            <ShineGlassButton
              theme="light"
              onClick={() => handleSocialLogin('apple')}
              className="event-login__social-btn"
              disabled={loading || checking}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.2863 0C14.3813 1.05 13.9363 2.1 13.2713 2.87C12.6063 3.64 11.6313 4.26 10.5913 4.17C10.4813 3.14 11.0263 2.06 11.6363 1.37C12.3013 0.62 13.3563 0.05 14.2863 0ZM16.8213 14.89C17.4013 13.97 17.6213 13.51 18.0613 12.48C14.5013 11.16 13.9663 6.13 17.4913 4.35C16.4663 3.1 15.0313 2.37 13.6763 2.37C12.6263 2.37 11.8563 2.67 11.1713 2.94C10.5863 3.17 10.0613 3.38 9.4263 3.38C8.7413 3.38 8.1463 3.16 7.5063 2.92C6.7913 2.65 6.0213 2.36 5.0813 2.38C3.5263 2.41 2.0713 3.24 1.0963 4.64C-0.258703 6.62 -0.038703 10.33 2.1163 13.64C2.9013 14.85 3.9463 16.22 5.3163 16.23C5.9463 16.24 6.3663 16.04 6.8613 15.81C7.4313 15.54 8.0913 15.23 9.1213 15.22C10.1613 15.21 10.8013 15.52 11.3563 15.79C11.8363 16.02 12.2413 16.23 12.8613 16.22C14.2413 16.2 15.3413 14.69 16.1263 13.48C16.4213 13.02 16.6513 12.62 16.8213 12.3V14.89Z" fill="currentColor"/>
              </svg>
            </ShineGlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventLoginPage;
