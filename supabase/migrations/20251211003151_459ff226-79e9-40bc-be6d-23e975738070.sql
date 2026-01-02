-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  streak INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, group_id)
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user is a member of a group
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;

-- RLS policies for groups table
-- Members can view their groups
CREATE POLICY "Members can view their groups"
ON public.groups
FOR SELECT
USING (public.is_group_member(auth.uid(), id));

-- Authenticated users can create groups
CREATE POLICY "Users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Creator can delete their group
CREATE POLICY "Creator can delete group"
ON public.groups
FOR DELETE
USING (auth.uid() = created_by);

-- RLS policies for group_members table
-- Members can view other members in their groups
CREATE POLICY "Members can view group members"
ON public.group_members
FOR SELECT
USING (public.is_group_member(auth.uid(), group_id));

-- Users can join groups (insert themselves)
CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can leave groups (delete themselves)
CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (auth.uid() = user_id);