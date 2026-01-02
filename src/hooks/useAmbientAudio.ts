import { useEffect, useRef, useCallback, useState } from 'react';
import { AmbientMode } from '@/contexts/AmbientContext';

// Ambient sounds configuration - programmatically generated
const AMBIENT_SOUNDS: Record<AmbientMode, { generate: () => void; description: string } | null> = {
  off: null,
  rain: { generate: () => {}, description: 'Soft rainfall' },
  sun_rays: { generate: () => {}, description: 'Warm breeze' },
  snow: { generate: () => {}, description: 'Winter wind' },
  fireflies: { generate: () => {}, description: 'Night ambience' },
  cherry_blossoms: { generate: () => {}, description: 'Spring breeze' },
  autumn_leaves: { generate: () => {}, description: 'Autumn rustling' },
};

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate ambient sounds programmatically
const createAmbientSound = (mode: AmbientMode, volume: number): { start: () => void; stop: () => void } | null => {
  if (mode === 'off') return null;

  const ctx = getAudioContext();
  let oscillators: OscillatorNode[] = [];
  let gainNodes: GainNode[] = [];
  let noiseSource: AudioBufferSourceNode | null = null;
  let isPlaying = false;

  // Create colored noise buffer
  const createNoiseBuffer = (type: 'white' | 'pink' | 'brown') => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      if (type === 'white') {
        output[i] = white * 0.5;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else { // brown
        output[i] = (b0 = (b0 + (0.02 * white)) / 1.02) * 3.5;
      }
    }
    return buffer;
  };

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodes.push(masterGain);

    switch (mode) {
      case 'rain': {
        // Pink noise for rain
        const noiseBuffer = createNoiseBuffer('pink');
        noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        break;
      }
      
      case 'sun_rays': {
        // Warm drone with subtle shimmer
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 100;
        
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 200;
        
        const gain1 = ctx.createGain();
        gain1.gain.value = 0.3;
        const gain2 = ctx.createGain();
        gain2.gain.value = 0.2;
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(masterGain);
        gain2.connect(masterGain);
        
        osc1.start();
        osc2.start();
        oscillators.push(osc1, osc2);
        gainNodes.push(gain1, gain2);
        break;
      }
      
      case 'snow': {
        // Brown noise for soft wind
        const noiseBuffer = createNoiseBuffer('brown');
        noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        break;
      }
      
      case 'fireflies': {
        // Night ambience with soft crickets
        const noiseBuffer = createNoiseBuffer('brown');
        noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        const highGain = ctx.createGain();
        highGain.gain.value = 0.5;
        
        noiseSource.connect(filter);
        filter.connect(highGain);
        highGain.connect(masterGain);
        noiseSource.start();
        gainNodes.push(highGain);
        break;
      }
      
      case 'cherry_blossoms': {
        // Light breeze with subtle high frequencies
        const noiseBuffer = createNoiseBuffer('white');
        noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 1;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.3;
        
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noiseSource.start();
        gainNodes.push(gain);
        break;
      }
      
      case 'autumn_leaves': {
        // Rustling leaves - filtered noise
        const noiseBuffer = createNoiseBuffer('pink');
        noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 0.5;
        
        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        break;
      }
    }
  };

  const stop = () => {
    isPlaying = false;
    oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    if (noiseSource) {
      try { noiseSource.stop(); } catch (e) {}
    }
    oscillators = [];
    gainNodes = [];
    noiseSource = null;
  };

  return { start, stop };
};

export function useAmbientAudio(mode: AmbientMode, enabled: boolean, volume: number) {
  const soundRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Clean up previous sound
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current = null;
    }

    if (enabled && mode !== 'off') {
      soundRef.current = createAmbientSound(mode, volume);
      if (soundRef.current) {
        soundRef.current.start();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current = null;
      }
    };
  }, [mode, enabled, volume]);

  // Update volume when it changes
  useEffect(() => {
    if (soundRef.current && isPlaying) {
      // Recreate sound with new volume
      soundRef.current.stop();
      soundRef.current = createAmbientSound(mode, volume);
      if (soundRef.current) {
        soundRef.current.start();
      }
    }
  }, [volume]);

  const toggleSound = useCallback(() => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.stop();
        setIsPlaying(false);
      } else {
        soundRef.current.start();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  return { isPlaying, toggleSound };
}
