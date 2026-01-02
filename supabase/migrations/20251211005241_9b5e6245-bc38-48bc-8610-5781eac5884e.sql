-- Add ambient atmosphere settings to user_settings
ALTER TABLE public.user_settings
ADD COLUMN ambient_mode TEXT DEFAULT 'sun_rays',
ADD COLUMN ambient_visuals_enabled BOOLEAN DEFAULT true,
ADD COLUMN ambient_sounds_enabled BOOLEAN DEFAULT false;