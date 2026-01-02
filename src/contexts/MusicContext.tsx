import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MusicContextType {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  currentTrack: number;
  nextTrack: () => void;
  isLoading: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const TRACKS = [
  '/audio/lofi-rain-1.mp3',
  '/audio/lofi-rain-2.mp3',
  '/audio/sunlit-morning-1.mp3',
  '/audio/sunlit-morning-2.mp3',
];

const LOCAL_STORAGE_KEY = 'daily-reset-music-settings';
const MUSIC_INITIALIZED_KEY = 'daily-reset-music-initialized';

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Default to true for first-time users
  const [musicEnabled, setMusicEnabledState] = useState(() => {
    const initialized = localStorage.getItem(MUSIC_INITIALIZED_KEY);
    if (!initialized) return true; // First time - enable music
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).musicEnabled ?? true;
    }
    return true;
  });
  const [volume, setVolumeState] = useState(30);
  const [currentTrack, setCurrentTrack] = useState(1); // Default to "Rainy Morning Vibes 2"
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = false;
      
      const handleEnded = () => {
        setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, []);

  // Load settings from localStorage or database
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      // Mark as initialized for future visits
      localStorage.setItem(MUSIC_INITIALIZED_KEY, 'true');
      
      if (user) {
        const { data } = await supabase
          .from('user_settings')
          .select('music_enabled, music_volume')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setMusicEnabledState(data.music_enabled ?? true);
          setVolumeState(data.music_volume ?? 30);
        }
      } else {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setMusicEnabledState(parsed.musicEnabled ?? true);
          setVolumeState(parsed.volume ?? 30);
        }
      }
      
      setIsLoading(false);
    };
    
    loadSettings();
  }, [user]);

  // Update audio when track changes
  useEffect(() => {
    if (audioRef.current && musicEnabled) {
      audioRef.current.src = TRACKS[currentTrack];
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked, user interaction needed
      });
    }
  }, [currentTrack, musicEnabled]);

  // Handle play/pause based on musicEnabled
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (musicEnabled) {
      audioRef.current.src = TRACKS[currentTrack];
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [musicEnabled]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const setMusicEnabled = async (enabled: boolean) => {
    setMusicEnabledState(enabled);
    
    if (user) {
      await supabase
        .from('user_settings')
        .update({ music_enabled: enabled })
        .eq('user_id', user.id);
    } else {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const current = stored ? JSON.parse(stored) : {};
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...current, musicEnabled: enabled }));
    }
  };

  const setVolume = async (newVolume: number) => {
    setVolumeState(newVolume);
    
    if (user) {
      await supabase
        .from('user_settings')
        .update({ music_volume: newVolume })
        .eq('user_id', user.id);
    } else {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const current = stored ? JSON.parse(stored) : {};
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...current, volume: newVolume }));
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <MusicContext.Provider
      value={{
        musicEnabled,
        setMusicEnabled,
        volume,
        setVolume,
        currentTrack,
        nextTrack,
        isLoading,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
