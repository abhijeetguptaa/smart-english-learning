// ======================================================
// MODERN CAPACITOR TTS + AUDIO MANAGER (ANDROID SAFE)
// Uses: @capacitor-community/text-to-speech
// ======================================================

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import i18n from '../i18n';

let clickSound: HTMLAudioElement | null = null;
let applauseSound: HTMLAudioElement | null = null;
const CLICK_SRC = '/sounds/heavy_khatak_wood_press.wav';
const APPLAUSE_SRC = '/applause.mp3';

export function playClick(): void {
  if (!clickSound) {
    clickSound = new Audio(CLICK_SRC);
    clickSound.loop = false;
    clickSound.volume = 1;
  }
  const playPromise = clickSound.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.log('Audio play failed:', error);
    });
  }
}

export function playApplauseSound(): void {
  if (!applauseSound) {
    applauseSound = new Audio(APPLAUSE_SRC);
    applauseSound.loop = false;
    applauseSound.volume = 0.5 * (0.3 + getGameVolume());
  }
  const playPromise = applauseSound.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.log('Applause play failed:', error);
    });
  }
}

export interface SpeakOptions {
  interrupt?: boolean;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  [key: string]: unknown;
}

interface QueuedSpeechItem {
  text: string;
  options?: SpeakOptions;
}

interface ActiveSource {
  osc: OscillatorNode;
  gain: GainNode;
}

// ======================================================
// GLOBAL STATE
// ======================================================
let queuedSpeech: QueuedSpeechItem[] = [];
let isSpeaking = false;
let currentSpeechId = 0;
let audioContext: AudioContext | null = null;
let activeSources: ActiveSource[] = [];

// ======================================================
// AUDIO CONTEXT
// ======================================================
interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext is not supported in this environment');
    }
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

const scheduleTone = async (
  type: OscillatorType,
  freqStart: number,
  freqEnd: number | null,
  duration: number,
  gainValue: number,
  delayMs = 0,
): Promise<void> => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    const startTime = ctx.currentTime + delayMs / 1000;
    const endTime = startTime + duration;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const source: ActiveSource = { osc, gain };
    activeSources.push(source);

    osc.onended = () => {
      activeSources = activeSources.filter((s) => s !== source);
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        /* Ignore errors if already stopped */
      }
    };

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    if (freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, endTime);
    }

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainValue * (2 + getGameVolume()), startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(endTime);
  } catch {
    console.warn('Tone failed');
  }
};

export const unlockAudio = async (): Promise<void> => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
  } catch {
    console.warn('Audio unlock failed');
  }
};

// ======================================================
// LEGACY COMPATIBILITY EXPORTS (NO-OP IN CAPACITOR TTS)
// ======================================================
export const initTTS = async (): Promise<boolean> => true;
export const preloadNativeSounds = async (): Promise<boolean> => true;

// ======================================================
// SIMPLE UI TONES
// ======================================================
const playTone = (
  type: OscillatorType,
  freqStart: number,
  freqEnd: number | null,
  duration: number,
  gainValue: number,
): Promise<void> => scheduleTone(type, freqStart, freqEnd, duration, gainValue);

export const stopAllTones = (): void => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  activeSources.forEach((source) => {
    try {
      source.gain.gain.cancelScheduledValues(now);
      source.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      source.osc.stop(now + 0.05);
    } catch {
      /* Ignore errors if already stopped */
    }
  });
  activeSources = [];
};

export const playClickSound = (): Promise<void> => playTone('sine', 600, 300, 0.2, 1);
export const playTapSound = (): Promise<void> => playTone('sine', 600, null, 0.04, 0.8);
export const playCardFlipSound = (): Promise<void> => playTone('sine', 400, 1400, 0.12, 0.8);
export const playSparklePop = (): void => {
  const tones = [1800, 2200, 2600, 3000];
  tones.forEach((freq, i) => {
    scheduleTone('sine', freq, freq + 200, 0.08, 0.25, i * 40);
  });
};

