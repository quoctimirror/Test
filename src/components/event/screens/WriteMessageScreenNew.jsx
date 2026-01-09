/**
 * WriteMessageScreenNew - Step 2: Display music staffs with random notes
 * Two music staffs, evenly spaced, with 18 random diamond notes
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TEXT } from '@/constants/eventConstants';
import { ROUTES } from '@/constants/routes';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';

// Import all diamond shapes
import heartSvg from '@/assets/images/dmm/heart.svg';
import ascherPng from '@/assets/images/dmm/ascher.png';
import emeraldPng from '@/assets/images/dmm/emerald.png';
import lumexPng from '@/assets/images/dmm/lumex.png';
import marquisePng from '@/assets/images/dmm/marquise.png';
import ovalPng from '@/assets/images/dmm/oval.png';
import pearPng from '@/assets/images/dmm/pear.png';

// Diamond shape images array
const DIAMOND_SHAPES = [
  heartSvg,
  ascherPng,
  emeraldPng,
  lumexPng,
  marquisePng,
  ovalPng,
  pearPng,
];

// Staff configuration
const LINE_HEIGHT = 6.296;
const LINE_GAP = 35;
const LINES_PER_STAFF = 5;
const STAFF_HEIGHT = LINES_PER_STAFF * LINE_HEIGHT + (LINES_PER_STAFF - 1) * LINE_GAP; // ~171.48px

// 9 Y positions per staff (5 lines + 4 zones between)
const getStaffPositionsY = () => {
  const positions = [];
  for (let i = 0; i < LINES_PER_STAFF; i++) {
    // Line position (center of line)
    const lineY = i * (LINE_HEIGHT + LINE_GAP) + LINE_HEIGHT / 2;
    positions.push(lineY);

    // Zone position (between this line and next)
    if (i < LINES_PER_STAFF - 1) {
      const zoneY = lineY + LINE_HEIGHT / 2 + LINE_GAP / 2;
      positions.push(zoneY);
    }
  }
  return positions;
};

const POSITIONS_Y = getStaffPositionsY();

// Generate notes for a single staff - spread evenly across full width
const generateStaffNotes = (count, staffIndex, maxX = 92) => {
  const notes = [];
  const usedYPositions = new Set();

  // Evenly distribute X positions across full width (5% to maxX%)
  const minX = 5;
  const step = (maxX - minX) / (count - 1);

  for (let i = 0; i < count; i++) {
    // Base X position evenly spread
    const baseX = minX + i * step;
    // Add small random offset (-2% to +2%) for natural look
    const offset = (Math.random() - 0.5) * 4;
    const positionX = Math.max(3, Math.min(maxX + 2, baseX + offset));

    // Random Y position (0-8 for 9 positions) - no duplicates
    let posY;
    do {
      posY = Math.floor(Math.random() * 9);
    } while (usedYPositions.has(posY) && usedYPositions.size < 9);
    usedYPositions.add(posY);

    // Random shape
    const shapeIndex = Math.floor(Math.random() * DIAMOND_SHAPES.length);

    notes.push({
      id: `staff${staffIndex}-note${i}`,
      positionX,
      positionY: posY,
      shape: DIAMOND_SHAPES[shapeIndex],
    });
  }

  return notes;
};

// Generate notes for both staffs
const generateAllNotes = (countPerStaff) => {
  // Staff 1: full width (5% - 92%)
  const staff1Notes = generateStaffNotes(countPerStaff, 1, 92);
  // Staff 2: leave room for user's note at 98%, so max is 90%
  const staff2Notes = generateStaffNotes(countPerStaff, 2, 90);

  return { staff1Notes, staff2Notes };
};

const WriteMessageScreenNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEntering, setIsEntering] = useState(true); // Zoom-in entrance
  const userNoteRef = useRef(null);
  const rippleRef = useRef(null);

  const { userNote } = useEventStore();

  // User's note is always at the last position (rightmost) in the layout
  // X position: 98% (end of staff), Y position: use user's selected position or default
  const userPositionX = 98;
  const userPositionY = userNote?.positionY ?? 4;

  // Generate random notes for both staffs (memoized) - with guaranteed X spacing
  const { staff1Notes, staff2Notes } = useMemo(() => generateAllNotes(9), []);

  // Remove entering class after zoom-in animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Initialize RippleEffect on user's note (after entrance animation)
  useEffect(() => {
    if (isEntering) return; // Wait for entrance animation to complete

    if (userNoteRef.current && !rippleRef.current) {
      rippleRef.current = new RippleEffect(userNoteRef.current, {
        autoRippleCount: 6,
        duration: 6000,
        delay: 1000,
        startSize: 40,
        endSize: 450,
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
  }, [isEntering]);

  // Navigation - go back to step 1
  const handleGoBack = () => {
    navigate(ROUTES.EVENT_PLACE_NOTE);
  };

  // Navigation - go to next step (step 3)
  const handleNext = () => {
    navigate(ROUTES.EVENT_CHOOSE_NOTE);
  };

  // Render a single music staff
  const renderStaff = (notes, staffId, showUserNote = false) => (
    <div className="write-message__staff">
      {/* 5 staff lines */}
      <div className="write-message__lines">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="write-message__line" />
        ))}
      </div>

      {/* Random notes */}
      {notes.map((note) => (
        <div
          key={note.id}
          className="write-message__note"
          style={{
            left: `${note.positionX}%`,
            top: `${POSITIONS_Y[note.positionY]}px`,
          }}
        >
          <img
            src={note.shape}
            alt="Diamond note"
            className="write-message__note-img"
          />
        </div>
      ))}

      {/* User's note with ripple effect - always at last X position, Y from user selection */}
      {showUserNote && (
        <div
          ref={userNoteRef}
          className="write-message__note write-message__note--user"
          style={{
            left: `${userPositionX}%`,
            top: `${POSITIONS_Y[userPositionY]}px`,
          }}
        >
          <img
            src={heartSvg}
            alt="Your note"
            className="write-message__note-img write-message__note-img--user"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={`write-message ${isEntering ? 'write-message--zoom-in' : ''}`}>
      {/* Background */}
      <div className="write-message__bg" />

      {/* Header */}
      <header className="write-message__header">
        <h1 className="write-message__title">MIRROR</h1>
      </header>

      {/* Main content - Two music staffs with arrow buttons */}
      <main className="write-message__main">
        {/* Left arrow - go back to step 1 */}
        <div className="write-message__arrow write-message__arrow--left">
          <button
            className="glass-button glass-button--circle"
            onClick={handleGoBack}
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="write-message__staffs">
          {renderStaff(staff1Notes, 1, false)}
          {renderStaff(staff2Notes, 2, true)}
        </div>

        {/* Right arrow - go to next step */}
        <div className="write-message__arrow write-message__arrow--right">
          <button
            className="glass-button glass-button--circle"
            onClick={handleNext}
            aria-label="Next step"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </main>

      {/* Footer - bottom left */}
      <footer className="write-message__footer">
        {/* Progress bar 2/3 */}
        <div className="write-message__progress">
          <div className="write-message__progress-step write-message__progress-step--active" />
          <div className="write-message__progress-step write-message__progress-step--active" />
          <div className="write-message__progress-step" />
        </div>
        <h3 className="heading-3--no-margin write-message__subtitle">Place your note</h3>
        <p className="bodytext-6--no-margin write-message__description">
          cing elit, sed diam nonummy nibut laoreet dolore
          magna aliquam erat volutpat. cing elit, sed diam
          nonummy nibut nibut laoreet dolore magna aliquam
          erat volutpat.
        </p>
        {error && <p className="write-message__error">{error}</p>}
      </footer>

      {/* Action buttons - bottom center */}
      <div className="write-message__actions">
        <button className="glass-button glass-button--pill">
          Nghe 1 đoạn nốt
        </button>
        <button className="glass-button glass-button--pill">
          Nghe nốt của tôi
        </button>
      </div>

    </div>
  );
};

export default WriteMessageScreenNew;
