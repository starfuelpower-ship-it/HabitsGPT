import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type HabitDuration = 'today' | 'few_days' | 'week' | 'month' | 'ongoing' | null;

export interface CloudHabit {
  id: string;
  name: string;
  category: string;
  notes: string | null;
  color: string | null;
  icon: string | null;
  completed_today: boolean;
  streak: number;
  last_completed_date: string | null;
  last_reset_date: string | null;
  created_at: string;
  intention_duration: HabitDuration;
  intention_start_date: string | null;
  intention_ended: boolean;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

const VALID_DURATIONS = ['today', 'few_days', 'week', 'month', 'ongoing'] as const;

// Transform database habit to CloudHabit with proper types
const transformHabit = (habit: any): CloudHabit => ({
  ...habit,
  intention_duration: VALID_DURATIONS.includes(habit.intention_duration) 
    ? habit.intention_duration 
    : null,
});

export function useCloudHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<CloudHabit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const today = getTodayDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const habitsToUpdate: { id: string; streak: number }[] = [];
      
      const processedHabits = (data || []).map(habit => {
        // Check if habit needs midnight reset
        if (habit.last_reset_date !== today && habit.completed_today) {
          // Calculate if streak should break (missed yesterday)
          const streakBroken = habit.last_completed_date !== yesterdayStr && habit.last_completed_date !== today;
          const newStreak = streakBroken ? 0 : habit.streak;
          
          habitsToUpdate.push({ id: habit.id, streak: newStreak });
          return { ...habit, completed_today: false, last_reset_date: today, streak: newStreak };
        }
        // Check if streak should break even if not completed today
        if (habit.last_completed_date && habit.last_completed_date !== yesterdayStr && habit.last_completed_date !== today && habit.streak > 0) {
          habitsToUpdate.push({ id: habit.id, streak: 0 });
          return { ...habit, streak: 0, last_reset_date: today };
        }
        return habit;
      });

      // Batch update habits that need reset
      for (const update of habitsToUpdate) {
        await supabase
          .from('habits')
          .update({ completed_today: false, last_reset_date: today, streak: update.streak })
          .eq('id', update.id);
      }

      setHabits(processedHabits.map(transformHabit));
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (
    name: string, 
    category: string, 
    notes: string, 
    icon?: string, 
    color?: string,
    intentionDuration?: HabitDuration
  ) => {
    if (!user) return;

    try {
      const today = getTodayDate();
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name,
          category,
          notes: notes || null,
          icon: icon || 'check-circle',
          color: color || null,
          last_reset_date: today,
          intention_duration: intentionDuration || null,
          intention_start_date: intentionDuration && intentionDuration !== 'ongoing' ? today : null,
          intention_ended: false,
        })
        .select()
        .single();

