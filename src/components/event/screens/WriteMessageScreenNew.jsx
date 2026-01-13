/**
 * WriteMessageScreenNew (Your Melody) - Step 2: Display 8 notes (7 random + 1 user)
 * Sidebar layout with staff visualization and melody playback
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';
import { getMediaUrl } from '@/utils/cloudflareMediaUtil';
import NavbarV4 from '@/components/navbar/NavbarV4';
import ShineGlassButton from '@/components/common/button/ShineGlassButton';
import { initAudio, playNoteByPosition } from '@services/event/audio';

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

// Diamond shape Cloudflare paths array - using optimized webp
// HEART-01 = Heart, HEART-02 = Oval, HEART-03 = Round, HEART-04 = Pear
// HEART-05 = Cushion, HEART-06 = Emerald, HEART-07 = Marquise
const DIAMOND_SHAPES = [
  'mirror_DMM/HEART-01.webp',  // Heart shape
  'mirror_DMM/HEART-02.webp',  // Oval shape
  'mirror_DMM/HEART-03.webp',  // Round shape
  'mirror_DMM/HEART-04.webp',  // Pear shape
  'mirror_DMM/HEART-05.webp',  // Cushion shape
  'mirror_DMM/HEART-06.webp',  // Emerald shape
  'mirror_DMM/HEART-07.webp',  // Marquise shape
];

// Staff configuration - 9 Y positions (5 lines + 4 zones)
// Desktop: Line height 8px, gap 80px, total height 360px
const NOTE_POSITIONS_Y_DESKTOP = [
  4,    // Line 0 (top)
  48,   // Zone 0
  92,   // Line 1
  136,  // Zone 1
  180,  // Line 2 (middle)
  224,  // Zone 2
  268,  // Line 3
  312,  // Zone 3
  356,  // Line 4 (bottom)
];

// Mobile: Line height 8px, gap 50px, staff height 240px
// Staff 1: 0-240px, Staff 2: 360-600px (with 120px gap between)
const NOTE_POSITIONS_Y_MOBILE_STAFF1 = [
  4,    // Line 0 (top)
  33,   // Zone 0
  62,   // Line 1
  91,   // Zone 1
  120,  // Line 2 (middle)
  149,  // Zone 2
  178,  // Line 3
  207,  // Zone 3
  236,  // Line 4 (bottom)
];

const NOTE_POSITIONS_Y_MOBILE_STAFF2 = [
  324,  // Line 0 (top) - offset by 320px
  353,  // Zone 0
  382,  // Line 1
  411,  // Zone 1
  440,  // Line 2 (middle)
  469,  // Zone 2
  498,  // Line 3
  527,  // Zone 3
  556,  // Line 4 (bottom)
];

// Alias for backward compatibility
const NOTE_POSITIONS_Y = NOTE_POSITIONS_Y_DESKTOP;

// Happy melody intervals - ascending patterns for positive feeling
const HAPPY_INTERVALS = [
  [0, 2, 4],      // Major triad pattern
  [0, 2, 3, 5],   // Ascending scale
  [0, 4, 7],      // Power chord feel
  [2, 4, 5, 7],   // Happy progression
  [0, 2, 4, 5, 7], // Pentatonic feel
];

// Generate 7 random notes that form a happy melody
// Mobile: 4 notes on staff 1, 3 notes on staff 2 (+ user note = 4)
const generateHappyMelody = () => {
  const notes = [];

  // Generate random Y positions covering both lines and zones
  // Ensure good distribution across all position types
  const allPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 0,2,4,6,8 = lines; 1,3,5,7 = zones
  const shuffledPositions = [...allPositions].sort(() => Math.random() - 0.5);

  // Take 7 random positions, ensuring mix of lines and zones
  const positions = shuffledPositions.slice(0, 7);

  // For mobile layout (4 notes on staff 1, 3 on staff 2):
  // Notes 0-3: Staff 1, X positions spread left to right
  // Notes 4-6: Staff 2, X positions spread left to right
  // Note 7 (user's note): Staff 2, rightmost position

  // Staff 1: 4 notes, X from 15% to 85%
  // Staff 2: 4 notes (3 random + 1 user), X from 15% to 85%

  for (let i = 0; i < 7; i++) {
    const staffIndex = i < 4 ? 0 : 1; // First 4 notes on staff 1, rest on staff 2
    const indexInStaff = staffIndex === 0 ? i : i - 4;
    const notesInStaff = staffIndex === 0 ? 4 : 4; // 4 notes each staff (including user note in staff 2)

    // Calculate X position: spread evenly within staff, left to right
    // NO random offset - ensure strict left-to-right ordering
    const minX = 15;
    const maxX = staffIndex === 0 ? 85 : 65; // Staff 2 leaves room for user note at 85%
    const stepX = (maxX - minX) / (notesInStaff - 1);
    const positionX = minX + indexInStaff * stepX; // Removed random offset

    const shapeIndex = Math.floor(Math.random() * DIAMOND_SHAPES.length);

    notes.push({
      id: `note-${i}`,
      positionX,
      positionY: positions[i],
      staffIndex, // 0 = staff 1 (top), 1 = staff 2 (bottom)
      shape: DIAMOND_SHAPES[shapeIndex],
    });
  }

  return notes;
};

const WriteMessageScreenNew = () => {
  const navigate = useNavigate();
  const [isEntering, setIsEntering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const containerRef = useRef(null);
  const userNoteRef = useRef(null);
  const noteRefs = useRef({});
  const rippleRef = useRef(null);
  const playingRippleRef = useRef(null);

  const { userNote, melodyNotes, setMelodyNotes, selectedDiamond } = useEventStore();

  // Track window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // User's note position
  // Desktop: X at 83% (rightmost of single staff)
  // Mobile: X at 85% on staff 2 (rightmost of staff 2)
  const userPositionX = isMobile ? 85 : 83;
  const userPositionY = userNote?.positionY ?? 4;

  // Helper function to get Y position based on screen size and staff
  const getNoteYPosition = (positionY, staffIndex = 0) => {
    if (isMobile) {
      return staffIndex === 0
        ? NOTE_POSITIONS_Y_MOBILE_STAFF1[positionY]
        : NOTE_POSITIONS_Y_MOBILE_STAFF2[positionY];
    }
    return NOTE_POSITIONS_Y_DESKTOP[positionY];
  };

  // Generate or retrieve melody notes (persisted)
  // Force regenerate if old melody doesn't have staffIndex (migration)
  useEffect(() => {
    const needsRegenerate = !melodyNotes ||
      (melodyNotes.length > 0 && melodyNotes[0].staffIndex === undefined);

    if (needsRegenerate) {
      const newMelody = generateHappyMelody();
      setMelodyNotes(newMelody);
    }
  }, [melodyNotes, setMelodyNotes]);

  // Use persisted melody or empty array while loading
  const displayNotes = melodyNotes || [];

  // Preload webp images
  useEffect(() => {
    DIAMOND_SHAPES.forEach(shape => {
      const img = new Image();
      img.src = getMediaUrl(shape);
    });
  }, []);


  // Remove entering class after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Initialize RippleEffect on user's note (after entrance, not during play)
  useEffect(() => {
    if (isEntering || isPlaying) return;

    if (userNoteRef.current && !rippleRef.current) {
      rippleRef.current = new RippleEffect(userNoteRef.current, {
        autoRippleCount: 4,
        duration: 5000,
        delay: 1200,
        startSize: 60,
        endSize: 400,
        opacity: 0.6,
        autoPlay: true,
        clickable: false,
        clickRippleCount: 3,
      });
    }

    return () => {
      if (rippleRef.current) {
        rippleRef.current.destroy();
        rippleRef.current = null;
      }
    };
  }, [isEntering, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rippleRef.current) {
        rippleRef.current.destroy();
      }
      if (playingRippleRef.current) {
        playingRippleRef.current.destroy();
      }
    };
  }, []);

  // Play melody - all notes from left to right
  const handlePlayMelody = useCallback(async () => {
    if (isPlaying) return;

    await initAudio();
    setIsPlaying(true);

    // Pause user's continuous ripple during melody playback
    if (rippleRef.current) {
      rippleRef.current.destroy();
      rippleRef.current = null;
    }

    const tempo = 400; // ms between notes

    // Sort notes: by staffIndex first, then by X position within each staff
    const allNotes = [
      ...displayNotes.map(note => ({ ...note, isUserNote: false })),
      { id: 'user-note', positionX: userPositionX, positionY: userPositionY, isUserNote: true },
    ].sort((a, b) => {
      const staffA = a.staffIndex ?? (a.isUserNote && isMobile ? 1 : 0);
      const staffB = b.staffIndex ?? (b.isUserNote && isMobile ? 1 : 0);
      // Sort by staff first
      if (staffA !== staffB) {
        return staffA - staffB;
      }
      // Then by X position within same staff
      return a.positionX - b.positionX;
    });

    for (let i = 0; i < allNotes.length; i++) {
      const note = allNotes[i];
      const noteElement = note.isUserNote ? userNoteRef.current : noteRefs.current[note.id];

      // Add playing class directly to DOM for instant visual feedback
      if (noteElement) {
        noteElement.classList.add('your-melody__note--playing');
      }

      // Destroy previous playing ripple
      if (playingRippleRef.current) {
        playingRippleRef.current.destroy();
        playingRippleRef.current = null;
      }

      // Create ripple effect on current note
      if (noteElement) {
        playingRippleRef.current = new RippleEffect(noteElement, {
          autoRippleCount: 2,
          duration: 800,
          delay: 0,
          startSize: 40,
          endSize: 200,
          opacity: 0.7,
          autoPlay: true,
          clickable: false,
        });
      }

      // Play the sound based on Y position
      playNoteByPosition(note.positionY);

      // Wait before next note
      await new Promise(resolve => setTimeout(resolve, tempo));

      // Remove playing class after note is done
      if (noteElement) {
        noteElement.classList.remove('your-melody__note--playing');
      }
    }

    // Cleanup playing ripple
    if (playingRippleRef.current) {
      playingRippleRef.current.destroy();
      playingRippleRef.current = null;
    }

    // Restart user's continuous ripple after melody ends
    if (userNoteRef.current) {
      rippleRef.current = new RippleEffect(userNoteRef.current, {
        autoRippleCount: 4,
        duration: 5000,
        delay: 1200,
        startSize: 60,
        endSize: 400,
        opacity: 0.6,
        autoPlay: true,
        clickable: false,
        clickRippleCount: 3,
      });
    }

    setIsPlaying(false);
  }, [isPlaying, displayNotes, userPositionX, userPositionY, isMobile]);

  // Play only user's note
  const handlePlayUserNote = useCallback(async () => {
    await initAudio();

    // Add playing class directly to DOM
    if (userNoteRef.current) {
      userNoteRef.current.classList.add('your-melody__note--playing');
    }

    playNoteByPosition(userPositionY);

    // Remove playing class after sound plays
    setTimeout(() => {
      if (userNoteRef.current) {
        userNoteRef.current.classList.remove('your-melody__note--playing');
      }
    }, 800);
  }, [userPositionY]);

  // Navigation
  const handleGoBack = () => {
    navigate(ROUTES.EVENT_PLACE_NOTE);
  };

  const handleNext = () => {
    navigate(ROUTES.EVENT_CHOOSE_NOTE);
  };

  // Get user's diamond shape
  // HEART-01 = Heart, HEART-02 = Oval, HEART-03 = Round, HEART-04 = Pear
  // HEART-05 = Cushion, HEART-06 = Emerald, HEART-07 = Marquise
  const getUserDiamondShape = () => {
    if (selectedDiamond) {
      const shapeMap = {
        h1: 'mirror_DMM/HEART-01.webp', // Heart shape
        h2: 'mirror_DMM/HEART-02.webp', // Oval shape
        h3: 'mirror_DMM/HEART-03.webp', // Round shape
        h4: 'mirror_DMM/HEART-04.webp', // Pear shape
        h5: 'mirror_DMM/HEART-05.webp', // Cushion shape
        h6: 'mirror_DMM/HEART-06.webp', // Emerald shape
        h7: 'mirror_DMM/HEART-07.webp', // Marquise shape
      };
      return shapeMap[selectedDiamond] || 'mirror_DMM/HEART-01.webp';
    }
    return 'mirror_DMM/HEART-01.webp';
  };

  return (
    <>
      <NavbarV4 logoOnly />
      <div
        ref={containerRef}
        className={`your-melody ${isEntering ? 'your-melody--entering' : ''}`}
        data-navbar-theme="black"
      >
        {/* Background */}
        <div className="your-melody__bg" />

        {/* Header - Title and description at top left */}
        <header className="your-melody__header">
          <h2 className="heading-2--no-margin your-melody__title">Tương tác cùng Nốt sáng</h2>
          <p className="bodytext-6--no-margin your-melody__description">
            Bạn đã tạo nên Nốt Sáng của riêng mình. Hãy trải nghiệm và lắng nghe giai điệu được hoàn thiện từ chính sự hiện diện của bạn.
          </p>
        </header>

        {/* Main content - Staff with notes */}
        <main className="your-melody__main">
          {/* Staff container */}
          <div className="your-melody__staff-container">
            <div className="your-melody__staff">
              {/* Staff 1: 5 lines (top) */}
              <div className="your-melody__lines your-melody__lines--staff1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="your-melody__line" />
                ))}
              </div>

              {/* Staff 2: 5 lines (bottom) - mobile only */}
              <div className="your-melody__lines your-melody__lines--staff2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={`staff2-${i}`} className="your-melody__line" />
                ))}
              </div>

              {/* Random notes (7) */}
              {displayNotes.map((note) => {
                const yPos = getNoteYPosition(note.positionY, note.staffIndex || 0);
                return (
                  <div
                    key={note.id}
                    ref={(el) => { noteRefs.current[note.id] = el; }}
                    className="your-melody__note"
                    style={{
                      left: `${note.positionX}%`,
                      top: `${yPos}px`,
                    }}
                  >
                    <img
                      src={getMediaUrl(note.shape)}
                      alt="Diamond note"
                      className="your-melody__note-img"
                    />
                  </div>
                );
              })}

              {/* User's note (last position - on staff 2 for mobile) */}
              <div
                ref={userNoteRef}
                className="your-melody__note your-melody__note--user"
                style={{
                  left: `${userPositionX}%`,
                  top: `${getNoteYPosition(userPositionY, isMobile ? 1 : 0)}px`,
                }}
              >
                <img
                  src={getMediaUrl(getUserDiamondShape())}
                  alt="Your note"
                  className="your-melody__note-img your-melody__note-img--user"
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer - arrows and action buttons */}
        <footer className="your-melody__footer">
          {/* Left arrow */}
          <div className="your-melody__arrow your-melody__arrow--left">
            <ShineGlassButton
              variant="circle"
              onClick={handleGoBack}
              width={48}
              height={48}
            >
              <ArrowLeftIcon />
            </ShineGlassButton>
          </div>

          {/* Action buttons */}
          <div className="your-melody__actions">
            <ShineGlassButton
              onClick={handlePlayMelody}
              disabled={isPlaying}
            >
              Nghe 1 đoạn nốt
            </ShineGlassButton>
            <ShineGlassButton
              theme="light"
              onClick={handlePlayUserNote}
              disabled={isPlaying}
            >
              Nghe nốt của tôi
            </ShineGlassButton>
          </div>

          {/* Right arrow */}
          <div className="your-melody__arrow your-melody__arrow--right">
            <ShineGlassButton
              variant="circle"
              onClick={handleNext}
              width={48}
              height={48}
            >
              <ArrowRightIcon />
            </ShineGlassButton>
          </div>
        </footer>
      </div>
    </>
  );
};

export default WriteMessageScreenNew;
