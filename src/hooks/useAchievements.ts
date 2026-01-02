import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points_reward: number;
  is_hidden: boolean;
  sort_order: number;
  unlock_atmosphere?: string;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
}

const CATEGORY_ORDER = ['progress', 'streak', 'reflection', 'ai', 'companion', 'plant', 'economy', 'seasonal', 'secret'];

const CATEGORY_LABELS: Record<string, string> = {
  progress: 'Gentle Progress',
  streak: 'Consistency',
  reflection: 'Reflection',
  ai: 'Gentle Support',
  companion: 'Cozy Friend',
  plant: 'Growth',
  economy: 'Rewards',
  seasonal: 'Seasons',
  secret: 'Discoveries',
};

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const { data: allAchievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .order('category')
        .order('sort_order');

      if (achError) throw achError;
      setAchievements(allAchievements || []);

      if (user) {
        const { data: userAch, error: userError } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', user.id);

        if (userError) throw userError;
        setEarnedAchievements(new Set((userAch || []).map(a => a.achievement_id)));
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const earnAchievement = useCallback(async (achievementKey: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('earn_achievement', {
        _achievement_key: achievementKey
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; achievement_name?: string; points_awarded?: number; already_earned?: boolean } | null;

      if (result?.success) {
        const achievement = achievements.find(a => a.key === achievementKey);
        if (achievement) {
          setEarnedAchievements(prev => new Set([...prev, achievement.id]));
          
          // Show gentle toast with warm language
          toast.success(`${achievement.icon} ${achievement.name}`, {
            description: achievement.description,
            duration: 4000,
          });
        }
        return { success: true, points: result.points_awarded };
      }

      // Already earned is not an error, just skip silently
      if (result?.already_earned) {
        return { success: false, alreadyEarned: true };
      }

      return { success: false, error: result?.error || 'Unknown error' };
    } catch (error) {
      console.error('Error earning achievement:', error);
      return { success: false, error: 'Failed to earn achievement' };
    }
  }, [user, achievements]);

  const checkAndAwardAchievements = useCallback(async (context: {
    // Habit-related
    habitCompleted?: boolean;
    habitStreak?: number;
    totalHabitsCompleted?: number;
    daysWithHabits?: number;
    // Journal-related
    journalEntry?: boolean;
    journalCount?: number;
    moodLogged?: boolean;
    stressLogged?: boolean;
    // AI-related
    aiUsed?: boolean;
    aiReflectionCount?: number;
    habitSoftened?: boolean;
    // Companion-related
    rewardsVisited?: boolean;
    costumeEquipped?: boolean;
    catInteractions?: number;
    widgetsViewed?: boolean;
    // Plant-related
    plantStage?: number;
    // Economy-related
    pointsEarned?: boolean;
    pointsSpent?: boolean;
    pointsBalance?: number;
    itemsUnlocked?: number;
    // Time and context
    currentHour?: number;
    ambientMode?: string;
    isReturningAfterBreak?: boolean;
    currentSeason?: 'spring' | 'summer' | 'autumn' | 'winter';
  }) => {
    if (!user) return;

    const hour = context.currentHour ?? new Date().getHours();
    const month = new Date().getMonth();

    // === WIDGETS ACHIEVEMENT ===
    if (context.widgetsViewed) {
      await earnAchievement('cozy_companion_nearby');
    }
    
    // === SECRET ACHIEVEMENTS ===
    
    // Midnight Calm: Complete habit between midnight and 5am
    if (hour >= 0 && hour < 5 && context.habitCompleted) {
      await earnAchievement('midnight_calm');
    }
    
    // Early Light: Complete habit between 5am and 9am
    if (hour >= 5 && hour < 9 && context.habitCompleted) {
      await earnAchievement('early_light');
    }

    // Rainy Day: Complete habit while rain ambient is on
    if (context.ambientMode === 'rain' && context.habitCompleted) {
      await earnAchievement('rainy_day');
    }
    
    // Quiet Return: Return after a break
    if (context.isReturningAfterBreak) {
      await earnAchievement('quiet_return');
    }

    // === GENTLE PROGRESS ===
    
    // First Step: First habit ever completed
    if (context.habitCompleted) {
      await earnAchievement('first_step');
    }
    
    // Back Again: Returned and completed a habit (implied by isReturningAfterBreak + completion)
    if (context.isReturningAfterBreak && context.habitCompleted) {
      await earnAchievement('back_again');
    }

    // Slow & Steady: 5 total habits completed
    if (context.totalHabitsCompleted && context.totalHabitsCompleted >= 5) {
      await earnAchievement('slow_steady');
    }
    
    // Still Trying: 10 total habits completed
    if (context.totalHabitsCompleted && context.totalHabitsCompleted >= 10) {
      await earnAchievement('still_trying');
    }

    // One Thing Counts: At least one habit for 7 different days
    if (context.daysWithHabits && context.daysWithHabits >= 7) {
      await earnAchievement('one_thing_counts');
    }

    // === STREAK ACHIEVEMENTS ===
    
    if (context.habitStreak) {
      if (context.habitStreak >= 3) await earnAchievement('on_fire');
      if (context.habitStreak >= 7) await earnAchievement('week_warrior');
      if (context.habitStreak >= 14) await earnAchievement('fortnight_fighter');
      if (context.habitStreak >= 30) await earnAchievement('monthly_master');
      if (context.habitStreak >= 100) await earnAchievement('century_club');
    }

    // === REFLECTION ACHIEVEMENTS ===
    
    if (context.journalEntry) {
      await earnAchievement('quiet_moment');
    }

    if (context.moodLogged) {
      await earnAchievement('checking_in');
    }

    if (context.stressLogged) {
      await earnAchievement('deep_breath');
    }

    if (context.journalCount && context.journalCount >= 5) {
      await earnAchievement('self_aware');
    }

    // === AI ACHIEVEMENTS ===
    
    if (context.aiUsed) {
      await earnAchievement('first_insight');
      await earnAchievement('thoughtful_pause');
    }

    if (context.aiReflectionCount && context.aiReflectionCount >= 5) {
      await earnAchievement('guided_growth');
    }

    if (context.habitSoftened) {
      await earnAchievement('reflect_refine');
    }

    if (context.aiReflectionCount && context.aiReflectionCount >= 10) {
      await earnAchievement('companion_mind');
    }

    // === COMPANION ACHIEVEMENTS ===
    
    if (context.rewardsVisited) {
      await earnAchievement('new_friend');
    }

    if (context.costumeEquipped) {
      await earnAchievement('dressed_day');
    }

    if (context.catInteractions && context.catInteractions >= 20) {
      await earnAchievement('well_loved');
    }

    if (context.catInteractions && context.catInteractions >= 50) {
      await earnAchievement('cozy_companion');
    }

    if (context.catInteractions && context.catInteractions >= 100) {
      await earnAchievement('little_ritual');
    }

    // === PLANT ACHIEVEMENTS ===
    
    if (context.plantStage) {
      if (context.plantStage >= 1) await earnAchievement('sprout');
      if (context.plantStage >= 2) await earnAchievement('taking_root');
      if (context.plantStage >= 3) await earnAchievement('in_bloom');
      if (context.plantStage >= 4) await earnAchievement('garden_keeper');
      if (context.plantStage >= 5) await earnAchievement('flourishing');
    }

    // === ECONOMY ACHIEVEMENTS ===
    
    if (context.pointsEarned) {
      await earnAchievement('first_rewards');
    }

    if (context.pointsBalance && context.pointsBalance >= 100) {
      await earnAchievement('saver');
    }

    if (context.pointsSpent) {
      await earnAchievement('treat_yourself');
    }

    if (context.itemsUnlocked && context.itemsUnlocked >= 3) {
      await earnAchievement('collector');
    }

    if (context.itemsUnlocked && context.itemsUnlocked >= 5 && context.pointsBalance && context.pointsBalance >= 50) {
      await earnAchievement('careful_planner');
    }

    // === SEASONAL ACHIEVEMENTS ===
    
    // Determine current season
    const season = context.currentSeason || (() => {
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'autumn';
      return 'winter';
    })();

    // Award seasonal achievement if completing habits during that season
    if (context.habitCompleted) {
      if (season === 'spring') await earnAchievement('spring_bloom');
      if (season === 'summer') await earnAchievement('summer_glow');
      if (season === 'autumn') await earnAchievement('autumn_calm');
      if (season === 'winter') await earnAchievement('winter_cozy');
    }

    // New Year achievement (January)
    if (month === 0 && context.habitCompleted) {
      await earnAchievement('new_beginnings');
    }

    // End of year achievement (December)
    if (month === 11 && context.habitCompleted) {
      await earnAchievement('cozy_countdown');
    }

  }, [user, earnAchievement]);

  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, ach) => {
    if (!acc[ach.category]) {
      acc[ach.category] = [];
    }
    acc[ach.category].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  // Sort categories by predefined order
  const sortedCategories = CATEGORY_ORDER.filter(cat => achievementsByCategory[cat]);

  const totalAchievements = achievements.filter(a => !a.is_hidden).length;
  const earnedCount = achievements.filter(a => !a.is_hidden && earnedAchievements.has(a.id)).length;
  const totalPoints = achievements
    .filter(a => earnedAchievements.has(a.id))
    .reduce((sum, a) => sum + (a.points_reward || 0), 0);

  return {
    achievements,
    achievementsByCategory,
    sortedCategories,
    earnedAchievements,
    loading,
    earnAchievement,
    checkAndAwardAchievements,
    totalAchievements,
    earnedCount,
    totalPoints,
    CATEGORY_LABELS,
    refresh: fetchAchievements,
  };
}
