-- Create table for tracking user points balance
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  last_daily_bonus DATE,
  last_weekly_bonus DATE,
  current_streak_bonus INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Policies for user_points
CREATE POLICY "Users can view their own points" ON public.user_points 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points" ON public.user_points 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON public.user_points 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create table for available cat costumes
CREATE TABLE public.cat_costumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 100,
  is_premium_only BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'accessory',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (public read)
ALTER TABLE public.cat_costumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view costumes" ON public.cat_costumes 
  FOR SELECT USING (true);

-- Create table for user's unlocked costumes
CREATE TABLE public.user_costumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  costume_id UUID NOT NULL REFERENCES public.cat_costumes(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, costume_id)
);

-- Enable RLS
ALTER TABLE public.user_costumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own costumes" ON public.user_costumes 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase costumes" ON public.user_costumes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create table for currently equipped costume
CREATE TABLE public.user_equipped_costume (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  costume_id UUID REFERENCES public.cat_costumes(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_equipped_costume ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their equipped costume" ON public.user_equipped_costume 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can set their equipped costume" ON public.user_equipped_costume 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their equipped costume" ON public.user_equipped_costume 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create table for point transaction history
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions" ON public.point_transactions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" ON public.point_transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default costumes
INSERT INTO public.cat_costumes (name, description, icon, price, is_premium_only, category, sort_order) VALUES
-- Hats (100-200 points)
('Cozy Beanie', 'A warm knitted beanie for cold days', '🧢', 100, false, 'hat', 1),
('Tiny Crown', 'For the royal kitty in your life', '👑', 150, false, 'hat', 2),
('Party Hat', 'Celebrate every milestone!', '🎉', 120, false, 'hat', 3),
('Flower Crown', 'A beautiful crown of flowers', '🌸', 180, false, 'hat', 4),
('Wizard Hat', 'Magical vibes only', '🧙', 200, false, 'hat', 5),

-- Accessories (80-150 points)
('Red Bow Tie', 'Classic and dapper', '🎀', 80, false, 'accessory', 6),
('Bell Collar', 'Jingle jingle!', '🔔', 90, false, 'accessory', 7),
('Bandana', 'Cool and casual', '🧣', 100, false, 'accessory', 8),
('Heart Necklace', 'Show some love', '💝', 120, false, 'accessory', 9),
('Sunglasses', 'Too cool for school', '😎', 150, false, 'accessory', 10),

-- Outfits (200-400 points)
('Sweater', 'Cozy knitted sweater', '🧶', 200, false, 'outfit', 11),
('Raincoat', 'Stay dry on rainy days', '🌧️', 220, false, 'outfit', 12),
('Cape', 'Superhero vibes!', '🦸', 250, false, 'outfit', 13),
('Pajamas', 'Sleepy time comfort', '😴', 180, false, 'outfit', 14),

-- Premium Exclusive
('Golden Armor', 'Legendary protection', '⚔️', 500, true, 'outfit', 15),
('Angel Wings', 'Heavenly accessory', '😇', 600, true, 'accessory', 16),
('Diamond Collar', 'Ultimate luxury', '💎', 800, true, 'accessory', 17),
('Rainbow Cape', 'Magical and colorful', '🌈', 700, true, 'outfit', 18),
('Star Halo', 'Shine bright like a star', '⭐', 550, true, 'hat', 19);