/**
 * Audio Service for musical note playback
 * Uses iframe to get clean AudioContext (avoiding conflicts with iJewel3d SDK)
 */
import { getDiamondConfig, DIAMOND_CONFIGS } from '../../constants/eventConstants';

// Note frequencies (Hz)
const NOTE_FREQUENCIES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
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
 * Play a single note
 */
export function playNote(pitch, duration = 0.5) {
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

    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch (error) {
    console.error('Failed to play note:', error);
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
