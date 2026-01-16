/**
 * PlaceNoteScreenNew - New design for placing note on music staff
 * Pink gradient background with circular rings
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import EventBackButton from '@/components/event/EventBackButton';
import EventNextButton from '@/components/event/EventNextButton';
import { fetchAllNotes } from '@services/event/eventApi';
import { initAudio, playNoteByPosition, isAudioInitialized, getNoteName, POSITION_TO_NOTE } from '@services/event/audio';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import NavbarV4 from '@/components/navbar/NavbarV4';
import AvatarGenerator from '@/components/event/ui/AvatarGenerator';
// Mapping from shape ID to Cloudflare image path - using optimized webp
// HEART-01 = Heart, HEART-02 = Oval, HEART-03 = Round, HEART-04 = Pear
// HEART-05 = Asscher, HEART-06 = Emerald, HEART-07 = Marquise
const DIAMOND_MAP = {
  // Shape IDs (from EventChooseShapePage)
  h1: 'mirror_DMM/HEART-01.webp',  // Heart shape
  h2: 'mirror_DMM/HEART-02.webp',  // Oval shape
  h3: 'mirror_DMM/HEART-03.webp',  // Round shape
  h4: 'mirror_DMM/HEART-04.webp',  // Pear shape
  h5: 'mirror_DMM/HEART-05.webp',  // Asscher shape
  h6: 'mirror_DMM/HEART-06.webp',  // Emerald shape
  h7: 'mirror_DMM/HEART-07.webp',  // Marquise shape
  // Legacy shape names (from old /event flow)
  heart: 'mirror_DMM/HEART-01.webp',
  oval: 'mirror_DMM/HEART-02.webp',
  round: 'mirror_DMM/HEART-03.webp',
  pear: 'mirror_DMM/HEART-04.webp',
  asscher: 'mirror_DMM/HEART-05.webp',
  emerald: 'mirror_DMM/HEART-06.webp',
  marquise: 'mirror_DMM/HEART-07.webp',
};

// Mapping from shape ID to AvatarGenerator diamondShape name
// Must match EventChooseShapePage: h1=Heart, h2=Oval, h3=Round, h4=Pear, h5=Asscher, h6=Emerald, h7=Marquise
// OLD (incorrect):
// h1: 'heart',
// h2: 'round',
// h3: 'emerald',
// h4: 'marquise',
// h5: 'pear',
// h6: 'oval',
// h7: 'princess',
const SHAPE_NAME_MAP = {
  h1: 'heart',
  h2: 'oval',
  h3: 'round',
  h4: 'pear',
  h5: 'asscher',
  h6: 'emerald',
  h7: 'marquise',
};

// Fixed mapping: Shape ID → Note position (each shape has one specific note)
const SHAPE_TO_POSITION = {
  h1: 0,  // Heart → Đô (C4)
  h2: 1,  // Oval → Rê (D4)
  h3: 2,  // Round → Mi (E4)
  h4: 3,  // Pear → Pha (F4)
  h5: 4,  // Asscher → Son (G4)
  h6: 5,  // Emerald → La (A4)
  h7: 6,  // Marquise → Si (B4)
};


// All possible Y positions for the note (7 positions for 7 notes)
// Following standard treble clef notation:
// - Đô (C4) = ledger line below staff
// - Rê (D4) = space below bottom line
// - Mi (E4) = Line 4 (bottom line)
// - Pha-Si on lines 2-3 and spaces 2-3
// Line centers: 4, 92, 180, 268, 356 (lines 0-4)
// Space centers: 48, 136, 224, 312 (spaces 0-3)
// Below staff: 400 (space below), 444 (ledger line)
const NOTE_POSITIONS_Y = [
  456,  // Position 0 - Ledger line (below staff) - Đô (C4) +12px
  404,  // Position 1 - Space below Line 4 - Rê (D4) +4px
  360,  // Position 2 - Line 4 (bottom) - Mi (E4) +4px
  316,  // Position 3 - Space 3 - Pha (F4) +4px
  272,  // Position 4 - Line 3 - Son (G4) +4px
  228,  // Position 5 - Space 2 - La (A4) +4px
  184,  // Position 6 - Line 2 - Si (B4) +4px
];

// getRandomPosition removed - position now determined by shape via SHAPE_TO_POSITION

const PlaceNoteScreenNew = () => {
  const navigate = useNavigate();

  // Get persisted position and setter from store
  const {
    user,
    selectedDiamond,
    setAllNotes,
    setUserNote,
    generatedAvatarUrl,
    generatedForShape,
    setGeneratedAvatar,
  } = useEventStore();

  // Pre-generate avatar: check if we need to generate
  const currentShape = SHAPE_NAME_MAP[selectedDiamond] || 'heart';
  const shouldGenerateAvatar = !generatedAvatarUrl || generatedForShape !== currentShape;

  // Position is always determined by shape (no need for useState or store)
  const positionX = 50; // Always centered
  const positionY = SHAPE_TO_POSITION[selectedDiamond] ?? 0; // Position determined by shape

  const [error] = useState('');
  const [, setLinesComplete] = useState(false); // Lines animation done
  const [diamondVisible, setDiamondVisible] = useState(false); // Diamond can appear
  const [titleVisible, setTitleVisible] = useState(false); // Title appears after diamond animation
  const [isTransitioning, setIsTransitioning] = useState(false); // Zoom-out transition
  const containerRef = useRef(null); // Main container ref for setting CSS vars
  const heartRef = useRef(null);
  const rippleRef = useRef(null);
  const hasNavigatedRef = useRef(false); // Track if user manually navigated
  const audioReadyRef = useRef(false); // Track if audio was initialized by user interaction

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

    // Save position and navigate immediately for seamless transition
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

  // Position is now deterministic (based on shape), no need to save to store


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

  // Auto-transition to next page after 5s - DISABLED: User must press Enter to proceed
  // useEffect(() => {
  //   const transitionTimer = setTimeout(() => {
  //     if (hasNavigatedRef.current) return; // Skip if user already navigated

  //     // Mark as navigated IMMEDIATELY to prevent race condition with manual click
  //     hasNavigatedRef.current = true;

  //     setIsTransitioning(true);

  //     // Destroy ripple before trans
  //     if (rippleRef.current) {
  //       rippleRef.current.destroy();
  //       rippleRef.current = null;
  //     }

  //     // Navigate immediately for seamless transition
  //     setUserNote({ positionX, positionY });
  //     navigate(ROUTES.EVENT_WRITE_MESSAGE);
  //   }, 5000);

  //   return () => clearTimeout(transitionTimer);
  // }, [navigate, positionX, positionY, setUserNote]);

  // Navigate on Enter key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
Bạn là nốt sáng {getNoteName(positionY)}
          </h2>
        )}

        {/* Back and Next buttons */}
        <EventBackButton onClick={handleGoBack} />
        <EventNextButton onClick={handleNext} />

      {/* Solock decoration - left side */}
      <img
        src={getMediaUrl('dmm/solock.webp')}
        alt=""
        className="place-note-new__solock"
      />

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
            {/* Click/tap to play sound (works on iOS) */}
            {diamondVisible && (
              <div
                ref={heartRef}
                className={`place-note-new__diamond place-note-new__diamond--animate ${positionY === 0 ? 'place-note-new__diamond--position-do' : ''}`}
                style={{
                  left: '50vw', // Always center on viewport width
                  top: `${NOTE_POSITIONS_Y[positionY]}px`,
                  cursor: 'pointer',
                }}
                onClick={async () => {
                  await initAudio();
                  audioReadyRef.current = true;
                  playNoteByPosition(positionY);
                }}
                onTouchEnd={async (e) => {
                  e.preventDefault(); // Prevent double-fire with onClick
                  await initAudio();
                  audioReadyRef.current = true;
                  playNoteByPosition(positionY);
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

      {/* Hidden Avatar Generator - pre-generate for your-wallpaper page */}
      {shouldGenerateAvatar && (
        <AvatarGenerator
          displayName={user?.displayName || 'Guest'}
          lightNumber={user?.lightNumber || 1}
          diamondShape={currentShape}
          onGenerated={(url) => setGeneratedAvatar(url, currentShape)}
          delay={1500}
        />
      )}
      </div>
    </>
  );
};

export default PlaceNoteScreenNew;
