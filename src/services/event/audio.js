/**
 * Audio Service for musical note playback
 * Uses iframe to get clean AudioContext (avoiding conflicts with iJewel3d SDK)
 */
import { getDiamondConfig, DIAMOND_CONFIGS } from '../../constants/eventConstants';

// Note frequencies (Hz) - Khuông nhạc khóa Sol (Treble Clef)
const NOTE_FREQUENCIES = {
  // Octave 4
  E4: 329.63,   // Mi
  F4: 349.23,   // Fa
  G4: 392.0,    // Sol
  A4: 440.0,    // La
  B4: 493.88,   // Si
  // Octave 5
  C5: 523.25,   // Đô cao
  D5: 587.33,   // Rê cao
  E5: 659.25,   // Mi cao
  F5: 698.46,   // Fa cao
};

// Map vị trí Y (0-8) trên khuông nhạc → nốt nhạc (đúng nhạc lý khóa Sol)
export const POSITION_TO_NOTE = {
  0: 'F5',   // Dòng 5 (trên) - Fa cao
  1: 'E5',   // Khe 4        - Mi cao
  2: 'D5',   // Dòng 4       - Rê cao
  3: 'C5',   // Khe 3        - Đô cao
  4: 'B4',   // Dòng 3 (giữa)- Si
  5: 'A4',   // Khe 2        - La
  6: 'G4',   // Dòng 2       - Sol
  7: 'F4',   // Khe 1        - Fa
  8: 'E4',   // Dòng 1 (dưới)- Mi
};

let audioCtx = null;
let isInitialized = false;

// Hidden iframe for clean AudioContext (kept alive)
let audioIframe = null;

/**
 * Initialize audio using iframe to get clean AudioContext
 */
export async function initAudio() {
  if (isInitialized && audioCtx && audioCtx.state !== 'closed') {
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    return true;
  }

  try {
    // Create hidden iframe and keep it alive
    audioIframe = document.createElement('iframe');
    audioIframe.style.cssText = 'position:absolute;width:0;height:0;border:0;pointer-events:none;';
    audioIframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(audioIframe);

    // Wait for iframe to be ready
    await new Promise((resolve) => {
      if (audioIframe.contentWindow) {
        resolve();
      } else {
        audioIframe.onload = resolve;
      }
    });

    // Get AudioContext from iframe window (clean, not overridden by iJewel3d)
    const iframeWindow = audioIframe.contentWindow;
    const AC = iframeWindow.AudioContext || iframeWindow.webkitAudioContext;

    if (!AC) {
      console.error('Web Audio API not supported');
      return false;
    }

    // Create context - keep iframe attached to keep context valid
    audioCtx = new AC();

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
}

/**
 * Check if audio is initialized
 */
export function isAudioInitialized() {
  return isInitialized && audioCtx && typeof audioCtx.createOscillator === 'function';
}

/**
 * Play a single note (piano-like sound)
 */
export function playNote(pitch, duration = 0.8) {
  if (!audioCtx || typeof audioCtx.createOscillator !== 'function') {
    console.warn('Audio not initialized');
    return;
  }

  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const frequency = NOTE_FREQUENCIES[pitch] || 440;
    const now = audioCtx.currentTime;

    // Piano-like sound using multiple harmonics
    const harmonics = [1, 2, 3, 4, 5, 6];
    const harmonicGains = [1, 0.5, 0.25, 0.125, 0.0625, 0.03];

    const masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);

    // Piano ADSR envelope
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.4, now + 0.005); // Fast attack
    masterGain.gain.exponentialRampToValueAtTime(0.2, now + 0.1); // Quick decay
    masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration); // Sustain & release

    const oscillators = harmonics.map((harmonic, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency * harmonic, now);
      gain.gain.setValueAtTime(harmonicGains[i] * 0.15, now);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);

      return { osc, gain };
    });

    // Cleanup
    setTimeout(() => {
      oscillators.forEach(({ osc, gain }) => {
        osc.disconnect();
        gain.disconnect();
      });
      masterGain.disconnect();
    }, (duration + 0.2) * 1000);

  } catch (error) {
    console.error('Failed to play note:', error);
  }
}

/**
 * Play note by position Y on staff (đúng nhạc lý)
 */
export function playNoteByPosition(positionY) {
  const note = POSITION_TO_NOTE[positionY];
  if (note) {
    playNote(note);
  }
}

/**
 * Play note by diamond shape
 */
export function playDiamondNote(shape) {
  const config = getDiamondConfig(shape);
  if (config) {
    playNote(config.pitch);
  }
}

/**
 * Play a sequence of notes
 */
export async function playNoteSequence(pitches, tempo = 120) {
  if (!isAudioInitialized()) {
    await initAudio();
  }

  const noteDuration = 60 / tempo;

  for (let i = 0; i < pitches.length; i++) {
    playNote(pitches[i], 0.3);
    await new Promise((resolve) => setTimeout(resolve, noteDuration * 500));
  }
}

/**
 * Play all diamond notes in sequence
 */
export function playScale() {
  const pitches = DIAMOND_CONFIGS.map((d) => d.pitch);
  playNoteSequence(pitches, 120);
}

/**
 * Play notes from an array of Note objects
 */
export function playNotesFromArray(notes, tempo = 100) {
  if (!notes || notes.length === 0) return;

  const sortedNotes = [...notes].sort((a, b) => a.positionX - b.positionX);
  const pitches = sortedNotes.map((note) => {
    const config = getDiamondConfig(note.diamondShape);
    return config?.pitch || 'C4';
  });

  playNoteSequence(pitches, tempo);
}

/**
 * Stop all sounds
 */
export function stopAll() {
  // Web Audio oscillators auto-stop
}

/**
 * Dispose audio resources
 */
export function disposeAudio() {
  if (audioCtx && typeof audioCtx.close === 'function') {
    audioCtx.close();
  }
  audioCtx = null;
  isInitialized = false;

  // Clean up iframe
  if (audioIframe && audioIframe.parentNode) {
    audioIframe.parentNode.removeChild(audioIframe);
  }
  audioIframe = null;
}
