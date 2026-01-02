-- ==========================================
-- COZY COMPANION EXPANSION - Database Schema
-- ==========================================

-- 1. ACHIEVEMENTS SYSTEM
-- Soft, story-based achievements with gentle language
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general', -- habit, cat, plant, discovery, time
  icon text NOT NULL DEFAULT '✨',
  points_reward integer DEFAULT 0,
  is_hidden boolean DEFAULT false, -- Hidden achievements discovered naturally
  unlock_behavior text, -- Optional: cat behavior to unlock
  unlock_atmosphere text, -- Optional: atmosphere to unlock
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- User earned achievements
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Users can view own earned achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. USER ACTIVITY TRACKING (for cat memory, return bonuses, etc.)
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  first_open_at timestamp with time zone DEFAULT now(),
  last_open_at timestamp with time zone DEFAULT now(),
  total_app_opens integer DEFAULT 1,
  total_days_active integer DEFAULT 1,
  longest_break_days integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  morning_opens integer DEFAULT 0, -- 5am-10am
  evening_opens integer DEFAULT 0, -- 8pm-12am
  night_opens integer DEFAULT 0, -- 12am-5am
  preferred_time text, -- morning, afternoon, evening, night
  last_break_return_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own activity" ON public.user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activity" ON public.user_activity FOR UPDATE USING (auth.uid() = user_id);

-- 3. PLANT SEEDS SYSTEM (Enhanced)
-- Drop existing seeds table if exists and recreate with more fields
DROP TABLE IF EXISTS public.user_active_seed CASCADE;
DROP TABLE IF EXISTS public.user_seeds CASCADE;
DROP TABLE IF EXISTS public.plant_seeds CASCADE;

CREATE TABLE public.plant_seeds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🌱',
  preview_image text,
  price integer DEFAULT 0,
  is_starter boolean DEFAULT false, -- Available at start
  is_premium boolean DEFAULT false,
  rarity text DEFAULT 'common', -- common, uncommon, rare, legendary
  growth_style text DEFAULT 'classic', -- classic, whimsical, cozy, minimal
  color_palette text, -- JSON array of colors
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- User owned seeds
CREATE TABLE public.user_seeds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  seed_id uuid NOT NULL REFERENCES public.plant_seeds(id) ON DELETE CASCADE,
  obtained_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, seed_id)
);

-- Currently planted seed
CREATE TABLE public.user_planted_seed (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  seed_id uuid REFERENCES public.plant_seeds(id),
  planted_at timestamp with time zone DEFAULT now(),
  current_phase text DEFAULT 'seedling', -- seedling, rooting, growing, blooming, resting
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plant_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_planted_seed ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view seeds" ON public.plant_seeds FOR SELECT USING (true);
CREATE POLICY "Users can view own seeds" ON public.user_seeds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can purchase seeds" ON public.user_seeds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own planted seed" ON public.user_planted_seed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can plant seed" ON public.user_planted_seed FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update planted seed" ON public.user_planted_seed FOR UPDATE USING (auth.uid() = user_id);

-- 4. PLANT DECORATIONS SYSTEM (Enhanced)
DROP TABLE IF EXISTS public.user_decorations CASCADE;
DROP TABLE IF EXISTS public.plant_decorations CASCADE;

CREATE TABLE public.plant_decorations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🎀',
  category text NOT NULL DEFAULT 'charm', -- pot, charm, stone, ribbon, lantern, furniture
  price integer DEFAULT 50,
  is_premium boolean DEFAULT false,
  rarity text DEFAULT 'common',
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- User owned decorations
CREATE TABLE public.user_decorations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  decoration_id uuid NOT NULL REFERENCES public.plant_decorations(id) ON DELETE CASCADE,
  obtained_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT false, -- Currently displayed
  UNIQUE(user_id, decoration_id)
);

-- Enable RLS
ALTER TABLE public.plant_decorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_decorations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view decorations" ON public.plant_decorations FOR SELECT USING (true);
CREATE POLICY "Users can view own decorations" ON public.user_decorations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can purchase decorations" ON public.user_decorations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can toggle decoration active" ON public.user_decorations FOR UPDATE USING (auth.uid() = user_id);

