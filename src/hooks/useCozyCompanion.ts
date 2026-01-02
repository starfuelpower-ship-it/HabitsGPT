import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserActivity {
  firstOpenAt: string | null;
  lastOpenAt: string | null;
  totalAppOpens: number;
  totalDaysActive: number;
  longestBreakDays: number;
  morningOpens: number;
  eveningOpens: number;
  nightOpens: number;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  isReturnAfterBreak: boolean;
  daysSinceLastOpen: number;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  pointsReward: number;
  isHidden: boolean;
  earnedAt?: string;
  isEarned: boolean;
}

interface CozyCompanionState {
  activity: UserActivity | null;
  achievements: Achievement[];
  earnedAchievements: Achievement[];
  isLoading: boolean;
  catMood: 'playful' | 'affectionate' | 'sleepy' | 'curious' | 'cozy';
  shouldShowReturnMessage: boolean;
  returnMessage: string | null;
}

// Gentle return messages
const RETURN_MESSAGES = {
  short_break: [
    "Welcome back! Your cat missed you. 🐱",
    "You're here! That's what matters. 💫",
    "Good to see you again. ☀️",
  ],
  long_break: [
    "You came back. That takes courage. We're glad you're here. 💝",
    "You didn't fail. You just took a pause. Welcome home. 🌿",
    "The cat has been waiting for you. They're extra cuddly today. 😻",
    "Every return is a fresh start. No judgment here. 🌸",
  ],
  morning: [
    "Good morning! A cozy start to your day. ☀️",
    "Rise and shine, friend. Your plant is stretching too. 🌱",
  ],
  evening: [
    "Winding down? Your cat is getting sleepy too. 🌙",
    "Evening check-in. You're doing great. ✨",
  ],
  night: [
    "Late night visit? The cat appreciates the company. 🌙",
    "Can't sleep? Neither can we. Let's be cozy together. 💫",
  ],
};

