import { useCallback, useRef } from 'react';

type SoundType = 'click' | 'success' | 'complete' | 'pop' | 'soft_pop' | 'purr' | 'achievement' | 'button' | 'meow' | 'meow_happy' | 'meow_curious' | 'chirp' | 'trill';

// Create audio context lazily to avoid autoplay restrictions
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Cache for audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload kitten sounds - 15 cute, adorable baby cat mews
const KITTEN_SOUNDS = [
  '/audio/kitten-mew-1.mp3',
  '/audio/kitten-mew-2.mp3',
  '/audio/kitten-mew-3.mp3',
  '/audio/kitten-mew-4.mp3',
  '/audio/kitten-mew-5.mp3',
  '/audio/kitten-mew-6.mp3',
  '/audio/kitten-mew-7.mp3',
  '/audio/kitten-mew-8.mp3',
  '/audio/kitten-mew-9.mp3',
  '/audio/kitten-mew-10.mp3',
  '/audio/kitten-mew-11.mp3',
  '/audio/kitten-mew-12.mp3',
];

// Preload audio files
const preloadAudio = (src: string): HTMLAudioElement => {
  if (!audioCache[src]) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.4;
    audioCache[src] = audio;
  }
  return audioCache[src];
};

// Play real audio file
const playAudioFile = (src: string, volume: number = 0.4) => {
  try {
    const audio = preloadAudio(src);
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {
      // Silent fail for autoplay restrictions
    });
  } catch (e) {
    // Silent fail
  }
};

// Generate simple sounds programmatically
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', gain: number = 0.1) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silent fail for audio
  }
};

const SOUNDS: Record<SoundType, () => void> = {
  click: () => {
    playTone(800, 0.05, 'sine', 0.08);
  },
  button: () => {
    // Satisfying soft tap with subtle harmonic
    playTone(880, 0.04, 'sine', 0.12);
    setTimeout(() => playTone(1320, 0.03, 'sine', 0.06), 20);
  },
  pop: () => {
    playTone(600, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(900, 0.06, 'sine', 0.08), 30);
  },
  soft_pop: () => {
    // Soft, cozy pop for cat interactions - gentle and subtle
    playTone(520, 0.06, 'sine', 0.06);
    setTimeout(() => playTone(680, 0.04, 'sine', 0.04), 25);
  },
  success: () => {
    playTone(523, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 200);
  },
  complete: () => {
    playTone(440, 0.1, 'triangle', 0.12);
    setTimeout(() => playTone(554, 0.1, 'triangle', 0.1), 80);
    setTimeout(() => playTone(659, 0.12, 'triangle', 0.1), 160);
    setTimeout(() => playTone(880, 0.2, 'triangle', 0.08), 240);
  },
  purr: () => {
    // Play real cat purring sound - soft and cozy
    playAudioFile('/audio/cat-purr.mp3', 0.25);
  },
  meow: () => {
    // Play random kitten mew sound - 50% quieter (was 0.32, now ~0.16)
    const randomMew = KITTEN_SOUNDS[Math.floor(Math.random() * KITTEN_SOUNDS.length)];
    playAudioFile(randomMew, 0.16);
  },
  meow_happy: () => {
    // Play random kitten mew - 50% quieter
    const randomMew = KITTEN_SOUNDS[Math.floor(Math.random() * KITTEN_SOUNDS.length)];
    playAudioFile(randomMew, 0.2);
  },
  meow_curious: () => {
    // Play random kitten mew - 50% quieter
    const randomMew = KITTEN_SOUNDS[Math.floor(Math.random() * KITTEN_SOUNDS.length)];
    playAudioFile(randomMew, 0.15);
  },
  chirp: () => {
    // Play kitten chirp - 50% quieter
    playAudioFile(KITTEN_SOUNDS[0], 0.13);
  },
  trill: () => {
    // Play kitten trill - 50% quieter
    playAudioFile(KITTEN_SOUNDS[1], 0.15);
  },
  achievement: () => {
    // Triumphant fanfare
    playTone(523, 0.1, 'triangle', 0.12);
    setTimeout(() => playTone(659, 0.1, 'triangle', 0.12), 80);
    setTimeout(() => playTone(784, 0.1, 'triangle', 0.12), 160);
    setTimeout(() => playTone(1047, 0.3, 'triangle', 0.15), 240);
  },
};

// Get a random cat sound for variety
export const getRandomCatSound = (): SoundType => {
  const catSounds: SoundType[] = ['meow', 'meow_happy', 'meow_curious', 'chirp', 'trill', 'purr'];
  return catSounds[Math.floor(Math.random() * catSounds.length)];
};

export const getRandomTapSound = (): SoundType => {
  const tapSounds: SoundType[] = ['meow', 'meow_curious', 'chirp', 'trill'];
  return tapSounds[Math.floor(Math.random() * tapSounds.length)];
};

export const getHabitCompleteSound = (): SoundType => {
  const sounds: SoundType[] = ['meow_happy', 'trill', 'chirp'];
  return sounds[Math.floor(Math.random() * sounds.length)];
};

export function useSoundEffects() {
  const enabled = useRef(true);

  const playSound = useCallback((type: SoundType) => {
    if (enabled.current && SOUNDS[type]) {
      SOUNDS[type]();
    }
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    enabled.current = value;
  }, []);

  const triggerHapticFn = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: [50, 30, 50],
        success: [10, 50, 20],
        warning: [30, 20, 30],
        error: [50, 30, 50, 30, 50],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { playSound, setEnabled, triggerHaptic: triggerHapticFn };
}

// Haptic feedback utility with more types
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
  if ('vibrate' in navigator) {
    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: [50, 30, 50],
      success: [10, 50, 20],
      warning: [30, 20, 30],
      error: [50, 30, 50, 30, 50],
    };
    navigator.vibrate(patterns[type]);
  }
}
