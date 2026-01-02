import { useState, useEffect } from 'react';
import { Habit, Category } from '@/types/habit';

const STORAGE_KEY = 'daily-reset-habits';
const LAST_RESET_KEY = 'daily-reset-last-date';

const generateId = () => Math.random().toString(36).substring(2, 9);

const getTodayDate = () => new Date().toISOString().split('T')[0];

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load habits and check for midnight reset
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    const today = getTodayDate();

    let loadedHabits: Habit[] = stored ? JSON.parse(stored) : [];

    // Reset habits if it's a new day
    if (lastReset !== today) {
      loadedHabits = loadedHabits.map(habit => ({
        ...habit,
        completedToday: false,
      }));
      localStorage.setItem(LAST_RESET_KEY, today);
    }

    setHabits(loadedHabits);
    setIsLoading(false);
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoading]);

  const addHabit = (name: string, category: Category, notes: string) => {
    const newHabit: Habit = {
      id: generateId(),
      name,
      category,
      notes,
      completedToday: false,
      streak: 0,
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabit = (id: string) => {
    const today = getTodayDate();
    
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== id) return habit;

        const wasCompleted = habit.completedToday;
        const newCompleted = !wasCompleted;

        let newStreak = habit.streak;
        if (newCompleted && !wasCompleted) {
          // Marking as complete - increment streak
          newStreak = habit.streak + 1;
        } else if (!newCompleted && wasCompleted) {
          // Unmarking - decrement streak (but not below 0)
          newStreak = Math.max(0, habit.streak - 1);
        }

        return {
          ...habit,
          completedToday: newCompleted,
          streak: newStreak,
          lastCompletedDate: newCompleted ? today : habit.lastCompletedDate,
        };
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    habits,
    isLoading,
    addHabit,
    toggleHabit,
    deleteHabit,
    completedCount,
    totalCount,
    progressPercent,
  };
}
