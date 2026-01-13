/**
 * EventLoginPage - Login page for Mirror Diamond Event
 * Simple social login design
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import NavbarV4 from '@/components/navbar/NavbarV4';
import ShineGlassButton from '@components/common/button/ShineGlassButton';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import { signInWithGoogle, getCurrentUser, onAuthStateChange } from '@services/event/authService';
import { registerGoogleUser, checkExistingGoogleUser } from '@services/event/eventApi';
import useEventStore from '@/store/useEventStore';
import EventSoundButton from '@/components/event/ui/EventSoundButton';

import './EventLoginPage.css';

const EventLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  // Detect if navigated from guide page or name page (desktop only)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const fromGuide = (location.state?.fromGuide || location.state?.fromName) && isDesktop;

  // Update isDesktop on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        navigate(ROUTES.EVENT_NAME, { state: { fromLogin: true } });
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
        navigate(ROUTES.EVENT_NAME, { state: { fromLogin: true } });
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

  const contentVariants = isDesktop
    ? {
        // Desktop: slide in from right
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
      }
    : {
        // Mobile/Tablet: simple fade in
        hidden: {
          opacity: 0,
        },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.6,
            ease: 'easeOut',
          },
        },
      };

  const cardChildrenVariants = isDesktop
    ? {
        // Desktop: stagger with y movement
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
      }
    : {
        // Mobile/Tablet: simple fade in
        hidden: { opacity: 0 },
        visible: (i) => ({
          opacity: 1,
          transition: {
            delay: 0.3 + i * 0.1,
            duration: 0.4,
            ease: 'easeOut',
          },
        }),
      };

  // Background container animation - desktop only
  const backgroundContainerVariants = isDesktop
    ? {
        hidden: fromGuide
          ? {
              width: '100vw',
              left: '0',
            }
          : {
              opacity: 0,
            },
        visible: {
          width: '50%',
          left: '0',
          opacity: 1,
          transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }
    : {
        // Mobile/Tablet: simple fade in, no width animation
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.6 },
        },
      };

  // Background image - desktop only animation
  const backgroundImageVariants = isDesktop
    ? {
        hidden: fromGuide
          ? {
              objectPosition: 'center center',
            }
          : {
              objectPosition: 'right center',
            },
        visible: {
          objectPosition: 'right center',
          transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }
    : {
        // Mobile/Tablet: no animation
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      };

  // Gradient overlay animation - desktop only (hidden on mobile/tablet by CSS)
  const gradientVariants = isDesktop
    ? {
        hidden: fromGuide
          ? {
              left: '200%',
              opacity: 0.3,
            }
          : {
              left: '140%',
              opacity: 0,
            },
        visible: {
          left: '140%',
          opacity: 1,
          transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }
    : {
        // Mobile/Tablet: no animation (hidden by CSS anyway)
        hidden: { opacity: 0 },
        visible: { opacity: 0 },
      };

  return (
    <div className="event-login-wrapper">
      <NavbarV4 logoOnly />
      <div className="event-login" data-navbar-theme="black">
        {/* Gradient overlay - animated */}
        <motion.div
          className="event-login__gradient"
          variants={gradientVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Background - Container stays at 50% left, only image animates */}
        <motion.div
          className="event-login__bg"
          variants={backgroundContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.img
            src={getMediaUrl('mirror_DMM/Artboard-6.webp')}
            alt="Background"
            className="event-login__bg-img"
            variants={backgroundImageVariants}
            initial="hidden"
            animate="visible"
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
              Tham gia trải nghiệm
            </motion.h1>

            <motion.p
              className="event-login__subtitle bodytext-6--no-margin"
              custom={1}
              variants={cardChildrenVariants}
              initial="hidden"
              animate="visible"
            >
              Đăng nhập để tham gia trải nghiệm
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
                theme="light"
                onClick={() => handleSocialLogin('google')}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <img src="/google-icon.svg" alt="Google" width="15" height="15" />
                <span>Tiếp tục với Google</span>
              </ShineGlassButton>

              {/* Facebook */}
              <ShineGlassButton
                theme="light"
                onClick={() => handleSocialLogin('facebook')}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <img src="/facebook-icon.svg" alt="Facebook" width="15" height="15" />
                <span>Tiếp tục với Facebook</span>
              </ShineGlassButton>

              {/* Apple */}
              <ShineGlassButton
                theme="light"
                onClick={() => handleSocialLogin('apple')}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <img src="/apple-icon.svg" alt="Apple" width="15" height="15" />
                <span>Tiếp tục với Apple</span>
              </ShineGlassButton>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <EventSoundButton />
    </div>
  );
};

export default EventLoginPage;
