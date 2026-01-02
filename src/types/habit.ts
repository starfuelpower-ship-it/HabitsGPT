// ============================================
// HABIT TYPES - Daily Reset App
// ============================================
// Customize: Add new categories by extending HabitCategory
// Customize: Add new icons to HABIT_ICONS array

export type Category = 'Health' | 'Productivity' | 'Fitness' | 'Mindset' | 'Custom';
export type HabitCategory = 'Health' | 'Work' | 'Mind' | 'Social' | 'Custom';

export interface Habit {
  id: string;
  name: string;
  category: Category;
  notes: string;
  completedToday: boolean;
  streak: number;
  lastCompletedDate: string | null;
  createdAt: string;
  // New fields for cloud habits
  user_id?: string;
  icon?: string;
  archived?: boolean;
  created_at?: string;
  color?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  completed: boolean;
  created_at: string;
}

export interface Mood {
  id: string;
  user_id: string;
  date: string;
  mood_score: number;
  note?: string;
  created_at: string;
}

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
}

export interface UserProfile {
  id: string;
  user_id?: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  premium_expires_at?: string;
  created_at: string;
}

// ============================================
// CUSTOMIZATION CONSTANTS
// ============================================

// Available habit icons - Add more emojis as needed
export const HABIT_ICONS = [
  '✅', '💪', '🏃', '🧘', '📚', '💧', '🥗', '😴',
  '🎯', '💼', '✍️', '🎨', '🎵', '🧠', '❤️', '🌟',
  '☀️', '🌙', '🍎', '🥤', '💊', '🚶', '🚴', '🏋️',
  '🧘‍♀️', '🧹', '📝', '💰', '📱', '🎮', '👨‍👩‍👧', '🙏'
];

// Category configuration with colors and icons
export const CATEGORY_CONFIG: Record<HabitCategory, { color: string; icon: string; label: string }> = {
  Health: { color: 'hsl(150, 60%, 55%)', icon: '❤️', label: 'Health' },
  Work: { color: 'hsl(220, 70%, 60%)', icon: '💼', label: 'Work' },
  Mind: { color: 'hsl(280, 60%, 65%)', icon: '🧠', label: 'Mind' },
  Social: { color: 'hsl(35, 90%, 60%)', icon: '👥', label: 'Social' },
  Custom: { color: 'hsl(350, 70%, 65%)', icon: '⭐', label: 'Custom' },
};

// Old category config for backward compatibility
export const OLD_CATEGORY_CONFIG: Record<Category, { color: string; icon: string }> = {
  Health: { color: 'hsl(145, 50%, 45%)', icon: '❤️' },
  Productivity: { color: 'hsl(220, 60%, 55%)', icon: '💼' },
  Fitness: { color: 'hsl(25, 80%, 55%)', icon: '💪' },
  Mindset: { color: 'hsl(280, 45%, 55%)', icon: '🧠' },
  Custom: { color: 'hsl(190, 50%, 50%)', icon: '⭐' },
};

// ============================================
// PREMIUM LIMITS
// ============================================
// Customize: Change these values to adjust free tier limits

export const FREE_TIER_LIMITS = {
  maxHabits: 3,
  statsHistoryDays: 7,
  groupsReadOnly: true,
};

// Mood options
export const MOOD_OPTIONS = [
  { score: 1, emoji: '😢', label: 'Terrible' },
  { score: 2, emoji: '😕', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
];
