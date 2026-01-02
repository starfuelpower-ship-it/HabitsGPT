-- Add RLS policy to prevent client-side premium status updates
-- This ensures premium can only be updated via the secure edge function with service role

-- Drop existing update policy if it allows premium field changes
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new update policy that prevents premium field changes from client
CREATE POLICY "Users can update their own profile (excluding premium)"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent users from changing their own premium status
  is_premium IS NOT DISTINCT FROM (SELECT is_premium FROM profiles WHERE id = auth.uid()) AND
  premium_expires_at IS NOT DISTINCT FROM (SELECT premium_expires_at FROM profiles WHERE id = auth.uid())
);