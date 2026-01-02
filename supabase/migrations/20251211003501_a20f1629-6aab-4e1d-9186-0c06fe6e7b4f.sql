-- Create group_activities table for activity feed
CREATE TABLE public.group_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'habit_completed', 'all_completed', 'streak_milestone'
  habit_name TEXT,
  streak_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_reactions table for reactions on activities
CREATE TABLE public.group_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.group_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_activities
CREATE POLICY "Members can view group activities"
ON public.group_activities
FOR SELECT
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can insert activities"
ON public.group_activities
FOR INSERT
WITH CHECK (public.is_group_member(auth.uid(), group_id) AND auth.uid() = user_id);

-- RLS policies for group_reactions
CREATE POLICY "Members can view reactions"
ON public.group_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_activities a
    WHERE a.id = activity_id
    AND public.is_group_member(auth.uid(), a.group_id)
  )
);

CREATE POLICY "Members can add reactions"
ON public.group_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.group_activities a
    WHERE a.id = activity_id
    AND public.is_group_member(auth.uid(), a.group_id)
  )
);

CREATE POLICY "Users can remove own reactions"
ON public.group_reactions
FOR DELETE
USING (auth.uid() = user_id);