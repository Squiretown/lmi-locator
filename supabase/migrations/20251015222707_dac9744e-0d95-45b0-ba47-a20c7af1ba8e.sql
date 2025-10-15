-- Add user_id to client_profiles to link clients to auth.users
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);

-- Add RLS policy for clients to view their own profile
CREATE POLICY "Clients can view their own profile"
ON public.client_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add RLS policy for clients to view their team assignments
CREATE POLICY "Clients can view their own team assignments"
ON public.client_team_assignments
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.client_profiles WHERE user_id = auth.uid()
  )
);

-- Add comment explaining the field
COMMENT ON COLUMN public.client_profiles.user_id IS 'Links client profile to auth.users when client has a system account';