-- 5. CAT GIFTS SYSTEM (rare surprises)
CREATE TABLE public.cat_gifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🎁',
  gift_type text NOT NULL DEFAULT 'charm', -- charm, decoration, seed, points, achievement
  reward_id uuid, -- FK to decoration/seed/achievement if applicable
  reward_points integer DEFAULT 0,
  rarity text DEFAULT 'rare', -- rare, very_rare, legendary
  created_at timestamp with time zone DEFAULT now()
);

-- User received gifts
CREATE TABLE public.user_cat_gifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  gift_id uuid NOT NULL REFERENCES public.cat_gifts(id) ON DELETE CASCADE,
  received_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cat_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cat_gifts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view gifts" ON public.cat_gifts FOR SELECT USING (true);
CREATE POLICY "Users can view own received gifts" ON public.user_cat_gifts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can receive gifts" ON public.user_cat_gifts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. DAILY COIN CAP - Update user_points table
ALTER TABLE public.user_points 
ADD COLUMN IF NOT EXISTS coins_earned_today integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_earn_reset_date date,
ADD COLUMN IF NOT EXISTS first_habit_bonus_claimed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lifetime_days_active integer DEFAULT 0;

-- 7. INSERT INITIAL DATA

-- Cozy Achievements (soft, moment-based)
INSERT INTO public.achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
-- Habit achievements
('first_cozy_day', 'First Cozy Day', 'Complete your very first habit. A gentle beginning.', 'habit', '🌸', 10, false, 1),
('week_in_bloom', 'A Week in Bloom', 'Keep a 7-day streak. Seven days of showing up.', 'habit', '🌷', 30, false, 2),
('quiet_consistency', 'Quiet Consistency', 'Complete habits on 14 different days. No pressure, just presence.', 'habit', '🍃', 50, false, 3),
('still_showing_up', 'Still Showing Up', 'Return after missing a few days. Coming back is what matters.', 'habit', '💫', 25, false, 4),
('gentle_reset', 'Gentle Reset', 'Start fresh after a break. Every new beginning counts.', 'habit', '🌅', 15, false, 5),
('slow_and_steady', 'Slow & Steady', 'Complete 50 total habits. Small steps, big journey.', 'habit', '🐢', 75, false, 6),
('you_came_back', 'You Came Back', 'Open the app after a week away. We missed you.', 'habit', '💝', 20, true, 7),
-- Cat relationship
('purrfect_start', 'Purrfect Start', 'Pet the cat for the first time. A new friendship begins.', 'cat', '🐱', 5, false, 10),
('they_missed_you', 'They Missed You', 'Return to find a very affectionate cat.', 'cat', '😻', 15, true, 11),
('cat_knows_routine', 'Cat Knows Your Routine', 'Complete the same habit 7 days in a row.', 'cat', '✨', 25, false, 12),
('morning_stretch', 'Morning Stretch', 'Open the app before 9am, 5 times.', 'cat', '☀️', 15, false, 13),
('nap_time', 'Nap Time', 'Open the app after 11pm, 3 times.', 'cat', '🌙', 10, true, 14),
('cat_gift_received', 'Surprise Gift', 'Receive your first gift from the cat.', 'cat', '🎁', 20, true, 15),
-- Plant story
('seed_planted', 'Seed Planted', 'Plant your first seed. A story begins.', 'plant', '🌱', 5, false, 20),
('first_bloom', 'First Bloom', 'Watch your plant bloom for the first time.', 'plant', '🌸', 30, false, 21),
('cozy_tree', 'Cozy Tree', 'Grow your plant to its fullest form.', 'plant', '🌳', 100, false, 22),
('plant_resting', 'Peaceful Rest', 'Let your plant rest. Growth comes in waves.', 'plant', '😴', 10, true, 23),
-- Discovery
('night_owl', 'Night Owl', 'Use the app 10 times after dark.', 'discovery', '🦉', 15, true, 30),
('early_bird', 'Early Bird', 'Use the app 10 times in the morning.', 'discovery', '🐦', 15, true, 31),
('atmosphere_explorer', 'Atmosphere Explorer', 'Try 3 different ambient modes.', 'discovery', '🎨', 10, false, 32),
('cozy_collector', 'Cozy Collector', 'Own 5 cat costumes.', 'discovery', '👗', 25, false, 33),
('seed_collector', 'Seed Collector', 'Collect 3 different seeds.', 'discovery', '🌰', 20, false, 34),
-- Long-term (milestone)
('two_weeks', 'Two Weeks of Care', '14 days of consistent check-ins.', 'time', '📅', 50, false, 40),
('one_month', 'One Month Together', '30 days since you started. Thank you for staying.', 'time', '🎂', 100, false, 41),
('three_months', 'Three Months of Growth', '90 days of gentle progress.', 'time', '🏆', 250, true, 42);

