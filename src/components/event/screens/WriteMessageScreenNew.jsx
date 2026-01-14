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
import GlassThemeButton from '@/components/common/button/GlassThemeButton';
import { initAudio, playNoteByPosition } from '@services/event/audio';
import AvatarGenerator from '@/components/event/ui/AvatarGenerator';

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

// Mapping from shape ID to AvatarGenerator diamondShape name
const SHAPE_NAME_MAP = {
  h1: 'heart',
  h2: 'round',
  h3: 'emerald',
  h4: 'marquise',
  h5: 'pear',
  h6: 'oval',
  h7: 'princess',
};

// Staff configuration - 9 Y positions (5 lines + 4 zones)
// Desktop: Line height 8px, gap 80px, total height 360px
const NOTE_POSITIONS_Y_DESKTOP = [
  7,    // Line 0 (top)
  51,   // Zone 0
  95,   // Line 1
  139,  // Zone 1
  183,  // Line 2 (middle)
  227,  // Zone 2
  271,  // Line 3
  315,  // Zone 3
  359,  // Line 4 (bottom)
];

// Mobile: Line height 8px, gap 50px, staff height 240px
// Staff 1: 0-240px, Staff 2: 360-600px (with 120px gap between)
// Added +5px offset to shift notes down slightly
const NOTE_POSITIONS_Y_MOBILE_STAFF1 = [
  9,    // Line 0 (top)
  38,   // Zone 0
  67,   // Line 1
  96,   // Zone 1
  125,  // Line 2 (middle)
  154,  // Zone 2
  183,  // Line 3
  212,  // Zone 3
  241,  // Line 4 (bottom)
];