export function useCozyCompanion() {
  const { user } = useAuth();
  const [state, setState] = useState<CozyCompanionState>({
    activity: null,
    achievements: [],
    earnedAchievements: [],
    isLoading: true,
    catMood: 'cozy',
    shouldShowReturnMessage: false,
    returnMessage: null,
  });
  
  const hasTrackedOpen = useRef(false);
  const shownReturnMessage = useRef(false);

  // Fetch all achievements
  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .order('sort_order');

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', user.id);

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
    const earnedMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua.earned_at]) || []);

    const achievements: Achievement[] = (allAchievements || []).map(a => ({
      id: a.id,
      key: a.key,
      name: a.name,
      description: a.description,
      category: a.category,
      icon: a.icon,
      pointsReward: a.points_reward || 0,
      isHidden: a.is_hidden || false,
      isEarned: earnedIds.has(a.id),
      earnedAt: earnedMap.get(a.id) || undefined,
    }));

    const earned = achievements.filter(a => a.isEarned);

    setState(prev => ({
      ...prev,
      achievements,
      earnedAchievements: earned,
    }));
  }, [user]);

  // Track app open and get activity data
  const trackAppOpen = useCallback(async () => {
    if (!user || hasTrackedOpen.current) return;
    hasTrackedOpen.current = true;

    try {
      const { data, error } = await supabase.rpc('track_app_open');
      
      if (error) {
        console.error('Error tracking app open:', error);
        return;
      }

      const result = data as { 
        success: boolean; 
        is_first_open?: boolean; 
        is_return_after_break?: boolean;
        days_since_last?: number;
      };

      if (result?.success) {
        // Fetch updated activity
        const { data: activityData } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (activityData) {
          const hour = new Date().getHours();
          let preferredTime: 'morning' | 'afternoon' | 'evening' | 'night' | null = null;
          const { morning_opens, evening_opens, night_opens } = activityData;
          const maxOpens = Math.max(morning_opens || 0, evening_opens || 0, night_opens || 0);
          if (maxOpens > 0) {
            if (morning_opens === maxOpens) preferredTime = 'morning';
            else if (evening_opens === maxOpens) preferredTime = 'evening';
            else if (night_opens === maxOpens) preferredTime = 'night';
            else preferredTime = 'afternoon';
          }

          const activity: UserActivity = {
            firstOpenAt: activityData.first_open_at,
            lastOpenAt: activityData.last_open_at,
            totalAppOpens: activityData.total_app_opens || 0,
            totalDaysActive: activityData.total_days_active || 0,
            longestBreakDays: activityData.longest_break_days || 0,
            morningOpens: activityData.morning_opens || 0,
            eveningOpens: activityData.evening_opens || 0,
            nightOpens: activityData.night_opens || 0,
            preferredTime,
            isReturnAfterBreak: result.is_return_after_break || false,
            daysSinceLastOpen: result.days_since_last || 0,
          };

          // Determine cat mood based on activity
          let catMood: CozyCompanionState['catMood'] = 'cozy';
          if (result.is_return_after_break) {
            catMood = 'affectionate'; // Cat missed you!
          } else if (hour >= 22 || hour < 6) {
            catMood = 'sleepy';
          } else if (hour >= 6 && hour < 10) {
            catMood = 'playful';
          } else {
            catMood = Math.random() > 0.5 ? 'curious' : 'cozy';
          }

          // Determine if we should show a return message
          let returnMessage: string | null = null;
          let shouldShowReturnMessage = false;

          if (!shownReturnMessage.current) {
            if (result.is_return_after_break && (result.days_since_last || 0) >= 7) {
              returnMessage = RETURN_MESSAGES.long_break[Math.floor(Math.random() * RETURN_MESSAGES.long_break.length)];
              shouldShowReturnMessage = true;
            } else if (result.is_return_after_break) {
              returnMessage = RETURN_MESSAGES.short_break[Math.floor(Math.random() * RETURN_MESSAGES.short_break.length)];
              shouldShowReturnMessage = true;
            } else if (hour >= 5 && hour < 10) {
              returnMessage = RETURN_MESSAGES.morning[Math.floor(Math.random() * RETURN_MESSAGES.morning.length)];
              shouldShowReturnMessage = Math.random() < 0.3; // 30% chance
            } else if (hour >= 20) {
              returnMessage = RETURN_MESSAGES.evening[Math.floor(Math.random() * RETURN_MESSAGES.evening.length)];
              shouldShowReturnMessage = Math.random() < 0.3;
            } else if (hour < 5) {
              returnMessage = RETURN_MESSAGES.night[Math.floor(Math.random() * RETURN_MESSAGES.night.length)];
              shouldShowReturnMessage = Math.random() < 0.5;
            }
            shownReturnMessage.current = true;
          }

          setState(prev => ({
            ...prev,
            activity,
            catMood,
            shouldShowReturnMessage,
            returnMessage,
            isLoading: false,
          }));

          // Check for achievements based on activity
          checkActivityAchievements(activity, result);
        }
      }
    } catch (err) {
      console.error('Error in trackAppOpen:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  // Check and award activity-based achievements
  const checkActivityAchievements = async (activity: UserActivity, openResult: any) => {
    if (!user) return;

    const achievementsToCheck: string[] = [];

    // Return after break achievements
    if (openResult.is_return_after_break) {
      achievementsToCheck.push('still_showing_up');
      if ((openResult.days_since_last || 0) >= 7) {
        achievementsToCheck.push('you_came_back');
        achievementsToCheck.push('they_missed_you');
      }
    }

    // Time-based achievements
    if (activity.morningOpens >= 5) {
      achievementsToCheck.push('morning_stretch');
    }
    if (activity.morningOpens >= 10) {
      achievementsToCheck.push('early_bird');
    }
    if (activity.nightOpens >= 3) {
      achievementsToCheck.push('nap_time');
    }
    if (activity.nightOpens >= 10 || activity.eveningOpens >= 10) {
      achievementsToCheck.push('night_owl');
    }

    // Days active achievements
    if (activity.totalDaysActive >= 14) {
      achievementsToCheck.push('two_weeks');
      achievementsToCheck.push('quiet_consistency');
    }
    if (activity.totalDaysActive >= 30) {
      achievementsToCheck.push('one_month');
    }
    if (activity.totalDaysActive >= 90) {
      achievementsToCheck.push('three_months');
    }

    // Try to earn each achievement (will fail silently if already earned)
    for (const key of achievementsToCheck) {
      try {
        await supabase.rpc('earn_achievement', { _achievement_key: key });
      } catch (e) {
        // Silently ignore - achievement may already be earned
      }
    }

    // Refresh achievements list
    fetchAchievements();
  };

  // Earn a specific achievement
  const earnAchievement = useCallback(async (key: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('earn_achievement', { _achievement_key: key });
      
      if (error) {
        console.error('Error earning achievement:', error);
        return false;
      }

      const result = data as { success: boolean; already_earned?: boolean };
      
      if (result?.success) {
        fetchAchievements();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error earning achievement:', err);
      return false;
    }
  }, [user, fetchAchievements]);

  // Dismiss return message
  const dismissReturnMessage = useCallback(() => {
    setState(prev => ({
      ...prev,
      shouldShowReturnMessage: false,
    }));
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      trackAppOpen();
      fetchAchievements();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, trackAppOpen, fetchAchievements]);

  return {
    ...state,
    earnAchievement,
    dismissReturnMessage,
    refreshAchievements: fetchAchievements,
  };
}
