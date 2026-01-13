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
const DIAMOND_SHAPES = [
  'mirror_DMM/H1.webp',
  'mirror_DMM/H2.webp',
  'mirror_DMM/H3.webp',
  'mirror_DMM/H4.webp',
  'mirror_DMM/H5.webp',
  'mirror_DMM/H6.webp',
  'mirror_DMM/H7.webp',
];

// Staff configuration - 9 Y positions (5 lines + 4 zones)
// Line height 8px, gap 80px, total height 360px
const NOTE_POSITIONS_Y = [
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

// Happy melody intervals - ascending patterns for positive feeling
const HAPPY_INTERVALS = [
  [0, 2, 4],      // Major triad pattern
  [0, 2, 3, 5],   // Ascending scale
  [0, 4, 7],      // Power chord feel
  [2, 4, 5, 7],   // Happy progression
  [0, 2, 4, 5, 7], // Pentatonic feel
];

// Generate 7 random notes that form a happy melody
const generateHappyMelody = () => {
  const notes = [];

  // Pick a random happy pattern
  const pattern = HAPPY_INTERVALS[Math.floor(Math.random() * HAPPY_INTERVALS.length)];

  // Start from a random base position (0-4) to allow room for ascending
  const basePosition = Math.floor(Math.random() * 5);

  // Generate positions based on pattern, repeating if needed
  const positions = [];
  for (let i = 0; i < 7; i++) {
    const patternIndex = i % pattern.length;
    let pos = basePosition + pattern[patternIndex];
    // Keep within bounds (0-8)
    pos = Math.min(8, Math.max(0, pos));
    positions.push(pos);
  }

  // Distribute X positions evenly (10% to 85%)
  const minX = 10;
  const maxX = 85;
  const step = (maxX - minX) / 6; // 7 notes = 6 gaps

  for (let i = 0; i < 7; i++) {
    const positionX = minX + i * step + (Math.random() - 0.5) * 5; // Small random offset
    const shapeIndex = Math.floor(Math.random() * DIAMOND_SHAPES.length);

    notes.push({
      id: `note-${i}`,
      positionX: Math.max(5, Math.min(90, positionX)),
      positionY: positions[i],
      shape: DIAMOND_SHAPES[shapeIndex],
    });
  }

  return notes;
};

const WriteMessageScreenNew = () => {
  const navigate = useNavigate();
  const [isEntering, setIsEntering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const containerRef = useRef(null);
  const userNoteRef = useRef(null);
  const noteRefs = useRef({});
  const rippleRef = useRef(null);
  const playingRippleRef = useRef(null);

  const { userNote, melodyNotes, setMelodyNotes, selectedDiamond } = useEventStore();

  // User's note position
  const userPositionX = 95;
  const userPositionY = userNote?.positionY ?? 4;

  // Generate or retrieve melody notes (persisted)
  useEffect(() => {
    if (!melodyNotes) {
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

    // Sort all notes by X position (left to right)
    const allNotes = [
      ...displayNotes.map(note => ({ ...note, isUserNote: false })),
      { id: 'user-note', positionX: userPositionX, positionY: userPositionY, isUserNote: true },
    ].sort((a, b) => a.positionX - b.positionX);

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
  }, [isPlaying, displayNotes, userPositionX, userPositionY]);

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
  const getUserDiamondShape = () => {
    if (selectedDiamond) {
      const shapeMap = {
        h1: 'mirror_DMM/H1.webp',
        h2: 'mirror_DMM/H2.webp',
        h3: 'mirror_DMM/H3.webp',
        h4: 'mirror_DMM/H4.webp',
        h5: 'mirror_DMM/H5.webp',
        h6: 'mirror_DMM/H6.webp',
        h7: 'mirror_DMM/H7.webp',
      };
      return shapeMap[selectedDiamond] || 'mirror_DMM/H1.webp';
    }
    return 'mirror_DMM/H1.webp';
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
              {/* 5 staff lines */}
              <div className="your-melody__lines">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="your-melody__line" />
                ))}
              </div>

              {/* Random notes (7) */}
              {displayNotes.map((note) => (
                <div
                  key={note.id}
                  ref={(el) => { noteRefs.current[note.id] = el; }}
                  className="your-melody__note"
                  style={{
                    left: `${note.positionX}%`,
                    top: `${NOTE_POSITIONS_Y[note.positionY]}px`,
                  }}
                >
                  <img
                    src={getMediaUrl(note.shape)}
                    alt="Diamond note"
                    className="your-melody__note-img"
                  />
                </div>
              ))}

              {/* User's note (last position) */}
              <div
                ref={userNoteRef}
                className="your-melody__note your-melody__note--user"
                style={{
                  left: `${userPositionX}%`,
                  top: `${NOTE_POSITIONS_Y[userPositionY]}px`,
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
