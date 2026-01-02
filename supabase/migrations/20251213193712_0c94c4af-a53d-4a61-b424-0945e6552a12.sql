-- Remove the UPDATE policy from user_points to prevent direct manipulation
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;

-- Create secure function to award points (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.award_points(
  _amount integer,
  _type text,
  _description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _current_balance integer;
  _new_balance integer;
  _new_total integer;
BEGIN
  -- Get the authenticated user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate amount (must be positive and reasonable)
  IF _amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  IF _amount > 1000 THEN
    RETURN json_build_object('success', false, 'error', 'Amount too large');
  END IF;
  
  -- Validate type
  IF _type NOT IN ('habit_complete', 'streak_bonus', 'daily_bonus', 'weekly_bonus', 'all_habits_complete', 'purchase_bundle') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid point type');
  END IF;
  
  -- Get current balance
  SELECT balance INTO _current_balance
  FROM public.user_points
  WHERE user_id = _user_id;
  
  -- If no record exists, create one
  IF _current_balance IS NULL THEN
    INSERT INTO public.user_points (user_id, balance, total_earned)
    VALUES (_user_id, 0, 0);
    _current_balance := 0;
  END IF;
  
  _new_balance := _current_balance + _amount;
  
  -- Update points
  UPDATE public.user_points
  SET 
    balance = _new_balance,
    total_earned = total_earned + _amount,
    updated_at = now()
  WHERE user_id = _user_id
  RETURNING balance, total_earned INTO _new_balance, _new_total;
  
  -- Log transaction
  INSERT INTO public.point_transactions (user_id, amount, type, description)
  VALUES (_user_id, _amount, _type, _description);
  
  RETURN json_build_object(
    'success', true, 
    'balance', _new_balance, 
    'total_earned', _new_total,
    'amount_awarded', _amount
  );
END;
$$;

-- Create secure function to spend points
CREATE OR REPLACE FUNCTION public.spend_points(
  _amount integer,
  _description text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _current_balance integer;
  _new_balance integer;
BEGIN
  -- Get the authenticated user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate amount
  IF _amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Get current balance
  SELECT balance INTO _current_balance
  FROM public.user_points
  WHERE user_id = _user_id;
  
  IF _current_balance IS NULL OR _current_balance < _amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  _new_balance := _current_balance - _amount;
  
  -- Update balance
  UPDATE public.user_points
  SET 
    balance = _new_balance,
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- Log transaction
  INSERT INTO public.point_transactions (user_id, amount, type, description)
  VALUES (_user_id, -_amount, 'purchase', _description);
  
  RETURN json_build_object(
    'success', true, 
    'balance', _new_balance,
    'amount_spent', _amount
  );
END;
$$;

-- Create secure function to claim daily bonus
CREATE OR REPLACE FUNCTION public.claim_daily_bonus()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _today date;
  _last_bonus date;
  _bonus_amount integer := 5;
BEGIN
  _user_id := auth.uid();
  _today := CURRENT_DATE;
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get last daily bonus date
  SELECT last_daily_bonus INTO _last_bonus
  FROM public.user_points
  WHERE user_id = _user_id;
  
  -- Check if already claimed today
  IF _last_bonus IS NOT NULL AND _last_bonus = _today THEN
    RETURN json_build_object('success', false, 'error', 'Already claimed today', 'already_claimed', true);
  END IF;
  
  -- Update last_daily_bonus and award points
  UPDATE public.user_points
  SET 
    last_daily_bonus = _today,
    balance = balance + _bonus_amount,
    total_earned = total_earned + _bonus_amount,
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- If no row updated, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_points (user_id, balance, total_earned, last_daily_bonus)
    VALUES (_user_id, _bonus_amount, _bonus_amount, _today);
  END IF;
  
  -- Log transaction
  INSERT INTO public.point_transactions (user_id, amount, type, description)
  VALUES (_user_id, _bonus_amount, 'daily_bonus', 'Daily check-in bonus');
  
  RETURN json_build_object(
    'success', true,
    'amount', _bonus_amount
  );
END;
$$;

-- Create secure function to claim weekly bonus
CREATE OR REPLACE FUNCTION public.claim_weekly_bonus()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _today date;
  _day_of_week integer;
  _week_start date;
  _last_bonus date;
  _bonus_amount integer := 50;
BEGIN
  _user_id := auth.uid();
  _today := CURRENT_DATE;
  _day_of_week := EXTRACT(DOW FROM _today)::integer;
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Only allow on Sunday (0) or Monday (1)
  IF _day_of_week NOT IN (0, 1) THEN
    RETURN json_build_object('success', false, 'error', 'Weekly bonus only available on Sunday or Monday');
  END IF;
  
  -- Calculate week start (Sunday)
  _week_start := _today - _day_of_week;
  
  -- Get last weekly bonus date
  SELECT last_weekly_bonus INTO _last_bonus
  FROM public.user_points
  WHERE user_id = _user_id;
  
  -- Check if already claimed this week
  IF _last_bonus IS NOT NULL AND _last_bonus >= _week_start THEN
    RETURN json_build_object('success', false, 'error', 'Already claimed this week', 'already_claimed', true);
  END IF;
  
  -- Update last_weekly_bonus and award points
  UPDATE public.user_points
  SET 
    last_weekly_bonus = _week_start,
    balance = balance + _bonus_amount,
    total_earned = total_earned + _bonus_amount,
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- If no row updated, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_points (user_id, balance, total_earned, last_weekly_bonus)
    VALUES (_user_id, _bonus_amount, _bonus_amount, _week_start);
  END IF;
  
  -- Log transaction
  INSERT INTO public.point_transactions (user_id, amount, type, description)
  VALUES (_user_id, _bonus_amount, 'weekly_bonus', 'Weekly dedication bonus');
  
  RETURN json_build_object(
    'success', true,
    'amount', _bonus_amount
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.award_points(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_points(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_bonus() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_weekly_bonus() TO authenticated;