-- Create secure purchase_costume function with atomic validation
CREATE OR REPLACE FUNCTION public.purchase_costume(_costume_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id UUID;
  _is_premium BOOLEAN;
  _balance INTEGER;
  _price INTEGER;
  _is_premium_only BOOLEAN;
  _costume_name TEXT;
  _new_balance INTEGER;
BEGIN
  -- Get authenticated user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get costume details (validate costume exists)
  SELECT price, is_premium_only, name INTO _price, _is_premium_only, _costume_name
  FROM cat_costumes 
  WHERE id = _costume_id;
  
  IF _price IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Costume not found');
  END IF;
  
  -- Check if already owned (prevent duplicate purchases)
  IF EXISTS (SELECT 1 FROM user_costumes WHERE user_id = _user_id AND costume_id = _costume_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already owned');
  END IF;
  
  -- Lock user_points row to prevent race conditions
  SELECT balance INTO _balance 
  FROM user_points 
  WHERE user_id = _user_id 
  FOR UPDATE;
  
  -- If no points record exists, create one with 0 balance
  IF _balance IS NULL THEN
    INSERT INTO user_points (user_id, balance, total_earned)
    VALUES (_user_id, 0, 0);
    _balance := 0;
  END IF;
  
  -- For premium-only costumes, verify premium status
  IF _is_premium_only THEN
    SELECT is_premium INTO _is_premium 
    FROM profiles 
    WHERE id = _user_id;
    
    IF NOT COALESCE(_is_premium, false) THEN
      RETURN json_build_object('success', false, 'error', 'Premium required');
    END IF;
  END IF;
  
  -- Verify sufficient balance
  IF _balance < _price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points atomically
  _new_balance := _balance - _price;
  UPDATE user_points 
  SET balance = _new_balance, updated_at = now()
  WHERE user_id = _user_id;
  
  -- Grant costume
  INSERT INTO user_costumes (user_id, costume_id) 
  VALUES (_user_id, _costume_id);
  
  -- Log transaction
  INSERT INTO point_transactions (user_id, amount, type, description)
  VALUES (_user_id, -_price, 'purchase', 'Purchased ' || _costume_name);
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', _new_balance,
    'costume_name', _costume_name
  );
END;
$$;