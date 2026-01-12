/**
 * Layout2 - Music staffs with random notes and zoom animation
 * Desktop: Two music staffs with 18 random diamond notes (9 per staff)
 * Mobile: Three music staffs with 18 random diamond notes (6 per staff)
 * (Renamed from WriteMessageScreenNew - QuocTi's version with animations)
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TEXT } from '@/constants/eventConstants';
import { ROUTES } from '@/constants/routes';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';

// Breakpoint for tablet/mobile
const TABLET_BREAKPOINT = 1024;

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

// Staff configuration - Desktop
const LINE_HEIGHT_DESKTOP = 6.296;
const LINE_GAP_DESKTOP = 35;
const LINES_PER_STAFF = 5;

// Staff configuration - Mobile (staff height 140px)
const LINE_HEIGHT_MOBILE = 6.296;
const LINE_GAP_MOBILE = 27; // (140 - 5*6.296) / 4 ≈ 27

// 9 Y positions per staff (5 lines + 4 zones between)
const getStaffPositionsY = (lineHeight, lineGap) => {
  const positions = [];
  for (let i = 0; i < LINES_PER_STAFF; i++) {
    // Line position (center of line)
    const lineY = i * (lineHeight + lineGap) + lineHeight / 2;
    positions.push(lineY);

    // Zone position (between this line and next)
    if (i < LINES_PER_STAFF - 1) {
      const zoneY = lineY + lineHeight / 2 + lineGap / 2;
      positions.push(zoneY);
    }
  }
  return positions;
};

const POSITIONS_Y_DESKTOP = getStaffPositionsY(LINE_HEIGHT_DESKTOP, LINE_GAP_DESKTOP);
const POSITIONS_Y_MOBILE = getStaffPositionsY(LINE_HEIGHT_MOBILE, LINE_GAP_MOBILE);

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

// Generate notes for desktop (17 random + 1 user = 18 total)
const generateDesktopNotes = () => {
  // Staff 1: 9 notes, full width (5% - 92%)
  const staff1Notes = generateStaffNotes(9, 1, 92);
  // Staff 2: 8 notes + 1 user note = 9, leave room for user's note at 98%
  const staff2Notes = generateStaffNotes(8, 2, 90);

  return { staff1Notes, staff2Notes, staff3Notes: [] };
};

// Generate notes for mobile (17 random + 1 user = 18 total) - 3 staffs
const generateMobileNotes = () => {
  // Staff 1: 6 notes, full width (5% - 92%)
  const staff1Notes = generateStaffNotes(6, 1, 92);
  // Staff 2: 6 notes, full width (5% - 92%)
  const staff2Notes = generateStaffNotes(6, 2, 92);
  // Staff 3: 5 notes + 1 user note = 6, leave room for user's note
  const staff3Notes = generateStaffNotes(5, 3, 90);

  return { staff1Notes, staff2Notes, staff3Notes };
};

const Layout2 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEntering, setIsEntering] = useState(true); // Zoom-in entrance
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(() => window.innerWidth <= TABLET_BREAKPOINT);
  const containerRef = useRef(null); // Main container for setting transform-origin
  const userNoteRef = useRef(null);
  const rippleRef = useRef(null);

  const { userNote } = useEventStore();

  // User's note is always at the last position (rightmost) in the layout
  // X position: 98% (end of staff), Y position: use user's selected position or default
  const userPositionX = 98;
  const userPositionY = userNote?.positionY ?? 4;

  // Generate random notes based on screen size (memoized)
  // Desktop: 2 staffs × 9 notes = 18
  // Mobile: 3 staffs × 6 notes = 18
  const { staff1Notes, staff2Notes, staff3Notes } = useMemo(() => {
    return isTabletOrMobile ? generateMobileNotes() : generateDesktopNotes();
  }, [isTabletOrMobile]);

  // Listen for window resize to update isTabletOrMobile
  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrMobile(window.innerWidth <= TABLET_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate user's note position and set transform-origin for zoom effect
  useEffect(() => {
    if (!containerRef.current) return;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      // Find user's note element and get its position
      if (userNoteRef.current) {
        const noteRect = userNoteRef.current.getBoundingClientRect();

        // Calculate center of the note relative to the container
        const noteCenterX = noteRect.left + noteRect.width / 2 - containerRect.left;
        const noteCenterY = noteRect.top + noteRect.height / 2 - containerRect.top;

        // Convert to percentage
        const originX = (noteCenterX / containerRect.width) * 100;
        const originY = (noteCenterY / containerRect.height) * 100;

        // Set CSS custom properties for transform-origin
        container.style.setProperty('--zoom-origin-x', `${originX}%`);
        container.style.setProperty('--zoom-origin-y', `${originY}%`);
      }
    });
  }, [isTabletOrMobile]);

  // Remove entering class after zoom-in animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 1200); // Match the mapZoomOut animation duration (1.2s)
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

  // Get current Y positions based on screen size
  const POSITIONS_Y = isTabletOrMobile ? POSITIONS_Y_MOBILE : POSITIONS_Y_DESKTOP;

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
    <div
      ref={containerRef}
      className={`write-message ${isEntering ? 'write-message--zoom-in' : ''}`}
    >
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

        <div className={`write-message__staffs ${isTabletOrMobile ? 'write-message__staffs--mobile' : ''}`}>
          {renderStaff(staff1Notes, 1, false)}
          {renderStaff(staff2Notes, 2, !isTabletOrMobile)}
          {isTabletOrMobile && renderStaff(staff3Notes, 3, true)}
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

export default Layout2;
