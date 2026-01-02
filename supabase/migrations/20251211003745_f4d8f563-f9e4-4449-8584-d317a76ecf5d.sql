
-- Add XP columns to groups table
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- Group challenges table
CREATE TABLE public.group_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_count integer NOT NULL DEFAULT 100,
  habit_category text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Challenge progress per user
CREATE TABLE public.group_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.group_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  progress_count integer DEFAULT 0,
  completed boolean DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Badges definition
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  xp_required integer DEFAULT 0,
  badge_type text NOT NULL DEFAULT 'achievement'
);

-- User earned badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id, group_id)
);

-- Group chat messages
CREATE TABLE public.group_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Group achievements
CREATE TABLE public.group_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text,
  achieved_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_challenges
CREATE POLICY "Members can view group challenges" ON public.group_challenges
  FOR SELECT USING (is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can create challenges" ON public.group_challenges
  FOR INSERT WITH CHECK (is_group_member(auth.uid(), group_id) AND auth.uid() = created_by);

-- RLS Policies for group_challenge_progress
CREATE POLICY "Members can view challenge progress" ON public.group_challenge_progress
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.group_challenges c 
    WHERE c.id = challenge_id AND is_group_member(auth.uid(), c.group_id)
  ));

CREATE POLICY "Users can update own progress" ON public.group_challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress row" ON public.group_challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Members can view group badges" ON public.user_badges
  FOR SELECT USING (
    group_id IS NULL OR is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Users can earn badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for group_chat
CREATE POLICY "Members can view chat" ON public.group_chat
  FOR SELECT USING (is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can send messages" ON public.group_chat
  FOR INSERT WITH CHECK (is_group_member(auth.uid(), group_id) AND auth.uid() = user_id);

-- RLS Policies for group_achievements
CREATE POLICY "Members can view achievements" ON public.group_achievements
  FOR SELECT USING (is_group_member(auth.uid(), group_id));

-- Insert default badges
INSERT INTO public.badges (name, description, icon, xp_required, badge_type) VALUES
  ('First Steps', 'Join your first group', '🌱', 0, 'milestone'),
  ('Team Player', 'Complete 10 habits in a group', '🤝', 100, 'achievement'),
  ('Streak Master', 'Reach a 7-day streak', '🔥', 200, 'streak'),
  ('Challenge Champion', 'Complete a group challenge', '🏆', 300, 'challenge'),
  ('Social Butterfly', 'Send 50 chat messages', '🦋', 150, 'social'),
  ('XP Hunter', 'Earn 500 XP for your group', '⭐', 500, 'xp'),
  ('Legend', 'Reach group level 10', '👑', 1000, 'legendary');

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_chat;
