/**
 * EventLoginPage - Login page for Mirror Diamond Event
 * Simple social login design
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  const handleSocialLogin = (provider) => {
    if (provider === 'google') {
      handleGoogleLogin();
      return;
    }
    // TODO: Implement other social logins
    console.log(`Login with ${provider}`);
  };

  // Animation variants
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      x: 100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const cardChildrenVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="event-login-wrapper">
      <NavbarV4 logoOnly />
      <div className="event-login" data-navbar-theme="black">
        {/* Background - Fade in */}
        <motion.div
          className="event-login__bg"
          variants={backgroundVariants}
          initial="hidden"
          animate="visible"
        >
          <img
            src={getMediaUrl('mirror_DMM/Artboard-6.webp')}
            alt="Background"
            className="event-login__bg-img"
          />
        </motion.div>

        {/* Content - Right side (Desktop) / Glass Card (Mobile) - Slide in from right */}
        <motion.div
          className="event-login__content"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Glass Card for Mobile/Tablet */}
          <div className="event-login__card">
            <motion.h1
              className="event-login__title heading-2--no-margin"
              custom={0}
              variants={cardChildrenVariants}
              initial="hidden"
              animate="visible"
            >
              Đợi trong giây lát,
            </motion.h1>

            <motion.p
              className="event-login__subtitle bodytext-6--no-margin"
              custom={1}
              variants={cardChildrenVariants}
              initial="hidden"
              animate="visible"
            >
              Bắt đầu đăng nhập với
            </motion.p>

            {/* Error Message */}
            {error && <p className="event-login__error">{error}</p>}

            {/* Social Login Buttons - Full width with text */}
            <motion.div
              className="event-login__social"
              custom={2}
              variants={cardChildrenVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Google */}
              <ShineGlassButton
                theme="footer"
                onClick={() => handleSocialLogin('google')}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <g clipPath="url(#clip0_google)">
                    <path d="M14.856 6.10857H7.65977V8.99208H11.7947C11.7283 9.40017 11.579 9.80162 11.3604 10.1677C11.11 10.5871 10.8004 10.9064 10.4831 11.1495C9.53256 11.8779 8.42437 12.0268 7.65474 12.0268C5.71057 12.0268 4.0494 10.7703 3.40632 9.06286C3.38037 9.0009 3.36314 8.93689 3.34215 8.87363C3.20005 8.43907 3.1224 7.97883 3.1224 7.50048C3.1224 7.00264 3.20648 6.52609 3.35979 6.076C3.9645 4.30088 5.66312 2.97504 7.65614 2.97504C8.05701 2.97504 8.44305 3.02276 8.80914 3.11793C9.64578 3.33544 10.2376 3.76383 10.6002 4.10268L12.7883 1.95985C11.4573 0.739479 9.72221 1.84511e-09 7.6525 1.84511e-09C5.99791 -3.5612e-05 4.47031 0.515488 3.2185 1.38674C2.20332 2.0933 1.37073 3.0393 0.808828 4.13797C0.286182 5.15666 0 6.28556 0 7.49935C0 8.71319 0.286619 9.85383 0.809267 10.8631V10.8699C1.36131 11.9414 2.16859 12.8639 3.14975 13.5673C4.0069 14.1817 5.54385 15 7.6525 15C8.86513 15 9.93986 14.7814 10.8877 14.3716C11.5714 14.0761 12.1772 13.6906 12.7257 13.1951C13.4504 12.5405 14.018 11.7307 14.4054 10.7991C14.7928 9.8674 15 8.81387 15 7.67167C15 7.13972 14.9466 6.5995 14.856 6.10852V6.10857Z" fill="currentColor"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_google">
                      <rect width="15" height="15" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span>Đăng nhập bằng Google</span>
              </ShineGlassButton>

              {/* Facebook */}
              <ShineGlassButton
                theme="footer"
                onClick={() => handleSocialLogin('facebook')}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <g clipPath="url(#clip0_facebook)">
                    <path d="M7.5 0C3.3579 0 0 3.3579 0 7.5C0 11.0172 2.4216 13.9686 5.6883 14.7792V9.792H4.1418V7.5H5.6883V6.5124C5.6883 3.9597 6.8436 2.7765 9.3498 2.7765C9.825 2.7765 10.6449 2.8698 10.9803 2.9628V5.0403C10.8033 5.0217 10.4958 5.0124 10.1139 5.0124C8.8842 5.0124 8.409 5.4783 8.409 6.6894V7.5H10.8588L10.4379 9.792H8.409V14.9451C12.1227 14.4966 15.0003 11.3346 15.0003 7.5C15 3.3579 11.6421 0 7.5 0Z" fill="currentColor"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_facebook">
                      <rect width="15" height="15" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span>Đăng nhập bằng Facebook</span>
              </ShineGlassButton>

              {/* Apple */}
              <ShineGlassButton
                theme="footer"
                onClick={() => handleSocialLogin('apple')}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <g clipPath="url(#clip0_apple)">
                    <path d="M13.62 11.6897C13.3931 12.2138 13.1246 12.6962 12.8135 13.1397C12.3895 13.7443 12.0422 14.1628 11.7747 14.3952C11.3599 14.7767 10.9154 14.972 10.4395 14.9832C10.0979 14.9832 9.68584 14.8859 9.20623 14.6887C8.72504 14.4924 8.28283 14.3952 7.87849 14.3952C7.45443 14.3952 6.99963 14.4924 6.51317 14.6887C6.02596 14.8859 5.63347 14.9887 5.33339 14.9989C4.87701 15.0183 4.42212 14.8174 3.96806 14.3952C3.67826 14.1424 3.31577 13.7091 2.88152 13.0953C2.41561 12.4397 2.03257 11.6796 1.73248 10.8129C1.41111 9.87683 1.25 8.97038 1.25 8.09281C1.25 7.08756 1.46722 6.22055 1.90229 5.494C2.24423 4.91041 2.69912 4.45005 3.26845 4.1121C3.83779 3.77415 4.45295 3.60193 5.11543 3.59091C5.47792 3.59091 5.95328 3.70304 6.544 3.9234C7.13305 4.14451 7.51128 4.25663 7.67711 4.25663C7.80109 4.25663 8.22126 4.12552 8.93355 3.86414C9.60714 3.62174 10.1756 3.52138 10.6414 3.56091C11.9034 3.66276 12.8515 4.16024 13.482 5.05651C12.3533 5.74038 11.795 6.69822 11.8061 7.92698C11.8163 8.88408 12.1635 9.68054 12.8459 10.3129C13.1552 10.6064 13.5005 10.8333 13.8848 10.9944C13.8015 11.2361 13.7135 11.4675 13.62 11.6897ZM10.7256 0.300269C10.7256 1.05044 10.4516 1.75087 9.90528 2.39919C9.24604 3.1699 8.44866 3.61526 7.58396 3.54499C7.57295 3.45499 7.56656 3.36027 7.56656 3.26074C7.56656 2.54057 7.88006 1.76985 8.43681 1.13969C8.71476 0.820623 9.06827 0.555326 9.49696 0.343693C9.92472 0.135218 10.3293 0.0199262 10.7099 0.000183105C10.721 0.100469 10.7256 0.200762 10.7256 0.300259V0.300269Z" fill="currentColor"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_apple">
                      <rect width="15" height="15" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span>Đăng nhập bằng Apple</span>
              </ShineGlassButton>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventLoginPage;
