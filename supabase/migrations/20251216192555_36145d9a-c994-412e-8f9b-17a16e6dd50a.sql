-- Create group_milestone_definitions table for milestone types
CREATE TABLE public.group_milestone_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'progress',
  icon text NOT NULL DEFAULT '🌟',
  is_seasonal boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create group_milestones table for earned milestones
CREATE TABLE public.group_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  milestone_key text NOT NULL,
  achieved_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_id, milestone_key)
);

-- Enable RLS
ALTER TABLE public.group_milestone_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_milestones ENABLE ROW LEVEL SECURITY;

-- Anyone can view milestone definitions
CREATE POLICY "Anyone can view milestone definitions"
ON public.group_milestone_definitions FOR SELECT
USING (true);

-- Group members can view their group's milestones
CREATE POLICY "Members can view group milestones"
ON public.group_milestones FOR SELECT
USING (is_group_member(auth.uid(), group_id));

-- Insert milestone definitions
INSERT INTO public.group_milestone_definitions (key, name, description, category, icon, is_seasonal, sort_order) VALUES
-- Gentle Group Progress
('first_steps_together', 'First Steps Together', 'Every group member completed at least one habit', 'progress', '👣', false, 1),
('seven_calm_days', 'Seven Calm Days', 'The group completed habits across 7 different days', 'progress', '🌿', false, 2),
('still_here', 'Still Here', 'The group remained active for 14 days', 'progress', '🏡', false, 3),

-- Supportive Moments
('quiet_support', 'Quiet Support', 'Someone completed a habit when another member needed encouragement', 'supportive', '💫', false, 4),
('gentle_return', 'Gentle Return', 'A member returned after time away while others kept the warmth', 'supportive', '🌅', false, 5),

-- Reflection & Presence
('shared_reflection', 'Shared Reflection', 'Group members created journal entries on different days', 'reflection', '📖', false, 6),
('calm_check_ins', 'Calm Check-Ins', 'The group logged moods across multiple days', 'reflection', '☁️', false, 7),

-- Seasonal (Optional)
('winter_together', 'Winter Together', 'The group stayed cozy through winter', 'seasonal', '❄️', true, 8),
('spring_reset', 'Spring Reset', 'The group blossomed together in spring', 'seasonal', '🌸', true, 9),
('summer_ease', 'Summer Ease', 'The group relaxed through summer', 'seasonal', '☀️', true, 10),
('autumn_calm', 'Autumn Calm', 'The group found peace in autumn', 'seasonal', '🍂', true, 11);

-- Function to award a group milestone
CREATE OR REPLACE FUNCTION public.award_group_milestone(_group_id uuid, _milestone_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _milestone_exists boolean;
  _already_earned boolean;
  _milestone_name text;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Verify user is group member
  IF NOT is_group_member(_user_id, _group_id) THEN
    RETURN json_build_object('success', false, 'error', 'Not a group member');
  END IF;
  
  -- Check if milestone definition exists
  SELECT EXISTS(SELECT 1 FROM group_milestone_definitions WHERE key = _milestone_key) INTO _milestone_exists;
  IF NOT _milestone_exists THEN
    RETURN json_build_object('success', false, 'error', 'Milestone not found');
  END IF;
  
  -- Check if already earned
  SELECT EXISTS(SELECT 1 FROM group_milestones WHERE group_id = _group_id AND milestone_key = _milestone_key) INTO _already_earned;
  IF _already_earned THEN
    RETURN json_build_object('success', false, 'error', 'Already earned', 'already_earned', true);
  END IF;
  
  -- Get milestone name
  SELECT name INTO _milestone_name FROM group_milestone_definitions WHERE key = _milestone_key;
  
  -- Award milestone
  INSERT INTO group_milestones (group_id, milestone_key) VALUES (_group_id, _milestone_key);
  
  RETURN json_build_object(
    'success', true,
    'milestone_name', _milestone_name
  );
END;
$$;