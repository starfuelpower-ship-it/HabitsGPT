import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export type AmbientMode = 'off' | 'rain' | 'sun_rays' | 'snow' | 'fireflies' | 'cherry_blossoms' | 'autumn_leaves';

interface AmbientContextType {
  ambientMode: AmbientMode;
  setAmbientMode: (mode: AmbientMode) => void;
  visualsEnabled: boolean;
  setVisualsEnabled: (enabled: boolean) => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (value: number) => void;
  intensity: number; // 0-100
  setIntensity: (value: number) => void;
  isLoading: boolean;
  turnOffAllAmbience: () => void;
}

const AmbientContext = createContext<AmbientContextType | undefined>(undefined);

// Local storage keys for guests
const AMBIENT_MODE_KEY = 'daily-reset-ambient-mode';
const AMBIENT_VISUALS_KEY = 'daily-reset-ambient-visuals';
const AMBIENT_SOUNDS_KEY = 'daily-reset-ambient-sounds';
const AMBIENT_SOUND_VOLUME_KEY = 'daily-reset-ambient-sound-volume';
const AMBIENT_INTENSITY_KEY = 'daily-reset-ambient-intensity';

// Get seasonal ambient mode based on current month
const getSeasonalMode = (): AmbientMode => {
  const month = new Date().getMonth();
  // Dec, Jan, Feb = Winter (snow)
  if (month === 11 || month === 0 || month === 1) return 'snow';
  // Mar, Apr, May = Spring (cherry blossoms)
  if (month >= 2 && month <= 4) return 'cherry_blossoms';
  // Jun, Jul, Aug = Summer (fireflies)
  if (month >= 5 && month <= 7) return 'fireflies';
  // Sep, Oct, Nov = Autumn (autumn leaves)
  return 'autumn_leaves';
};

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { settings, updateSettings, loading } = useUserSettings();
  const { resolvedTheme } = useTheme();
  
  // Local state for immediate UI updates - default to autumn leaves
  const [localMode, setLocalMode] = useState<AmbientMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AMBIENT_MODE_KEY);
      return (stored as AmbientMode) || 'autumn_leaves';
    }
    return 'autumn_leaves';
  });
  
  const [localVisualsEnabled, setLocalVisualsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AMBIENT_VISUALS_KEY);
      return stored === null ? true : stored === 'true';
    }
    return true;
  });

  const [localSoundsEnabled, setLocalSoundsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AMBIENT_SOUNDS_KEY);
      return stored === null ? false : stored === 'true'; // Default off
    }
    return false;
  });

  const [localSoundVolume, setLocalSoundVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AMBIENT_SOUND_VOLUME_KEY);
      return stored ? parseInt(stored, 10) : 35; // Default 35%
    }
    return 35;
  });

  const [localIntensity, setLocalIntensity] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AMBIENT_INTENSITY_KEY);
      return stored ? parseInt(stored, 10) : 50;
    }
    return 50;
  });
  
  const initialized = useRef(false);

  // Sync local state with settings from database (for logged-in users)
  useEffect(() => {
    if (user && settings && !initialized.current) {
      const mode = (settings as any).ambient_mode as AmbientMode || 'autumn_leaves';
      const visuals = (settings as any).ambient_visuals_enabled ?? true;
      const sounds = (settings as any).ambient_sounds_enabled ?? false;
      
      setLocalMode(mode);
      setLocalVisualsEnabled(visuals);
      setLocalSoundsEnabled(sounds);
      initialized.current = true;
    }
  }, [user, settings, resolvedTheme]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(AMBIENT_MODE_KEY, localMode);
    }
  }, [localMode, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(AMBIENT_VISUALS_KEY, String(localVisualsEnabled));
    }
  }, [localVisualsEnabled, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(AMBIENT_SOUNDS_KEY, String(localSoundsEnabled));
    }
  }, [localSoundsEnabled, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(AMBIENT_SOUND_VOLUME_KEY, String(localSoundVolume));
    }
  }, [localSoundVolume, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(AMBIENT_INTENSITY_KEY, String(localIntensity));
    }
  }, [localIntensity, user]);

  const setAmbientMode = useCallback(async (mode: AmbientMode) => {
    setLocalMode(mode);
    if (user) {
      await updateSettings({ ambient_mode: mode } as any);
    }
  }, [updateSettings, user]);

  const setVisualsEnabled = useCallback(async (enabled: boolean) => {
    setLocalVisualsEnabled(enabled);
    if (user) {
      await updateSettings({ ambient_visuals_enabled: enabled } as any);
    }
  }, [updateSettings, user]);

  const setSoundsEnabled = useCallback(async (enabled: boolean) => {
    setLocalSoundsEnabled(enabled);
    if (user) {
      await updateSettings({ ambient_sounds_enabled: enabled } as any);
    }
  }, [updateSettings, user]);

  const setSoundVolume = useCallback((value: number) => {
    setLocalSoundVolume(value);
    // Note: volume is stored locally only, not in database
  }, []);

  const setIntensity = useCallback((value: number) => {
    setLocalIntensity(value);
    // Note: intensity is stored locally only, not in database
  }, []);

  const turnOffAllAmbience = useCallback(async () => {
    setLocalMode('off');
    setLocalVisualsEnabled(false);
    setLocalSoundsEnabled(false);
    if (user) {
      await updateSettings({
        ambient_mode: 'off',
        ambient_visuals_enabled: false,
        ambient_sounds_enabled: false,
      } as any);
    }
  }, [updateSettings, user]);

  return (
    <AmbientContext.Provider
      value={{
        ambientMode: localMode,
        setAmbientMode,
        visualsEnabled: localVisualsEnabled,
        setVisualsEnabled,
        soundsEnabled: localSoundsEnabled,
        setSoundsEnabled,
        soundVolume: localSoundVolume,
        setSoundVolume,
        intensity: localIntensity,
        setIntensity,
        isLoading: loading,
        turnOffAllAmbience,
      }}
    >
      {children}
    </AmbientContext.Provider>
  );
}

export function useAmbient() {
  const context = useContext(AmbientContext);
  if (!context) {
    throw new Error('useAmbient must be used within an AmbientProvider');
  }
  return context;
}