-- Starter Seeds
INSERT INTO public.plant_seeds (key, name, description, icon, is_starter, rarity, growth_style, sort_order) VALUES
('classic_sprout', 'Classic Sprout', 'A timeless green companion that grows with your habits.', '🌱', true, 'common', 'classic', 1),
('cozy_fern', 'Cozy Fern', 'Soft fronds that unfurl slowly, day by day.', '🌿', true, 'common', 'cozy', 2),
('gentle_flower', 'Gentle Flower', 'Blooms with quiet beauty over time.', '🌸', false, 'uncommon', 'whimsical', 3),
('moon_vine', 'Moon Vine', 'A mysterious plant that thrives in peaceful moments.', '🌙', false, 'rare', 'minimal', 4),
('sunshine_bloom', 'Sunshine Bloom', 'Radiates warmth as it grows.', '☀️', false, 'uncommon', 'whimsical', 5),
('winter_pine', 'Winter Pine', 'A resilient evergreen for cozy seasons.', '🌲', false, 'rare', 'classic', 6),
('cherry_blossom', 'Cherry Blossom', 'Delicate petals that drift gently.', '🌸', false, 'legendary', 'whimsical', 7);

-- Plant Decorations
INSERT INTO public.plant_decorations (key, name, description, icon, category, price, rarity, sort_order) VALUES
-- Pots
('terracotta_pot', 'Terracotta Pot', 'A warm, earthy home for your plant.', '🏺', 'pot', 50, 'common', 1),
('ceramic_white', 'White Ceramic', 'Clean and simple elegance.', '⚪', 'pot', 75, 'common', 2),
('mossy_stone', 'Mossy Stone Pot', 'Nature-wrapped and cozy.', '🪨', 'pot', 100, 'uncommon', 3),
-- Charms
('lucky_ribbon', 'Lucky Ribbon', 'A soft bow tied with care.', '🎀', 'charm', 30, 'common', 10),
('tiny_bell', 'Tiny Bell', 'Chimes softly in the breeze.', '🔔', 'charm', 40, 'common', 11),
('star_charm', 'Star Charm', 'Catches the light beautifully.', '⭐', 'charm', 60, 'uncommon', 12),
('moon_charm', 'Moon Charm', 'Glows gently at night.', '🌙', 'charm', 80, 'rare', 13),
-- Stones
('smooth_pebble', 'Smooth Pebble', 'A calming companion stone.', '🪨', 'stone', 25, 'common', 20),
('crystal_cluster', 'Crystal Cluster', 'Sparkles with soft energy.', '💎', 'stone', 100, 'rare', 21),
-- Lanterns
('paper_lantern', 'Paper Lantern', 'Soft warm glow.', '🏮', 'lantern', 75, 'uncommon', 30),
('firefly_jar', 'Firefly Jar', 'Gentle dancing lights.', '✨', 'lantern', 120, 'rare', 31),
-- Furniture
('tiny_bench', 'Tiny Bench', 'A peaceful place to rest.', '🪑', 'furniture', 60, 'common', 40),
('mini_swing', 'Mini Swing', 'Sways gently in the breeze.', '🎠', 'furniture', 90, 'uncommon', 41);

