/**
 * PlaceNoteScreenNew - New design for placing note on music staff
 * Pink gradient background with circular rings
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import ShineGlassButton from '@/components/common/button/ShineGlassButton';
import { fetchAllNotes } from '@services/event/eventApi';
import { initAudio, playNoteByPosition, isAudioInitialized } from '@services/event/audio';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import lineSvg from '@/assets/images/dmm/line.svg';
import NavbarV4 from '@/components/navbar/NavbarV4';

// Custom Arrow Icons from Figma
const ArrowRightIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="12"
    viewBox="0 0 14 12"
    fill="none"
    className={className}
  >
    <path
      d="M0.5 5.70703L12.5 5.70703M12.5 5.70703L7.35714 10.707M12.5 5.70703L7.35714 0.707031"
      stroke="currentColor"
      strokeLinecap="square"
    />
  </svg>
);

const ArrowLeftIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="12"
    viewBox="0 0 14 12"
    fill="none"
    className={className}
    style={{ transform: 'scaleX(-1)' }}
  >
    <path
      d="M0.5 5.70703L12.5 5.70703M12.5 5.70703L7.35714 10.707M12.5 5.70703L7.35714 0.707031"
      stroke="currentColor"
      strokeLinecap="square"
    />
  </svg>
);

// Mapping from shape ID to Cloudflare image path - synced with EventChooseShapePage
const DIAMOND_MAP = {
  // Shape IDs (from EventChooseShapePage)
  h1: 'mirror_DMM/HEART-01.webp',  // Heart shape
  h2: 'mirror_DMM/HEART-02.webp',  // Oval shape
  h3: 'mirror_DMM/HEART-03.webp',  // Round shape
  h4: 'mirror_DMM/HEART-04.webp',  // Pear shape
  h5: 'mirror_DMM/HEART-05.webp',  // Cushion shape
  h6: 'mirror_DMM/HEART-06.webp',  // Emerald shape
  h7: 'mirror_DMM/HEART-07.webp',  // Marquise shape
  // Legacy shape names (from old /event flow)
  heart: 'mirror_DMM/HEART-01.webp',
  oval: 'mirror_DMM/HEART-02.webp',
  round: 'mirror_DMM/HEART-03.webp',
  pear: 'mirror_DMM/HEART-04.webp',
  cushion: 'mirror_DMM/HEART-05.webp',
  emerald: 'mirror_DMM/HEART-06.webp',
  marquise: 'mirror_DMM/HEART-07.webp',
};

// Mapping from position Y to Vietnamese note name
const POSITION_TO_NOTE_NAME = {
  0: 'Đô (C)',    // C5 - Đô cao
  1: 'Si (B)',    // B4
  2: 'La (A)',    // A4
  3: 'Sol (G)',   // G4
  4: 'Fa (F)',    // F4
  5: 'Mi (E)',    // E4
  6: 'Rê (D)',    // D4
  7: 'Đô (C)',    // C4
  8: 'Si (B)',    // B3 - Si thấp
};

// All possible Y positions for the note (9 positions total)
// Lines: 0, 2, 4, 6, 8 (odd index = on line)
// Zones: 1, 3, 5, 7 (even index = between lines)

// All screens: line height 8px, gap 80px, total height 360px
const NOTE_POSITIONS_Y = [
  4,    // Line 0 (top line)
  48,   // Zone 0 (between line 0 and 1)
  92,   // Line 1
  136,  // Zone 1 (between line 1 and 2)
  180,  // Line 2 (middle line)
  224,  // Zone 2 (between line 2 and 3)
  268,  // Line 3
  312,  // Zone 3 (between line 3 and 4)
  356,  // Line 4 (bottom line)
];

// Breakpoint for tablet/mobile (both use same line dimensions)
const TABLET_BREAKPOINT = 1024;

// Get random position (all positions: 0-8, including lines and zones)
const getRandomPosition = () => {
  return Math.floor(Math.random() * 9); // 0 to 8
};

const PlaceNoteScreenNew = () => {
  const navigate = useNavigate();

  // Get persisted position and setter from store
  const {
    selectedDiamond,
    initialNotePosition,
    setInitialNotePosition,
    setAllNotes,
    setUserNote,
  } = useEventStore();

  // Initialize position from store or generate random (only once per user)
  const [positionX] = useState(() => {
    if (initialNotePosition) return initialNotePosition.x;
    return 50; // Center by default
  });
  const [positionY] = useState(() => {
    if (initialNotePosition) return initialNotePosition.y;
    return getRandomPosition(); // Random position (0-8)
  });

  const [error] = useState('');
  const [, setLinesComplete] = useState(false); // Lines animation done
  const [diamondVisible, setDiamondVisible] = useState(false); // Diamond can appear
  const [titleVisible, setTitleVisible] = useState(false); // Title appears after diamond animation
  const [isTransitioning, setIsTransitioning] = useState(false); // Zoom-out transition
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(() => window.innerWidth <= TABLET_BREAKPOINT);
  const containerRef = useRef(null); // Main container ref for setting CSS vars
  const heartRef = useRef(null);
  const rippleRef = useRef(null);
  const hasNavigatedRef = useRef(false); // Track if user manually navigated
  const audioReadyRef = useRef(false); // Track if audio was initialized by user interaction

  // Note positions are the same for all screen sizes now

  // Handle next button - navigate to write message screen with zoom transition
  const handleNext = () => {
    if (isTransitioning || hasNavigatedRef.current) return;

    hasNavigatedRef.current = true;

    // Start fade-out transition
    setIsTransitioning(true);

    // Destroy ripple before transition
    if (rippleRef.current) {
      rippleRef.current.destroy();
      rippleRef.current = null;
    }

    // Save position and navigate after fade-out completes
    setTimeout(() => {
      setUserNote({
        positionX,
        positionY,
      });
      navigate(ROUTES.EVENT_WRITE_MESSAGE);
    }, 300); // Match layout1Exit animation duration (0.3s)
  };

  // Fetch existing notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      const notes = await fetchAllNotes();
      setAllNotes(notes);
    };
    loadNotes();
  }, [setAllNotes]);

  // Save initial position to store if not already saved (once per user)
  useEffect(() => {
    if (!initialNotePosition) {
      setInitialNotePosition({ x: positionX, y: positionY });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for window resize to update isTabletOrMobile
  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrMobile(window.innerWidth <= TABLET_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize audio on first user interaction (required by browser autoplay policy)
  useEffect(() => {
    const initAudioOnInteraction = async () => {
      if (audioReadyRef.current) return;

      try {
        await initAudio();
        audioReadyRef.current = true;
      } catch (e) {
        console.warn('Failed to init audio:', e);
      }

      // Remove listeners after first interaction
      document.removeEventListener('click', initAudioOnInteraction);
      document.removeEventListener('touchstart', initAudioOnInteraction);
    };

    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('touchstart', initAudioOnInteraction);

    return () => {
      document.removeEventListener('click', initAudioOnInteraction);
      document.removeEventListener('touchstart', initAudioOnInteraction);
    };
  }, []);

  // Animation sequence: lines (1s) -> diamond appears (0.2s delay) -> title (1s after diamond)
  useEffect(() => {
    // Lines complete after 1s
    const linesTimer = setTimeout(() => {
      setLinesComplete(true);
    }, 1000);

    // Diamond appears 0.2s after lines complete
    const diamondTimer = setTimeout(() => {
      setDiamondVisible(true);
    }, 1200);

    // Title appears 1s after diamond (after diamond scale animation completes)
    const titleTimer = setTimeout(() => {
      setTitleVisible(true);
    }, 2200);

    return () => {
      clearTimeout(linesTimer);
      clearTimeout(diamondTimer);
      clearTimeout(titleTimer);
    };
  }, []);

  // Initialize RippleEffect on heart AFTER diamond animation completes
  // Play initial note sound when first ripple starts (only if audio already initialized by user)
  useEffect(() => {
    if (!diamondVisible) return;

    // Wait for diamond scale animation to finish (1s)
    const rippleTimer = setTimeout(() => {
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

        // Only play sound if audio was already initialized by user interaction
        // Check both local ref and audio service state (for navigation between pages)
        if (audioReadyRef.current || isAudioInitialized()) {
          playNoteByPosition(positionY);
        }
      }
    }, 1000);

    return () => {
      clearTimeout(rippleTimer);
      if (rippleRef.current) {
        rippleRef.current.destroy();
        rippleRef.current = null;
      }
    };
  }, [diamondVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-transition to Layout 2 after 5s - COMMENTED OUT (use arrows to navigate)
  // useEffect(() => {
  //   const transitionTimer = setTimeout(() => {
  //     if (hasNavigatedRef.current) return; // Skip if user already navigated

  //     setIsTransitioning(true);

  //     // Destroy ripple before transition
  //     if (rippleRef.current) {
  //       rippleRef.current.destroy();
  //       rippleRef.current = null;
  //     }

  //     // Navigate after zoom-out animation completes (800ms)
  //     setTimeout(() => {
  //       if (hasNavigatedRef.current) return;
  //       hasNavigatedRef.current = true;
  //       setUserNote({ positionX, positionY });
  //       navigate(ROUTES.EVENT_WRITE_MESSAGE);
  //     }, 800);
  //   }, 5000);

  //   return () => clearTimeout(transitionTimer);
  // }, [navigate, positionX, positionY, setUserNote]);

  // Navigation - go back to Choose Shape
  const handleGoBack = () => {
    navigate(ROUTES.EVENT_CHOOSE_SHAPE);
  };

  return (
    <>
      <NavbarV4 logoOnly />
      <div
        ref={containerRef}
        className={`place-note-new ${isTransitioning ? 'place-note-new--zoom-out' : ''}`}
        data-navbar-theme="black"
      >
        {/* Background with radial rings */}
        <div className="place-note-new__bg">
          <div className="place-note-new__rings" />
        </div>

        {/* Note title - shows the note name based on position (appears after diamond animation) */}
        {titleVisible && (
          <h2 className="place-note-new__note-title place-note-new__note-title--animate heading-3--no-margin">
            Bạn là nốt sáng {POSITION_TO_NOTE_NAME[positionY]}
          </h2>
        )}

        {/* Arrow buttons - outside main to avoid transform containing block issue */}
        <div className="place-note-new__arrow place-note-new__arrow--left">
          <ShineGlassButton
            variant="circle"
            onClick={handleGoBack}
            width={48}
            height={48}
          >
            <ArrowLeftIcon />
          </ShineGlassButton>
        </div>
        <div className="place-note-new__arrow place-note-new__arrow--right">
          <ShineGlassButton
            variant="circle"
            onClick={handleNext}
            width={48}
            height={48}
          >
            <ArrowRightIcon />
          </ShineGlassButton>
        </div>

      {/* Main content - Music Staff (vertically centered) */}
      <main className="place-note-new__main">
        <div className="place-note-new__staff-container">
          {/* Music Staff with 5 SVG lines */}
          <div className="place-note-new__staff">
            {/* Red highlights on lines - COMMENTED OUT
            <div className="place-note-new__line-highlights">
              {[0, 1, 2, 3, 4].map((lineIndex) => {
                const isOnThisLine = positionY % 2 === 0 && positionY / 2 === lineIndex;
                return (
                  <div
                    key={lineIndex}
                    className={`place-note-new__line-highlight ${isOnThisLine ? 'place-note-new__line-highlight--active' : ''}`}
                  />
                );
              })}
            </div>
            */}

            {/* Green zones - COMMENTED OUT
            <div className="place-note-new__zones">
              {[0, 1, 2, 3].map((zoneIndex) => {
                const isInThisZone = positionY % 2 === 1 && (positionY - 1) / 2 === zoneIndex;
                return (
                  <div
                    key={zoneIndex}
                    className={`place-note-new__zone ${isInThisZone ? 'place-note-new__zone--active' : ''}`}
                  />
                );
              })}
            </div>
            */}

            {/* 5 staff lines */}
            <div className="place-note-new__lines-wrapper">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="place-note-new__line place-note-new__line--animate"
                />
              ))}
            </div>

            {/* Heart note on staff - only show after lines complete */}
            {diamondVisible && (
              <div
                ref={heartRef}
                className="place-note-new__diamond place-note-new__diamond--animate"
                style={{
                  left: `${positionX}%`,
                  top: `${NOTE_POSITIONS_Y[positionY]}px`,
                }}
              >
                <img
                  src={getMediaUrl(DIAMOND_MAP[selectedDiamond] || 'mirror_DMM/HEART-01.webp')}
                  alt="Diamond note"
                  className="place-note-new__heart"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer - bottom left */}
      <footer className="place-note-new__footer">
        {error && <p className="place-note-new__error">{error}</p>}
      </footer>
      </div>
    </>
  );
};

export default PlaceNoteScreenNew;
