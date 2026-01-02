-- Add optional duration/intention fields to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS intention_duration TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS intention_start_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS intention_ended BOOLEAN DEFAULT FALSE;

-- Add comment explaining the duration options
COMMENT ON COLUMN public.habits.intention_duration IS 'Optional: today, few_days, week, month, or ongoing (null means ongoing)';
COMMENT ON COLUMN public.habits.intention_start_date IS 'When the intention period started';
COMMENT ON COLUMN public.habits.intention_ended IS 'Whether user has acknowledged the intention completion';