-- Cat Gifts (rare surprises)
INSERT INTO public.cat_gifts (key, name, description, icon, gift_type, reward_points, rarity) VALUES
('fallen_leaf', 'Fallen Leaf', 'The cat brought you a pretty leaf.', '🍂', 'points', 10, 'rare'),
('shiny_pebble', 'Shiny Pebble', 'A smooth stone found just for you.', '🪨', 'points', 15, 'rare'),
('soft_ribbon', 'Soft Ribbon', 'Where did they find this?', '🎀', 'decoration', 0, 'rare'),
('lucky_clover', 'Lucky Clover', 'A four-leaf clover! How special.', '🍀', 'points', 25, 'very_rare'),
('tiny_flower', 'Tiny Flower', 'A delicate gift from your friend.', '🌼', 'points', 20, 'rare'),
('golden_acorn', 'Golden Acorn', 'A treasure from the garden.', '🌰', 'points', 30, 'legendary');

-- 8. UPDATE award_points FUNCTION with daily cap
CREATE OR REPLACE FUNCTION public.award_points(_amount integer, _type text, _description text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _current_balance integer;
  _new_balance integer;
  _new_total integer;
  _coins_today integer;
  _last_reset date;
  _today date;
  _daily_cap integer := 100; -- Daily earning cap from habits
  _actual_amount integer;
  _cap_reached boolean := false;
BEGIN
  _user_id := auth.uid();
  _today := CURRENT_DATE;
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate amount
  IF _amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  IF _amount > 1000 THEN
    RETURN json_build_object('success', false, 'error', 'Amount too large');
  END IF;
  
  -- Validate type
  IF _type NOT IN ('habit_complete', 'streak_bonus', 'daily_bonus', 'weekly_bonus', 'all_habits_complete', 'purchase_bundle', 'achievement', 'gift') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid point type');
  END IF;
  
  -- Get current state
  SELECT balance, coins_earned_today, last_earn_reset_date 
  INTO _current_balance, _coins_today, _last_reset
  FROM public.user_points
  WHERE user_id = _user_id;
  
  -- If no record exists, create one
  IF _current_balance IS NULL THEN
    INSERT INTO public.user_points (user_id, balance, total_earned, coins_earned_today, last_earn_reset_date)
    VALUES (_user_id, 0, 0, 0, _today);
    _current_balance := 0;
    _coins_today := 0;
    _last_reset := _today;
  END IF;
  
  -- Reset daily counter if new day
  IF _last_reset IS NULL OR _last_reset < _today THEN
    _coins_today := 0;
    UPDATE public.user_points
    SET coins_earned_today = 0, last_earn_reset_date = _today, first_habit_bonus_claimed = false
    WHERE user_id = _user_id;
  END IF;
  
  -- Purchased coins, achievements, and gifts bypass daily cap
  IF _type IN ('purchase_bundle', 'achievement', 'gift') THEN
    _actual_amount := _amount;
  ELSE
    -- Apply daily cap for habit-related earnings
    IF _coins_today >= _daily_cap THEN
      _cap_reached := true;
      _actual_amount := 0;
    ELSIF _coins_today + _amount > _daily_cap THEN
      _actual_amount := _daily_cap - _coins_today;
      _cap_reached := true;
    ELSE
      _actual_amount := _amount;
    END IF;
  END IF;
  
  -- If no actual amount to award (cap reached), return early but mark success
  IF _actual_amount = 0 AND _cap_reached THEN
    RETURN json_build_object(
      'success', true, 
      'balance', _current_balance, 
      'amount_awarded', 0,
      'daily_cap_reached', true,
      'message', 'You have earned today''s cozy coin limit. Come back tomorrow for more 🌿'
    );
  END IF;
  
  _new_balance := _current_balance + _actual_amount;
  
  -- Update points
  UPDATE public.user_points
  SET 
    balance = _new_balance,
    total_earned = total_earned + _actual_amount,
    coins_earned_today = CASE WHEN _type NOT IN ('purchase_bundle', 'achievement', 'gift') THEN coins_earned_today + _actual_amount ELSE coins_earned_today END,
    updated_at = now()
  WHERE user_id = _user_id
  RETURNING balance, total_earned INTO _new_balance, _new_total;
  
  -- Log transaction (only if actual amount > 0)
  IF _actual_amount > 0 THEN
    INSERT INTO public.point_transactions (user_id, amount, type, description)
    VALUES (_user_id, _actual_amount, _type, _description);
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'balance', _new_balance, 
    'total_earned', _new_total,
    'amount_awarded', _actual_amount,
    'daily_cap_reached', _cap_reached
  );
