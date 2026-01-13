/**
 * EventNamePage - Name input page for Mirror Diamond Event
 * User enters their name after login
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import NavbarV4 from '@/components/navbar/NavbarV4';
import GlassThemeButton from '@components/common/button/GlassThemeButton';
import useEventStore from '@/store/useEventStore';
import EventSoundButton from '@/components/event/ui/EventSoundButton';

import './EventNamePage.css';

const EventNamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useEventStore();
  const [name, setName] = useState(user?.displayName || '');
  const inputRef = useRef(null);
  const measureRef = useRef(null);

  // Detect if navigated from login page (desktop only)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const fromLogin = location.state?.fromLogin && isDesktop;

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-resize input-wrap based on content, min = placeholder width (responsive)
  useEffect(() => {
    const updateWidth = () => {
      if (measureRef.current && inputRef.current) {
        // Measure placeholder width
        measureRef.current.textContent = 'tên của bạn';
        const placeholderWidth = measureRef.current.offsetWidth;

        // Measure current text width
        if (name) {
          measureRef.current.textContent = name;
        }
        const textWidth = measureRef.current.offsetWidth;

        // Wrapper width = max of placeholder and text
        const wrapperWidth = Math.max(placeholderWidth, textWidth);
        const wrapper = inputRef.current.parentElement;
        if (wrapper) {
          wrapper.style.width = `${wrapperWidth}px`;
        }
      }
    };

    updateWidth();

    // Re-calculate on window resize for responsive
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [name]);

  const handleBack = () => {
    navigate(ROUTES.EVENT_LOGIN, { state: { fromName: true } });
  };

  const handleCreateNote = () => {
    if (name.trim()) {
      // Save name to store
      setUser({ ...user, displayName: name.trim() });
      navigate(ROUTES.EVENT_CHOOSE_SHAPE);
    }
  };

  // Background animation variants - slide from right (login position) to center
  const backgroundVariants = isDesktop
    ? {
        hidden: fromLogin
          ? {
              width: '50%',
              left: '50%',
              right: '0',
            }
          : {
              opacity: 1,
            },
        visible: {
          width: '100%',
          left: '0',
          right: '0',
          opacity: 1,
          transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }
    : {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      };

  return (
    <>
      <NavbarV4 logoOnly />
      <div className="event-name" data-navbar-theme="black">
      {/* Background */}
      <motion.div
        className="event-name__bg"
        variants={backgroundVariants}
        initial="hidden"
        animate="visible"
      />

      {/* Main Container */}
      <div className="event-name__main">
        {/* Main Content */}
        <div className="event-name__content">
          <div className="event-name__greeting">
            <span className="event-name__hi heading-2--no-margin">Dành cho</span>
            <div className="event-name__input-row">
              <div className="event-name__input-wrap">
                <span ref={measureRef} className="event-name__input-measure heading-2--no-margin" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  className="event-name__input heading-2--no-margin"
                  placeholder="tên của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={15}
                  autoFocus
                />
                <div className="event-name__input-line" />
              </div>
              <span className="event-name__comma heading-2--no-margin">,</span>
            </div>
          </div>

          <h2 className="heading-2--no-margin event-name__subtitle">
            nguồn cảm hứng của giai điệu Love-Grown.
          </h2>
        </div>

        {/* Create Note Button */}
        <div className="event-name__nav">
          <GlassThemeButton theme="spec_dark" onClick={handleCreateNote}>
            Sáng tạo “Nốt sáng" của riêng bạn
          </GlassThemeButton>
        </div>
      </div>

      {/* Back Button - Fixed bottom left */}
      <div className="event-name__back">
        <GlassThemeButton theme="light" onClick={handleBack} icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
            <path d="M12.7187 5.70703L0.71875 5.70703M0.71875 5.70703L5.86161 0.707031M0.71875 5.70703L5.86161 10.707" stroke="currentColor" strokeLinecap="square"/>
          </svg>
        } />
      </div>

      <EventSoundButton />
    </div>
    </>
  );
};

export default EventNamePage;
