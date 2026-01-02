-- Add music settings columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS music_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS music_volume integer DEFAULT 30;