export const playCorrectSound = (): void => {
  const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
  tones.forEach((freq, i) => {
    scheduleTone('sine', freq, freq + 100, 0.3, 0.6, i * 100);
  });
};

export const playIncorrectSound = (): void => {
  const tones = [392.0, 349.23, 329.63]; // G4, F4, E4
  tones.forEach((freq, i) => {
    scheduleTone('sine', freq, freq - 50, 0.4, 0.5, i * 200);
  });
};

export const playWheelSpinSound = (): void => {
  for (let i = 0; i < 40; i++) {
    scheduleTone('triangle', 800 - i * 15, 100, 0.1, 0.15, i * 100);
  }
};

export const playWinFreeSpinSound = (): void => {
  const tones = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 (Major Arpeggio)
  tones.forEach((freq, i) => {
    scheduleTone('sine', freq, freq + 50, 0.25, 0.6, i * 120);
  });
};

export const playTileDropSound = (): Promise<void> => playTone('sine', 400, 200, 0.05, 0.2);
export const playMatchBurstSound = (): Promise<void> => playTone('sine', 800, 1000, 0.12, 0.3);
export const playRowClearSound = (): void => {
  const tones = [440, 554, 659];
  tones.forEach((freq, i) => {
    scheduleTone('sine', freq, freq + 50, 0.15, 0.2, i * 60);
  });
};
export const playBombSound = (): Promise<void> => playTone('triangle', 100, 40, 0.4, 0.4);
export const playColorBlastSound = (): void => {
  for (let i = 0; i < 8; i++) {
    scheduleTone('sine', 800 + i * 150, 400, 0.1, 0.15, i * 40);
  }
};

// ======================================================
// CAPACITOR TTS
// ======================================================
const flushQueue = async (): Promise<void> => {
  if (isSpeaking || queuedSpeech.length === 0) return;

  const item = queuedSpeech.shift();
  if (!item) return;

  await speakText(item.text, item.options);
};

export const speakText = async (text: string, options: SpeakOptions = {}): Promise<void> => {
  if (!text || !text.trim()) return;

  if (options.interrupt) {
    await stopSpeech();
  } else if (isSpeaking) {
    queuedSpeech.push({ text, options });
    return;
  }

  const thisSpeechId = ++currentSpeechId;
  console.log('Speaking', text);

  try {
    isSpeaking = true;

    // Voice defaults: pitch 1.0, rate 0.9 (natural but clear), increased volume
    const finalOptions = {
      lang: i18n.language || 'en-US',
      rate: 0.9,
      pitch: 1.0,
      volume: 4 * (0.3 + getGameVolume()),
      ...options,
    };

    // Safety timeout: Native TTS engines can sometimes hang
    const speakPromise = TextToSpeech.speak({
      text,
      ...finalOptions,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TTS_TIMEOUT')), 10000),
    );

    await Promise.race([speakPromise, timeoutPromise]);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : null;
    if (
      err?.message?.includes('cancel') ||
      err?.message?.includes('interrupted') ||
      err?.message === 'TTS_TIMEOUT'
    ) {
      // Expected interruptions
    } else {
      console.warn('TTS speak failed:', error);
    }
  } finally {
    if (currentSpeechId === thisSpeechId) {
      isSpeaking = false;
      queueMicrotask(() => flushQueue());
    }
  }
};

export const stopSpeech = async (): Promise<void> => {
  currentSpeechId++;
  queuedSpeech = [];
  isSpeaking = false;

  try {
    await TextToSpeech.stop();
  } catch {
    // Already stopped
  }
};

export const speakNumber = (n: number | string): Promise<void> => speakText(String(n));

// ======================================================
// HELPERS
// ======================================================
export const isSpeechSupported = (): boolean => true;

export const getGameVolume = (): number => {
  const storedVolume = localStorage.getItem('gameVolume');
  return storedVolume ? parseFloat(storedVolume) : 0.05;
};
