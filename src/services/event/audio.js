/**
 * Audio Service for musical note playback
 * Uses iframe to get clean AudioContext (avoiding conflicts with iJewel3d SDK)
 */
import { getDiamondConfig, DIAMOND_CONFIGS } from '../../constants/eventConstants';

// Note frequencies (Hz)
const NOTE_FREQUENCIES = {
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
};

// Map Y position (0-8) on staff to note
export const POSITION_TO_NOTE = {
  0: 'C5',
  1: 'B4',
  2: 'A4',
  3: 'G4',
  4: 'F4',
  5: 'E4',
  6: 'D4',
  7: 'C4',
  8: 'B3',
};

let audioCtx = null;
let audioIframe = null;
let audioReady = false;

/**
 * Get the real AudioContext constructor from a clean iframe
 * (bypasses overrides from libraries like iJewel3d)
 */
function getRealAudioContextClass() {
  if (!audioIframe) {
    audioIframe = document.createElement('iframe');
    audioIframe.style.cssText = 'position:absolute;width:0;height:0;border:0;pointer-events:none;';
    audioIframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(audioIframe);
  }

  const iframeWindow = audioIframe.contentWindow;
  if (!iframeWindow) return null;

  return iframeWindow.AudioContext || iframeWindow.webkitAudioContext;
}

// Pre-create iframe on module load for faster first interaction
if (typeof document !== 'undefined') {
  setTimeout(() => getRealAudioContextClass(), 0);
}

/**
 * Get or create AudioContext
 */
function getAudioContext() {
  if (audioCtx && typeof audioCtx.createGain === 'function' && audioCtx.state !== 'closed') {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const AC = getRealAudioContextClass();
  if (!AC) return null;

  try {
    audioCtx = new AC();
    if (typeof audioCtx.createGain !== 'function') {
      audioCtx = null;
      return null;
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Initialize audio - call from user gesture (click/touch)
 * Returns a promise that resolves when audio is ready to play
 */
export async function initAudio() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  // If already ready, return immediately
  if (audioReady && ctx.state === 'running') {
    return true;
  }

  // Resume if suspended (Safari requires this on user gesture)
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      // Ignore resume errors
    }
  }

  // Play silent buffer to unlock on iOS Safari
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    // Ignore
  }

  // Wait a frame to ensure Safari has processed the unlock
  await new Promise(resolve => setTimeout(resolve, 50));

  audioReady = true;
  return true;
}

/**
 * Check if audio is initialized
 */
export function isAudioInitialized() {
  return audioCtx && audioCtx.state === 'running';
}

/**
 * Play a single note (piano-like sound)
 */
export async function playNote(pitch, duration = 0.8) {
  // Ensure audio is initialized on first play
  if (!audioReady) {
    await initAudio();
  }

  const ctx = getAudioContext();
  if (!ctx || typeof ctx.createGain !== 'function') return;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const frequency = NOTE_FREQUENCIES[pitch] || 440;
    const now = ctx.currentTime;

    const harmonics = [1, 2, 3, 4, 5, 6];
    const harmonicGains = [1, 0.5, 0.25, 0.125, 0.0625, 0.03];

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    // ADSR envelope
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.4, now + 0.005);
    masterGain.gain.exponentialRampToValueAtTime(0.2, now + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const oscillators = harmonics.map((harmonic, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

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
        try { osc.disconnect(); gain.disconnect(); } catch (e) {}
      });
      try { masterGain.disconnect(); } catch (e) {}
    }, (duration + 0.2) * 1000);

  } catch (error) {
    // Silent fail
  }
}

/**
 * Play note by Y position on staff
 */
export async function playNoteByPosition(positionY) {
  const note = POSITION_TO_NOTE[positionY];
  if (note) await playNote(note);
}

/**
 * Play note by diamond shape
 */
export async function playDiamondNote(shape) {
  const config = getDiamondConfig(shape);
  if (config) await playNote(config.pitch);
}

/**
 * Play a sequence of notes
 */
export async function playNoteSequence(pitches, tempo = 120) {
  await initAudio();
  const noteDuration = 60 / tempo;

  for (let i = 0; i < pitches.length; i++) {
    await playNote(pitches[i], 0.3);
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
  audioReady = false;

  if (audioIframe && audioIframe.parentNode) {
    audioIframe.parentNode.removeChild(audioIframe);
  }
  audioIframe = null;
}
