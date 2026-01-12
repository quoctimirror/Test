/**
 * PlaceNoteScreenNew - New design for placing note on music staff
 * Pink gradient background with circular rings
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TEXT } from '@/constants/eventConstants';
import { ROUTES } from '@/constants/routes';
import { placeNote, fetchAllNotes } from '@services/event/eventApi';
import { initAudio, playNote, isAudioInitialized } from '@services/event/audio';
import { broadcastNoteAdded } from '@services/event/ably';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';
import staffLineSvg from '@/assets/images/dmm/Rectangle 4200.svg';
import heartSvg from '@/assets/images/dmm/heart.svg';

// Position range for the diamond (percentage)
const MIN_POSITION = 10;
const MAX_POSITION = 90;

// All possible Y positions for the note (9 positions total)
// Lines: 0, 2, 4, 6, 8 (odd index = on line)
// Zones: 1, 3, 5, 7 (even index = between lines)
const NOTE_POSITIONS_Y = [
  6,    // Line 0 (top line)
  52,   // Zone 0 (between line 0 and 1)
  98,   // Line 1
  144,  // Zone 1 (between line 1 and 2)
  190,  // Line 2 (middle line)
  236,  // Zone 2 (between line 2 and 3)
  282,  // Line 3
  328,  // Zone 3 (between line 3 and 4)
  374,  // Line 4 (bottom line)
];

const PlaceNoteScreenNew = () => {
  const navigate = useNavigate();
  const [positionX, setPositionX] = useState(50); // Center by default
  const [positionY, setPositionY] = useState(4); // Middle line (index 4 in NOTE_POSITIONS_Y)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const heartRef = useRef(null);
  const staffRef = useRef(null);
  const rippleRef = useRef(null);
  const lastClickTime = useRef(0);
  const CLICK_DEBOUNCE = 500; // Minimum time between clicks (ms)

  const { user, selectedDiamond, setAllNotes, setCurrentStep, setUserNote, addNote } =
    useEventStore();

  // Handle next button - navigate to write message screen
  const handleNext = () => {
    // Save current position to store
    setUserNote({
      positionX,
      positionY,
    });
    navigate(ROUTES.EVENT_WRITE_MESSAGE);
  };

  // Fetch existing notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      const notes = await fetchAllNotes();
      setAllNotes(notes);
    };
    loadNotes();
  }, [setAllNotes]);

  // Initialize RippleEffect on heart (using original settings)
  useEffect(() => {
    if (heartRef.current && !rippleRef.current) {
      rippleRef.current = new RippleEffect(heartRef.current, {
        autoRippleCount: 6,
        duration: 6000,
        delay: 1000,
        startSize: 80,
        endSize: 950,
        opacity: 0.65,
        autoPlay: true,
        clickable: false,
        clickRippleCount: 5,
      });
    }

    return () => {
      if (rippleRef.current) {
        rippleRef.current.destroy();
        rippleRef.current = null;
      }
    };
  }, []);

  // Play note sound when position changes
  const playCurrentNote = async () => {
    if (!isAudioInitialized()) {
      await initAudio();
    }
    playNote('C4');
  };

  // Create ripple effect at heart position using RippleEffect
  const createRipple = useCallback(() => {
    if (rippleRef.current) {
      rippleRef.current.createCenterRipple();
    }
  }, []);

  // Handle click on staff to position heart - on lines OR zones
  const handleStaffClick = useCallback((e) => {
    if (!staffRef.current) return;

    // Debounce - prevent spam clicking
    const now = Date.now();
    if (now - lastClickTime.current < CLICK_DEBOUNCE) {
      return;
    }
    lastClickTime.current = now;

    const rect = staffRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Find the closest Y position (line or zone)
    let closestIndex = 0;
    let minDistance = Infinity;
    NOTE_POSITIONS_Y.forEach((posY, index) => {
      const distance = Math.abs(clickY - posY);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Calculate X position as percentage
    const newX = Math.max(MIN_POSITION, Math.min(MAX_POSITION, (clickX / rect.width) * 100));
    setPositionX(newX);
    setPositionY(closestIndex);

    // Create ripple effect and play sound
    setTimeout(createRipple, 50);
    playCurrentNote();
  }, [createRipple]);

  // Navigation - go back
  const handleGoBack = () => {
    navigate(-1); // Go to previous page
  };

  const handleConfirm = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    const noteData = {
      userId: user.id,
      userDisplayName: user.displayName,
      diamondShape: selectedDiamond || 'heart',
      pitch: 'C4',
      positionX: positionX,
      positionY: positionY,
    };

    const result = await placeNote(noteData);

    if (result.success) {
      addNote(result.note);
      broadcastNoteAdded(result.note);
      setUserNote(result.note);
      setCurrentStep('result');
    } else {
      setError(result.error || TEXT.error);
    }

    setLoading(false);
  };

  return (
    <div className="place-note-new">
      {/* Background with radial rings */}
      <div className="place-note-new__bg">
        <div className="place-note-new__rings" />
      </div>

      {/* Header */}
      <header className="place-note-new__header">
        <h1 className="place-note-new__title">MIRROR</h1>
      </header>

      {/* Main content - Music Staff (vertically centered) */}
      <main className="place-note-new__main">
        <div className="place-note-new__staff-container">
          {/* Left arrow - go back */}
          <div className="place-note-new__arrow place-note-new__arrow--left">
            <button
              className="glass-button glass-button--circle"
              onClick={handleGoBack}
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
          </div>

          {/* Music Staff with 5 SVG lines */}
          <div
            className="place-note-new__staff"
            ref={staffRef}
            onClick={handleStaffClick}
          >
            {/* Red highlights on lines - where notes can be placed */}
            <div className="place-note-new__line-highlights">
              {[0, 1, 2, 3, 4].map((lineIndex) => {
                // positionY: 0,2,4,6,8 = on lines; 1,3,5,7 = in zones
                // lineIndex 0 = positionY 0, lineIndex 1 = positionY 2, etc.
                const isOnThisLine = positionY % 2 === 0 && positionY / 2 === lineIndex;
                return (
                  <div
                    key={lineIndex}
                    className={`place-note-new__line-highlight ${isOnThisLine ? 'place-note-new__line-highlight--active' : ''}`}
                  />
                );
              })}
            </div>

            {/* Green zones - spaces between lines */}
            <div className="place-note-new__zones">
              {[0, 1, 2, 3].map((zoneIndex) => {
                // positionY: 1,3,5,7 = in zones
                // zoneIndex 0 = positionY 1, zoneIndex 1 = positionY 3, etc.
                const isInThisZone = positionY % 2 === 1 && (positionY - 1) / 2 === zoneIndex;
                return (
                  <div
                    key={zoneIndex}
                    className={`place-note-new__zone ${isInThisZone ? 'place-note-new__zone--active' : ''}`}
                  />
                );
              })}
            </div>

            {/* 5 staff lines */}
            <div className="place-note-new__lines-wrapper">
              {[0, 1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={staffLineSvg}
                  alt=""
                  className="place-note-new__line"
                />
              ))}
            </div>

            {/* Heart note on staff */}
            <div
              ref={heartRef}
              className="place-note-new__diamond"
              style={{
                left: `${positionX}%`,
                top: `${NOTE_POSITIONS_Y[positionY]}px`,
              }}
            >
              <img
                src={heartSvg}
                alt="Heart note"
                className="place-note-new__heart"
              />
            </div>
          </div>

          {/* Right arrow - go to next step */}
          <div className="place-note-new__arrow place-note-new__arrow--right">
            <button
              className="glass-button glass-button--circle"
              onClick={handleNext}
              aria-label="Next step"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer - bottom left */}
      <footer className="place-note-new__footer">
        {/* Progress bar 1/3 */}
        <div className="place-note-new__progress">
          <div className="place-note-new__progress-step place-note-new__progress-step--active" />
          <div className="place-note-new__progress-step" />
          <div className="place-note-new__progress-step" />
        </div>
        <h3 className="heading-3--no-margin place-note-new__subtitle">Place your note</h3>
        <p className="bodytext-6--no-margin place-note-new__description">
          cing elit, sed diam nonummy nibut laoreet dolore
          magna aliquam erat volutpat. cing elit, sed diam
          nonummy nibut nibut laoreet dolore magna aliquam
          erat volutpat.
        </p>
        {error && <p className="place-note-new__error">{error}</p>}
      </footer>
    </div>
  );
};

export default PlaceNoteScreenNew;