END;
$$;

-- 9. Function to track user activity
CREATE OR REPLACE FUNCTION public.track_app_open()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _now timestamp with time zone;
  _today date;
  _hour integer;
  _last_open timestamp with time zone;
  _days_since_last integer;
  _is_return_after_break boolean := false;
  _activity_record record;
BEGIN
  _user_id := auth.uid();
  _now := now();
  _today := CURRENT_DATE;
  _hour := EXTRACT(HOUR FROM _now);
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get current activity record
  SELECT * INTO _activity_record FROM user_activity WHERE user_id = _user_id;
  
  IF _activity_record IS NULL THEN
    -- First time user
    INSERT INTO user_activity (
      user_id, first_open_at, last_open_at, total_app_opens, total_days_active,
      morning_opens, evening_opens, night_opens
    ) VALUES (
      _user_id, _now, _now, 1, 1,
      CASE WHEN _hour >= 5 AND _hour < 10 THEN 1 ELSE 0 END,
      CASE WHEN _hour >= 20 AND _hour < 24 THEN 1 ELSE 0 END,
      CASE WHEN _hour >= 0 AND _hour < 5 THEN 1 ELSE 0 END
    );
    
    RETURN json_build_object(
      'success', true,
      'is_first_open', true,
      'is_return_after_break', false
    );
  ELSE
    _last_open := _activity_record.last_open_at;
    _days_since_last := EXTRACT(DAY FROM (_now - _last_open))::integer;
    
    -- Check if returning after a break (3+ days)
    IF _days_since_last >= 3 THEN
      _is_return_after_break := true;
    END IF;
    
    -- Update activity
    UPDATE user_activity SET
      last_open_at = _now,
      total_app_opens = total_app_opens + 1,
      total_days_active = CASE WHEN DATE(_last_open) < _today THEN total_days_active + 1 ELSE total_days_active END,
      longest_break_days = GREATEST(longest_break_days, _days_since_last),
      morning_opens = CASE WHEN _hour >= 5 AND _hour < 10 THEN morning_opens + 1 ELSE morning_opens END,
      evening_opens = CASE WHEN _hour >= 20 AND _hour < 24 THEN evening_opens + 1 ELSE evening_opens END,
      night_opens = CASE WHEN _hour >= 0 AND _hour < 5 THEN night_opens + 1 ELSE night_opens END,
      last_break_return_at = CASE WHEN _is_return_after_break THEN _now ELSE last_break_return_at END,
      updated_at = _now
    WHERE user_id = _user_id;
    
    RETURN json_build_object(
      'success', true,
      'is_first_open', false,
      'is_return_after_break', _is_return_after_break,
      'days_since_last', _days_since_last
    );
  END IF;
END;
$$;

