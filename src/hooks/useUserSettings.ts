import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  start_of_week: 'monday' | 'sunday';
  daily_reset_time: string;
  confetti_enabled: boolean;
  done_habit_position: 'keep' | 'bottom';
  daily_notification: boolean;
  vacation_mode: boolean;
  sound_enabled: boolean;
  ambient_mode: 'off' | 'rain' | 'sun_rays' | 'snow';
  ambient_visuals_enabled: boolean;
  ambient_sounds_enabled: boolean;
}

const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id'> = {
  theme: 'system',
  start_of_week: 'monday',
  daily_reset_time: '00:00',
  confetti_enabled: true,
  done_habit_position: 'keep',
  daily_notification: false,
  vacation_mode: false,
  sound_enabled: true,
  ambient_mode: 'sun_rays',
  ambient_visuals_enabled: true,
  ambient_sounds_enabled: false,
};

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          user_id: data.user_id,
          theme: (data.theme as 'light' | 'dark' | 'system') || 'system',
          start_of_week: (data.start_of_week as 'monday' | 'sunday') || 'monday',
          daily_reset_time: data.daily_reset_time || '00:00',
          confetti_enabled: data.confetti_enabled ?? true,
          done_habit_position: (data.done_habit_position as 'keep' | 'bottom') || 'keep',
          daily_notification: data.daily_notification ?? false,
          vacation_mode: data.vacation_mode ?? false,
          sound_enabled: data.sound_enabled ?? true,
          ambient_mode: ((data as any).ambient_mode as 'off' | 'rain' | 'sun_rays' | 'snow') || 'sun_rays',
          ambient_visuals_enabled: (data as any).ambient_visuals_enabled ?? true,
          ambient_sounds_enabled: (data as any).ambient_sounds_enabled ?? false,
        });
      } else {
        // Create default settings for new user
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...DEFAULT_SETTINGS,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings({
          id: newSettings.id,
          user_id: newSettings.user_id,
          theme: (newSettings.theme as 'light' | 'dark' | 'system') || 'system',
          start_of_week: (newSettings.start_of_week as 'monday' | 'sunday') || 'monday',
          daily_reset_time: newSettings.daily_reset_time || '00:00',
          confetti_enabled: newSettings.confetti_enabled ?? true,
          done_habit_position: (newSettings.done_habit_position as 'keep' | 'bottom') || 'keep',
          daily_notification: newSettings.daily_notification ?? false,
          vacation_mode: newSettings.vacation_mode ?? false,
          sound_enabled: newSettings.sound_enabled ?? true,
          ambient_mode: ((newSettings as any).ambient_mode as 'off' | 'rain' | 'sun_rays' | 'snow') || 'sun_rays',
          ambient_visuals_enabled: (newSettings as any).ambient_visuals_enabled ?? true,
          ambient_sounds_enabled: (newSettings as any).ambient_sounds_enabled ?? false,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use defaults if fetch fails
      setSettings({
        id: '',
        user_id: user.id,
        ...DEFAULT_SETTINGS,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateSettings = async (
    updates: Partial<Omit<UserSettings, 'id' | 'user_id'>>
  ): Promise<boolean> => {
    if (!user || !settings) return false;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to save settings');
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings,
  };
}
