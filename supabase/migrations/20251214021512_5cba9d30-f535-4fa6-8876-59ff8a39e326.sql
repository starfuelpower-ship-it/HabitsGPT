-- Create secure RPC function for adding group XP
CREATE OR REPLACE FUNCTION public.add_group_xp(
  _group_id UUID,
  _xp_amount INTEGER
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _current_level INTEGER;
  _new_xp INTEGER;
  _new_level INTEGER;
  _leveled_up BOOLEAN := false;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Verify user is group member
  IF NOT is_group_member(_user_id, _group_id) THEN
    RETURN json_build_object('success', false, 'error', 'Not a group member');
  END IF;
  
  -- Validate XP amount (reasonable limits per action: 1-50)
  IF _xp_amount <= 0 OR _xp_amount > 50 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid XP amount');
  END IF;
  
  -- Get current level before update
  SELECT level INTO _current_level FROM groups WHERE id = _group_id;
  
  -- Server-side XP calculation and update
  UPDATE groups
  SET 
    total_xp = COALESCE(total_xp, 0) + _xp_amount,
    level = FLOOR((COALESCE(total_xp, 0) + _xp_amount) / 500) + 1
  WHERE id = _group_id
  RETURNING total_xp, level INTO _new_xp, _new_level;
  
  -- Check for level up
  IF _new_level > COALESCE(_current_level, 1) THEN
    _leveled_up := true;
    -- Insert level up achievement
    INSERT INTO group_achievements (group_id, achievement_type, title, description)
    VALUES (_group_id, 'level_up', 'Level ' || _new_level || ' Reached!', 'The group has reached level ' || _new_level);
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'total_xp', _new_xp,
    'level', _new_level,
    'leveled_up', _leveled_up
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_group_xp(UUID, INTEGER) TO authenticated;

-- Add constraints to ensure data integrity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'groups_xp_positive'
  ) THEN
    ALTER TABLE groups ADD CONSTRAINT groups_xp_positive CHECK (total_xp >= 0);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'groups_level_valid'
  ) THEN
    ALTER TABLE groups ADD CONSTRAINT groups_level_valid CHECK (level >= 1);
  END IF;
END $$;