-- 10. Function to purchase seed
CREATE OR REPLACE FUNCTION public.purchase_seed(_seed_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _balance integer;
  _price integer;
  _seed_name text;
  _is_premium boolean;
  _user_premium boolean;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get seed info
  SELECT name, price, is_premium INTO _seed_name, _price, _is_premium
  FROM plant_seeds WHERE id = _seed_id;
  
  IF _seed_name IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Seed not found');
  END IF;
  
  -- Check if already owned
  IF EXISTS (SELECT 1 FROM user_seeds WHERE user_id = _user_id AND seed_id = _seed_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already owned');
  END IF;
  
  -- Check premium requirement
  IF _is_premium THEN
    SELECT is_premium INTO _user_premium FROM profiles WHERE id = _user_id;
    IF NOT COALESCE(_user_premium, false) THEN
      RETURN json_build_object('success', false, 'error', 'Premium required');
    END IF;
  END IF;
  
  -- Check balance
  SELECT balance INTO _balance FROM user_points WHERE user_id = _user_id FOR UPDATE;
  IF _balance IS NULL OR _balance < _price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points
  UPDATE user_points SET balance = balance - _price WHERE user_id = _user_id;
  
  -- Grant seed
  INSERT INTO user_seeds (user_id, seed_id) VALUES (_user_id, _seed_id);
  
  -- Log transaction
  INSERT INTO point_transactions (user_id, amount, type, description)
  VALUES (_user_id, -_price, 'purchase', 'Purchased ' || _seed_name);
  
  RETURN json_build_object('success', true, 'seed_name', _seed_name, 'new_balance', _balance - _price);
END;
$$;

-- 11. Function to purchase decoration
CREATE OR REPLACE FUNCTION public.purchase_decoration(_decoration_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _balance integer;
  _price integer;
  _decoration_name text;
  _is_premium boolean;
  _user_premium boolean;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get decoration info
  SELECT name, price, is_premium INTO _decoration_name, _price, _is_premium
  FROM plant_decorations WHERE id = _decoration_id;
  
  IF _decoration_name IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Decoration not found');
  END IF;
  
  -- Check if already owned
  IF EXISTS (SELECT 1 FROM user_decorations WHERE user_id = _user_id AND decoration_id = _decoration_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already owned');
  END IF;
  
  -- Check premium requirement
  IF _is_premium THEN
    SELECT is_premium INTO _user_premium FROM profiles WHERE id = _user_id;
    IF NOT COALESCE(_user_premium, false) THEN
      RETURN json_build_object('success', false, 'error', 'Premium required');
    END IF;
  END IF;
  
  -- Check balance
  SELECT balance INTO _balance FROM user_points WHERE user_id = _user_id FOR UPDATE;
  IF _balance IS NULL OR _balance < _price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points
  UPDATE user_points SET balance = balance - _price WHERE user_id = _user_id;
  
  -- Grant decoration
  INSERT INTO user_decorations (user_id, decoration_id) VALUES (_user_id, _decoration_id);
  
  -- Log transaction
  INSERT INTO point_transactions (user_id, amount, type, description)
  VALUES (_user_id, -_price, 'purchase', 'Purchased ' || _decoration_name);
  
  RETURN json_build_object('success', true, 'decoration_name', _decoration_name, 'new_balance', _balance - _price);
END;
$$;

-- 12. Function to earn achievement
CREATE OR REPLACE FUNCTION public.earn_achievement(_achievement_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _achievement_id uuid;
  _achievement_name text;
  _points_reward integer;
  _already_earned boolean;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get achievement
  SELECT id, name, points_reward INTO _achievement_id, _achievement_name, _points_reward
  FROM achievements WHERE key = _achievement_key;
  
  IF _achievement_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Achievement not found');
  END IF;
  
  -- Check if already earned
  SELECT EXISTS(SELECT 1 FROM user_achievements WHERE user_id = _user_id AND achievement_id = _achievement_id) INTO _already_earned;
  
  IF _already_earned THEN
    RETURN json_build_object('success', false, 'error', 'Already earned', 'already_earned', true);
  END IF;
  
  -- Grant achievement
  INSERT INTO user_achievements (user_id, achievement_id) VALUES (_user_id, _achievement_id);
  
  -- Award points if any (through award_points function with 'achievement' type to bypass cap)
  IF _points_reward > 0 THEN
    PERFORM award_points(_points_reward, 'achievement', 'Earned: ' || _achievement_name);
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'achievement_name', _achievement_name,
    'points_awarded', _points_reward
  );
END;
$$;