      if (error) throw error;
      setHabits(prev => [...prev, transformHabit(data)]);
      toast.success('Habit added');
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Failed to add habit');
    }
  };

  const updateHabit = async (
    id: string, 
    updates: Partial<Pick<CloudHabit, 'name' | 'category' | 'notes' | 'color' | 'icon' | 'intention_duration' | 'intention_start_date' | 'intention_ended'>>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
      toast.success('Habit updated');
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error('Failed to update habit');
    }
  };

  // Check if habit's intention period has ended
  const checkIntentionComplete = (habit: CloudHabit): boolean => {
    if (!habit.intention_duration || habit.intention_duration === 'ongoing' || !habit.intention_start_date) {
      return false;
    }
    if (habit.intention_ended) return false; // Already acknowledged

    const startDate = new Date(habit.intention_start_date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (habit.intention_duration) {
      case 'today': return daysDiff >= 1;
      case 'few_days': return daysDiff >= 3;
      case 'week': return daysDiff >= 7;
      case 'month': return daysDiff >= 30;
      default: return false;
    }
  };

  // Handle intention completion actions
  const continueHabit = async (id: string) => {
    await updateHabit(id, { intention_duration: 'ongoing', intention_ended: true });
  };

  const letHabitRest = async (id: string) => {
    await updateHabit(id, { intention_ended: true });
  };

  const archiveHabit = async (id: string) => {
    if (!user) return;
    try {
      await supabase.rpc('archive_habit', { _habit_id: id });
      setHabits(prev => prev.filter(h => h.id !== id));
      toast.success('Habit archived');
    } catch (error) {
      console.error('Error archiving habit:', error);
      toast.error('Failed to archive habit');
    }
  };

  const calculateStreak = (habit: CloudHabit, completingToday: boolean): number => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (completingToday) {
      // If completing today, check if we completed yesterday to continue streak
      if (habit.last_completed_date === yesterdayStr) {
        return habit.streak + 1;
      }
      // Starting fresh streak
      return 1;
    } else {
      // Uncompleting - decrease streak but not below 0
      return Math.max(0, habit.streak - 1);
    }
  };

  const toggleHabit = async (id: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const today = getTodayDate();
    const wasCompleted = habit.completed_today;
    const newCompleted = !wasCompleted;
    
    const newStreak = calculateStreak(habit, newCompleted);

    // Optimistic update
    setHabits(prev => prev.map(h => 
      h.id === id 
        ? { ...h, completed_today: newCompleted, streak: newStreak, last_completed_date: newCompleted ? today : h.last_completed_date }
        : h
    ));

    try {
      const { error } = await supabase
        .from('habits')
        .update({
          completed_today: newCompleted,
          streak: newStreak,
          last_completed_date: newCompleted ? today : habit.last_completed_date,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Track completion for stats
      if (newCompleted) {
        await supabase
          .from('habit_completions')
          .insert({ habit_id: id, user_id: user.id, completed_at: today });
      } else {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', id)
          .eq('user_id', user.id)
          .eq('completed_at', today);
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      // Revert optimistic update
      setHabits(prev => prev.map(h => 
        h.id === id ? habit : h
      ));
      toast.error('Failed to update habit');
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;

    const habitToDelete = habits.find(h => h.id === id);
    
    // Optimistic update
    setHabits(prev => prev.filter(h => h.id !== id));

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Habit deleted');
    } catch (error) {
      console.error('Error deleting habit:', error);
      // Revert optimistic update
      if (habitToDelete) {
        setHabits(prev => [...prev, habitToDelete]);
      }
      toast.error('Failed to delete habit');
    }
  };

  const migrateLocalHabits = async (localHabits: Array<{
    name: string;
    category: string;
    notes: string;
    completedToday: boolean;
    streak: number;
  }>) => {
    if (!user || localHabits.length === 0) return;

    setIsSyncing(true);
    try {
      const today = getTodayDate();
      const habitsToInsert = localHabits.map(h => ({
        user_id: user.id,
        name: h.name,
        category: h.category,
        notes: h.notes || null,
        completed_today: h.completedToday,
        streak: h.streak,
        last_reset_date: today,
      }));

      const { data, error } = await supabase
        .from('habits')
        .insert(habitsToInsert)
        .select();

      if (error) throw error;
      
      setHabits(prev => [...prev, ...(data || []).map(transformHabit)]);
      toast.success(`Migrated ${localHabits.length} habits from local storage`);
      
      // Clear local storage after successful migration
      localStorage.removeItem('daily-reset-habits');
      localStorage.removeItem('daily-reset-last-date');
    } catch (error) {
      console.error('Error migrating habits:', error);
      toast.error('Failed to migrate local habits');
    } finally {
      setIsSyncing(false);
    }
  };

  const completedCount = habits.filter(h => h.completed_today).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    habits,
    isLoading,
    isSyncing,
    addHabit,
    updateHabit,
    toggleHabit,
    deleteHabit,
    migrateLocalHabits,
    refreshHabits: fetchHabits,
    completedCount,
    totalCount,
    progressPercent,
    checkIntentionComplete,
    continueHabit,
    letHabitRest,
    archiveHabit,
  };
}
