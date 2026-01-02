-- Add last_xp_contribution column to group_members for rate limiting
ALTER TABLE public.group_members 
ADD COLUMN IF NOT EXISTS last_xp_contribution timestamp with time zone DEFAULT NULL;

-- Update add_group_xp function with rate limiting
CREATE OR REPLACE FUNCTION public.add_group_xp(_group_id uuid, _xp_amount integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _current_level INTEGER;
  _new_xp INTEGER;
  _new_level INTEGER;
  _leveled_up BOOLEAN := false;
  _last_contribution timestamp with time zone;
  _cooldown_seconds INTEGER := 5; -- 5 second cooldown between XP contributions
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
  
  -- Check rate limiting: get last contribution time
  SELECT last_xp_contribution INTO _last_contribution
  FROM group_members
  WHERE user_id = _user_id AND group_id = _group_id;
  
  -- Enforce cooldown period to prevent rapid concurrent requests
  IF _last_contribution IS NOT NULL AND 
     _last_contribution > (now() - (_cooldown_seconds || ' seconds')::interval) THEN
    RETURN json_build_object('success', false, 'error', 'Please wait before contributing more XP');
  END IF;
  
  -- Update the last contribution timestamp for rate limiting
  UPDATE group_members
  SET last_xp_contribution = now()
  WHERE user_id = _user_id AND group_id = _group_id;
  
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
$function$;