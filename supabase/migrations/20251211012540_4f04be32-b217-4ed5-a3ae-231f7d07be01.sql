-- Add companion settings to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS show_companion boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS companion_type text DEFAULT 'cat';