import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Habit, HabitLog, Category, FREE_TIER_LIMITS } from '@/types/habit';
import { toast } from 'sonner';
import { format, subDays, parseISO } from 'date-fns';

export function useHabitData() {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setHabits(data?.map(h => ({
        id: h.id,
        name: h.name,
        category: h.category as Category,
        notes: h.notes || '',
        completedToday: h.completed_today || false,
        streak: h.streak || 0,
        lastCompletedDate: h.last_completed_date,
        createdAt: h.created_at || new Date().toISOString(),
        user_id: h.user_id,
        icon: h.icon || '✅',
        archived: h.archived || false,
        created_at: h.created_at,
        color: h.color,
      })) || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast.error('Failed to load habits');
    }
  }, [user]);

  // Fetch logs for a date range
  const fetchLogs = useCallback(async (startDate: Date, endDate: Date) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', format(startDate, 'yyyy-MM-dd'))
        .lte('completed_at', format(endDate, 'yyyy-MM-dd'));

      if (error) throw error;
      
      setLogs(data?.map(l => ({
        id: l.id,
        habit_id: l.habit_id,
        user_id: l.user_id,
        completed_at: l.completed_at,
        completed: l.completed ?? true,
        created_at: l.created_at || new Date().toISOString(),
      })) || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [user]);

  // Add a new habit
  const addHabit = async (
    name: string,
    category: Category,
    icon: string = '✅',
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    // Check premium limit
    if (!isPremium && habits.length >= FREE_TIER_LIMITS.maxHabits) {
      toast.error(`Free users can only have ${FREE_TIER_LIMITS.maxHabits} active habits. Upgrade to Premium for unlimited habits!`);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name,
          category,
          icon,
          notes,
          archived: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial log entry for today
      const today = format(new Date(), 'yyyy-MM-dd');
      await supabase
        .from('habit_completions')
        .insert({
          habit_id: data.id,
          user_id: user.id,
          completed_at: today,
          completed: false,
        });

      setHabits(prev => [...prev, {
        id: data.id,
        name: data.name,
        category: data.category as Category,
        notes: data.notes || '',
        completedToday: false,
        streak: 0,
        lastCompletedDate: null,
        createdAt: data.created_at || new Date().toISOString(),
        user_id: data.user_id,
        icon: data.icon || '✅',
        archived: data.archived || false,
        created_at: data.created_at,
        color: data.color,
      }]);
      
      toast.success('Habit created!');
      return true;
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Failed to create habit');
      return false;
    }
  };

  // Update a habit
  const updateHabit = async (
    habitId: string,
    updates: Partial<Pick<Habit, 'name' | 'category' | 'icon' | 'notes'>>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.icon) dbUpdates.icon = updates.icon;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('habits')
        .update(dbUpdates)
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, ...updates } : h
      ));
      
      toast.success('Habit updated!');
      return true;
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error('Failed to update habit');
      return false;
    }
  };

  // Archive a habit
  const archiveHabit = async (habitId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('habits')
        .update({ archived: true })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.filter(h => h.id !== habitId));
      toast.success('Habit archived');
      return true;
    } catch (error) {
      console.error('Error archiving habit:', error);
      toast.error('Failed to archive habit');
      return false;
    }
  };

  // Delete a habit permanently
  const deleteHabit = async (habitId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Delete logs first
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.filter(h => h.id !== habitId));
      toast.success('Habit deleted');
      return true;
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
      return false;
    }
  };

  // Toggle habit completion for a specific date
  const toggleHabitCompletion = async (
    habitId: string,
    date: string,
    completed: boolean
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if log exists for this date
      const { data: existingLog } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('completed_at', date)
        .maybeSingle();

      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from('habit_completions')
          .update({ completed })
          .eq('id', existingLog.id);

        if (error) throw error;
      } else {
        // Create new log
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            completed_at: date,
            completed,
          });

        if (error) throw error;
      }

      // Update local state
      setLogs(prev => {
        const existing = prev.find(l => l.habit_id === habitId && l.completed_at === date);
        if (existing) {
          return prev.map(l => 
            l.habit_id === habitId && l.completed_at === date
              ? { ...l, completed }
              : l
          );
        }
        return [...prev, {
          id: crypto.randomUUID(),
          habit_id: habitId,
          user_id: user.id,
          completed_at: date,
          completed,
          created_at: new Date().toISOString(),
        }];
      });

      return true;
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast.error('Failed to update habit');
      return false;
    }
  };

  // Calculate streak for a habit
  const calculateStreak = useCallback((habitId: string, allLogs: HabitLog[]): number => {
    const habitLogs = allLogs
      .filter(l => l.habit_id === habitId && l.completed)
      .map(l => l.completed_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (habitLogs.length === 0) return 0;

    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Check if there's a completion today or yesterday (streak continues)
    if (habitLogs[0] !== today && habitLogs[0] !== yesterday) {
      return 0;
    }

    // Count consecutive days
    let currentDate = habitLogs[0];
    for (const logDate of habitLogs) {
      if (logDate === currentDate) {
        streak++;
        currentDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
      } else {
        break;
      }
    }

    return streak;
  }, []);

  // Get completion status for a habit on a specific date
  const getCompletionStatus = useCallback((habitId: string, date: string): boolean => {
    return logs.some(l => l.habit_id === habitId && l.completed_at === date && l.completed);
  }, [logs]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchHabits(),
        fetchLogs(subDays(new Date(), 365), new Date()),
      ]).finally(() => setLoading(false));
    } else {
      setHabits([]);
      setLogs([]);
      setLoading(false);
    }
  }, [user, fetchHabits, fetchLogs]);

  return {
    habits,
    logs,
    loading,
    addHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    toggleHabitCompletion,
    calculateStreak,
    getCompletionStatus,
    refreshHabits: fetchHabits,
    refreshLogs: fetchLogs,
  };
}
