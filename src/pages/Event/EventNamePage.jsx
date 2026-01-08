/**
 * EventNamePage - Name input page for Mirror Diamond Event
 * User enters their name after login
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import ShineGlassButton from '@components/common/button/ShineGlassButton';

import './EventNamePage.css';

const EventNamePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const inputRef = useRef(null);
  const measureRef = useRef(null);

  // Auto-resize input based on content
  useEffect(() => {
    if (measureRef.current && inputRef.current) {
      const text = name || 'Your name';
      measureRef.current.textContent = text;
      const width = measureRef.current.offsetWidth;
      inputRef.current.style.width = `${width + 4}px`;
    }
  }, [name]);

  const handleBack = () => {
    navigate(ROUTES.EVENT_LOGIN);
  };

  const handleCreateNote = () => {
    if (name.trim()) {
      navigate(ROUTES.EVENT_PREVIEW);
    }
  };

  return (
    <div className="event-name">
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
            <span className="event-name__hi">Hi</span>
            <div className="event-name__input-wrap">
              <span ref={measureRef} className="event-name__input-measure" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                className="event-name__input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <div className="event-name__input-line" />
            </div>
          </div>

          <h3 className="heading-3--no-margin event-name__subtitle">
            May us guide through The sound of love grown
          </h3>
        </div>

        {/* Create Note Button */}
        <div className="event-name__nav">
          <ShineGlassButton theme="light" onClick={handleCreateNote}>
            Create your own note
          </ShineGlassButton>
        </div>
      </div>
    </div>
  );
};

export default EventNamePage;
