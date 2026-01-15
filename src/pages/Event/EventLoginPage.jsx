/**
 * EventLoginPage - Login page for Mirror Diamond Event
 *
 * SỬ DỤNG SUPABASE OAUTH REDIRECT FLOW (không dùng popup)
 * - Hoạt động trong in-app browser (Zalo, Messenger, Instagram, TikTok)
 * - Flow: Click login → Redirect đến Google → Google redirect về app
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import NavbarV4 from '@/components/navbar/NavbarV4';
import ShineGlassButton from '@components/common/button/ShineGlassButton';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
// ============================================================
// THAY ĐỔI 1: Import từ authService (Supabase OAuth) thay vì googleAuthService (popup)
// - signInWithGoogle: dùng Supabase OAuth redirect flow (không popup)
// - onAuthStateChange: lắng nghe khi user đăng nhập thành công và redirect về
// - signOut: đăng xuất khỏi Supabase
// ============================================================
import { signInWithGoogle, onAuthStateChange, signOut } from '@services/event/authService';
import { registerGoogleUser, checkExistingGoogleUser } from '@services/event/eventApi';
import useEventStore from '@/store/useEventStore';

import './EventLoginPage.css';

// LocalStorage key for session
const SESSION_KEY = 'mirror_event_user';

// Get saved user from localStorage
const getSavedUser = () => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// Save user to localStorage
const saveUserSession = (user) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
};

// ============================================================
// THAY ĐỔI 2: Sửa clearUserSession dùng signOut từ Supabase
// - Xóa session trong localStorage
// - Gọi signOut() từ Supabase để xóa session trên server
// ============================================================
export const clearUserSession = async () => {
  try {
    localStorage.removeItem(SESSION_KEY);
    await signOut(); // Supabase signOut thay vì signOutGoogle
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
};

const EventLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  // ============================================================
  // THAY ĐỔI 3: Xóa googleInitialized và googleButtonRef
  // - Không cần nữa vì dùng Supabase OAuth (không cần init Google SDK)
  // ============================================================

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

  // Handle user login (register in database) - works for Google
  const handleUserLogin = useCallback(async (oauthUser) => {
    setLoading(true);
    setError('');

    try {
      // First check if user already exists (pass provider to check correct column)
      const existingCheck = await checkExistingGoogleUser(oauthUser.id, oauthUser.provider);

      if (existingCheck.exists) {
        // Add provider info to user
        const userWithProvider = { ...existingCheck.user, provider: oauthUser.provider };
        setUser(userWithProvider);
        saveUserSession(userWithProvider);

        // Check if user already has a note
        if (existingCheck.hasNote && existingCheck.note) {
          // Restore note data to store
          setSelectedDiamond(existingCheck.note.diamondShape);
          setUserNote({
            ...existingCheck.note,
            orderId: existingCheck.user.lightNumber,
            userDisplayName: existingCheck.user.displayName,
          });
          // Skip to YOUR-NOTE page
          navigate(ROUTES.EVENT_PLACE_NOTE);
          return;
        }

        // Check if user has already confirmed their name
        if (existingCheck.nameConfirmed) {
          // Skip name page, go directly to choose shape
          navigate(ROUTES.EVENT_CHOOSE_SHAPE);
        } else {
          // User hasn't confirmed name yet, go to name page
          navigate(ROUTES.EVENT_NAME, { state: { fromLogin: true } });
        }
        return;
      }

      // New user - register
      const result = await registerGoogleUser({
        authId: oauthUser.id,
        googleId: oauthUser.id, // Legacy support
        email: oauthUser.email,
        displayName: oauthUser.displayName,
        provider: oauthUser.provider,
      });

      if (result.success) {
        if (result.isDemo) {
          setIsDemo(true);
        }
        setUser(result.user);
        saveUserSession(result.user);
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
  }, [navigate, setUser, setIsDemo, setUserNote, setSelectedDiamond]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkExistingUser = async () => {
      const savedUser = getSavedUser();
      if (savedUser) {
        // User already logged in, restore session
        setUser(savedUser);

        // Check current status from database
        const existingCheck = await checkExistingGoogleUser(
          savedUser.googleId || savedUser.authId || savedUser.id,
          savedUser.provider || 'google'
        );

        if (existingCheck.exists) {
          if (existingCheck.hasNote && existingCheck.note) {
            setSelectedDiamond(existingCheck.note.diamondShape);
            setUserNote({
              ...existingCheck.note,
              orderId: existingCheck.user.lightNumber,
              userDisplayName: existingCheck.user.displayName,
            });
            navigate(ROUTES.EVENT_PLACE_NOTE);
          } else if (existingCheck.nameConfirmed) {
            navigate(ROUTES.EVENT_CHOOSE_SHAPE);
          } else {
            navigate(ROUTES.EVENT_NAME, { state: { fromLogin: true } });
          }
        }
      }
      setChecking(false);
    };

    checkExistingUser();
  }, [navigate, setUser, setUserNote, setSelectedDiamond]);

  // ============================================================
  // THAY ĐỔI 4: Lắng nghe OAuth callback từ Supabase
  // - Khi user đăng nhập Google xong, Google redirect về app
  // - Supabase tự động xử lý token và trigger onAuthStateChange
  // - Callback này sẽ được gọi với thông tin user
  // ============================================================
  useEffect(() => {
    if (checking) return; // Đợi kiểm tra session xong

    // Subscribe để lắng nghe khi user đăng nhập thành công
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // User vừa đăng nhập thành công từ Google
        // Chuyển đổi format user từ Supabase sang format của app
        const userData = {
          id: user.id,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          avatarUrl: user.avatarUrl,
          provider: user.provider || 'google',
        };
        handleUserLogin(userData);
      }
    });

    // Cleanup: hủy subscription khi component unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [checking, handleUserLogin]);

  // ============================================================
  // THAY ĐỔI 5: Sửa handleGoogleLogin dùng Supabase OAuth redirect
  // - KHÔNG mở popup nữa
  // - Redirect TRỰC TIẾP đến Google trên cùng tab
  // - Hoạt động trong in-app browser (Zalo, Messenger, Instagram, TikTok)
  // ============================================================
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // signInWithGoogle() từ authService sẽ redirect đến Google
      // Không dùng popup, redirect trực tiếp trên cùng tab
      const result = await signInWithGoogle();

      if (result?.error) {
        setError(result.error.message || 'Đăng nhập thất bại');
        setLoading(false);
      }
      // Nếu thành công, trang sẽ redirect đến Google
      // Sau khi đăng nhập, Google redirect về app
      // onAuthStateChange callback sẽ xử lý tiếp
    } catch (err) {
      console.error('Google login error:', err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      setLoading(false);
    }
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
              {/* ============================================================
                THAY ĐỔI 6: Xóa hidden div cho Google button
                - Không cần nữa vì dùng Supabase OAuth (không cần Google SDK)
                ============================================================ */}
              <ShineGlassButton
                theme="light"
                onClick={handleGoogleLogin}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <img src="/google-icon.svg" alt="Google" width="15" height="15" />
                <span>{loading ? 'Đang đăng nhập...' : 'Tiếp tục với Google'}</span>
              </ShineGlassButton>

              {/* Facebook - TODO: Enable when ready */}
              {/* <ShineGlassButton
                theme="light"
                onClick={() => handleSocialLogin('facebook')}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <img src="/facebook-icon.svg" alt="Facebook" width="15" height="15" />
                <span>Tiếp tục với Facebook</span>
              </ShineGlassButton> */}

              {/* Apple - TODO: Enable when ready */}
              {/* <ShineGlassButton
                theme="light"
                onClick={() => handleSocialLogin('apple')}
                className="event-login__social-btn"
                disabled={loading || checking}
              >
                <img src="/apple-icon.svg" alt="Apple" width="15" height="15" />
                <span>Tiếp tục với Apple</span>
              </ShineGlassButton> */}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventLoginPage;