const NOTE_POSITIONS_Y_MOBILE_STAFF2 = [
  329,  // Line 0 (top) - offset by 320px + 5px
  358,  // Zone 0
  387,  // Line 1
  416,  // Zone 1
  445,  // Line 2 (middle)
  474,  // Zone 2
  503,  // Line 3
  532,  // Zone 3
  561,  // Line 4 (bottom)
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Entrance animation states
  const [isAnimatingEntrance, setIsAnimatingEntrance] = useState(false);
  const [headerAnimated, setHeaderAnimated] = useState(false);
  const [userNoteAnimated, setUserNoteAnimated] = useState(false);
  const [animatedNoteIndices, setAnimatedNoteIndices] = useState([]);

  const containerRef = useRef(null);
  const userNoteRef = useRef(null);
  const noteRefs = useRef({});
  const rippleRef = useRef(null);

  const {
    user,
    userNote,
    melodyNotes,
    setMelodyNotes,
    selectedDiamond,
    generatedAvatarUrl,
    generatedForShape,
    setGeneratedAvatar,
  } = useEventStore();

  // Pre-generate avatar: check if we need to generate
  const currentShape = SHAPE_NAME_MAP[selectedDiamond] || 'heart';
  const shouldGenerateAvatar = !generatedAvatarUrl || generatedForShape !== currentShape;

  // Track window resize for mobile/tablet detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
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

  // Helper function to get X position based on screen size
  // Desktop: 8 notes spread evenly from 10% to 85%
  // Mobile/Tablet: use stored positionX (for 2-staff layout)
  const getNoteXPosition = (noteIndex, storedPositionX) => {
    if (isMobile) {
      return storedPositionX;
    }
    // Desktop: spread 8 notes evenly (indices 0-6 for melody + 7 for user)
    const minX = 10;
    const maxX = 85;
    const step = (maxX - minX) / 7; // 7 gaps for 8 notes
    return minX + noteIndex * step;
  };

  // Generate or retrieve melody notes (persisted)
  // Force regenerate if old melody doesn't have staffIndex or has wrong distribution
  useEffect(() => {
    const needsRegenerate = !melodyNotes ||
      melodyNotes.length === 0 ||
      melodyNotes[0].staffIndex === undefined ||
      // Check if notes have correct 4-3 distribution (notes 0-3 on staff 0, notes 4-6 on staff 1)
      melodyNotes.some((note, i) => {
        const expectedStaff = i < 4 ? 0 : 1;
        return note.staffIndex !== expectedStaff;
      });

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

  // Entrance animation sequence - runs when page loads (after entering animation)
  useEffect(() => {
    if (isEntering || displayNotes.length === 0) return;

    const runEntranceAnimation = async () => {
      setIsAnimatingEntrance(true);

      // Header slides in
      setHeaderAnimated(true);

      // User's note appears
      await new Promise(resolve => setTimeout(resolve, 200));
      setUserNoteAnimated(true);

      // All 7 notes slide up at the same time (no sound)
      await new Promise(resolve => setTimeout(resolve, 300));
      setAnimatedNoteIndices([0, 1, 2, 3, 4, 5, 6]);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsAnimatingEntrance(false);
    };

    runEntranceAnimation();
  }, [isEntering, displayNotes.length]);

  // Initialize RippleEffect on user's note (after entrance, not during play or animation)
  useEffect(() => {
    if (isEntering || isPlaying || isAnimatingEntrance) return;

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
  }, [isEntering, isPlaying, isAnimatingEntrance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rippleRef.current) {
        rippleRef.current.destroy();
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

    // Sort notes: by staffIndex first (mobile only), then by calculated X position
    const allNotes = [
      ...displayNotes.map((note, index) => ({
        ...note,
        isUserNote: false,
        noteIndex: index,
        calculatedX: getNoteXPosition(index, note.positionX)
      })),
      {
        id: 'user-note',
        positionX: userPositionX,
        positionY: userPositionY,
        isUserNote: true,
        noteIndex: 7,
        calculatedX: getNoteXPosition(7, userPositionX),
        staffIndex: 1 // User note always on staff 2 for mobile
      },
    ].sort((a, b) => {
      // On desktop, ignore staffIndex - just sort by X position
      if (!isMobile) {
        return a.calculatedX - b.calculatedX;
      }
      // On mobile/tablet, sort by staff first, then by X
      const staffA = a.staffIndex ?? 0;
      const staffB = b.staffIndex ?? 0;
      if (staffA !== staffB) {
        return staffA - staffB;
      }
      return a.calculatedX - b.calculatedX;
    });

    for (let i = 0; i < allNotes.length; i++) {
      const note = allNotes[i];
      const noteElement = note.isUserNote ? userNoteRef.current : noteRefs.current[note.id];

      // Add playing class directly to DOM for instant visual feedback
      if (noteElement) {
        noteElement.classList.add('your-melody__note--playing');
      }

      // Play the sound based on Y position
      playNoteByPosition(note.positionY);

      // Wait before next note
      await new Promise(resolve => setTimeout(resolve, tempo));

      // Remove playing class after note is done (clear ripple immediately)
      if (noteElement) {
        noteElement.classList.remove('your-melody__note--playing');
      }
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
        <header className={`your-melody__header ${!headerAnimated ? 'your-melody__header--hidden' : ''} ${headerAnimated && isAnimatingEntrance ? 'your-melody__header--animate' : ''}`}>
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
              {displayNotes.map((note, index) => {
                const xPos = getNoteXPosition(index, note.positionX);
                const yPos = getNoteYPosition(note.positionY, note.staffIndex || 0);
                const isNoteAnimated = animatedNoteIndices.includes(index);
                const shouldHide = !isNoteAnimated; // Hidden until animated
                return (
                  <div
                    key={note.id}
                    ref={(el) => { noteRefs.current[note.id] = el; }}
                    className={`your-melody__note ${shouldHide ? 'your-melody__note--hidden' : ''} ${isNoteAnimated && isAnimatingEntrance ? 'your-melody__note--animate-slide' : ''}`}
                    style={{
                      left: `${xPos}%`,
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

              {/* User's note (last position - index 7, on staff 2 for mobile) */}
              <div
                ref={userNoteRef}
                className={`your-melody__note your-melody__note--user ${!userNoteAnimated ? 'your-melody__note--hidden' : ''} ${userNoteAnimated && isAnimatingEntrance ? 'your-melody__note--animate-fly' : ''}`}
                style={{
                  left: `${getNoteXPosition(7, userPositionX)}%`,
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

        {/* Arrow buttons - fixed position like other pages */}
        <div className="your-melody__arrow your-melody__arrow--left">
          <GlassThemeButton theme="light" onClick={handleGoBack} icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M12.7187 5.70703L0.71875 5.70703M0.71875 5.70703L5.86161 0.707031M0.71875 5.70703L5.86161 10.707" stroke="currentColor" strokeLinecap="square"/>
            </svg>
          } />
        </div>
        <div className="your-melody__arrow your-melody__arrow--right">
          <GlassThemeButton theme="light" onClick={handleNext} icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M0.5 5.70703L12.5 5.70703M12.5 5.70703L7.35714 10.707M12.5 5.70703L7.35714 0.707031" stroke="currentColor" strokeLinecap="square"/>
            </svg>
          } />
        </div>

        {/* Footer - action buttons */}
        <footer className="your-melody__footer">
          {/* Action buttons */}
          <div className="your-melody__actions">
            <GlassThemeButton
              theme="light"
              onClick={handlePlayMelody}
              className={isPlaying ? 'disabled' : ''}
            >
              Nghe 1 đoạn nốt
            </GlassThemeButton>
            <GlassThemeButton
              theme="spec_dark"
              onClick={handlePlayUserNote}
              className={isPlaying ? 'disabled' : ''}
            >
              Nghe nốt của tôi
            </GlassThemeButton>
          </div>
        </footer>

        {/* Hidden Avatar Generator - continue pre-generate for your-wallpaper page */}
        {shouldGenerateAvatar && (
          <AvatarGenerator
            displayName={user?.displayName || 'Guest'}
            lightNumber={user?.lightNumber || 1}
            diamondShape={currentShape}
            onGenerated={(url) => setGeneratedAvatar(url, currentShape)}
            delay={1000}
          />
        )}
      </div>
    </>
  );
};

export default WriteMessageScreenNew;
