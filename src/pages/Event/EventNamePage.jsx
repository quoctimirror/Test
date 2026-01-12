/**
 * EventNamePage - Name input page for Mirror Diamond Event
 * User enters their name after login
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import NavbarV4 from '@/components/navbar/NavbarV4';
import ShineGlassButton from '@components/common/button/ShineGlassButton';
import useEventStore from '@/store/useEventStore';

import './EventNamePage.css';

const EventNamePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useEventStore();
  const [name, setName] = useState(user?.displayName || '');
  const inputRef = useRef(null);
  const measureRef = useRef(null);

  // Auto-resize input-wrap based on content, min = placeholder width (responsive)
  useEffect(() => {
    const updateWidth = () => {
      if (measureRef.current && inputRef.current) {
        // Measure placeholder width
        measureRef.current.textContent = 'Your name';
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
    navigate(ROUTES.EVENT_LOGIN);
  };

  const handleCreateNote = () => {
    if (name.trim()) {
      // Save name to store
      setUser({ ...user, displayName: name.trim() });
      navigate(ROUTES.EVENT_CHOOSE_SHAPE);
    }
  };

  return (
    <>
      <NavbarV4 logoOnly />
      <div className="event-name" data-navbar-theme="black">
      {/* Background */}
      <div className="event-name__bg" />

      {/* Main Container - Horizontal layout */}
      <div className="event-name__main">
        {/* Back Button */}
        <ShineGlassButton theme="light" onClick={handleBack} className="event-name__back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ShineGlassButton>

        {/* Main Content */}
        <div className="event-name__content">
          <div className="event-name__greeting">
            <span className="event-name__hi heading-2--no-margin">Hi</span>
            <div className="event-name__input-wrap">
              <span ref={measureRef} className="event-name__input-measure heading-2--no-margin" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                className="event-name__input heading-2--no-margin"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                autoFocus
              />
              <div className="event-name__input-line" />
            </div>
          </div>

          <h2 className="heading-2--no-margin event-name__subtitle">
            May us guide through The sound of love grown
          </h2>
        </div>

        {/* Create Note Button */}
        <div className="event-name__nav">
          <ShineGlassButton theme="light" onClick={handleCreateNote}>
            Create your own note
          </ShineGlassButton>
        </div>
      </div>
    </div>
    </>
  );
};

export default EventNamePage;
