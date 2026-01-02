-- Add display_name and avatar_url to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add icon and archived to habits, remove old tracking columns
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS icon text DEFAULT '✅',
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

-- We'll keep the existing columns for backward compatibility but won't use them
-- The streak will be computed from habit_logs

-- Add completed column to habit_completions (we'll use this as habit_logs)
ALTER TABLE public.habit_completions
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;

-- Create moods table
CREATE TABLE IF NOT EXISTS public.moods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  note text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own moods" ON public.moods
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own moods" ON public.moods
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moods" ON public.moods
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moods" ON public.moods
FOR DELETE USING (auth.uid() = user_id);

-- Create user_settings table for app preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  theme text DEFAULT 'system',
  start_of_week text DEFAULT 'monday',
  daily_reset_time time DEFAULT '00:00',
  confetti_enabled boolean DEFAULT true,
  done_habit_position text DEFAULT 'keep',
  daily_notification boolean DEFAULT false,
  vacation_mode boolean DEFAULT false,
  sound_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.user_settings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger for updated_at on user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();