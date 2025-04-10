
-- Function to temporarily disable RLS for admin operations
CREATE OR REPLACE FUNCTION public.temporarily_disable_rls()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- You can add additional checks here if needed
  -- For example, check if the user is an admin
  
  RETURN TRUE;
END;
$$;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.temporarily_disable_rls() TO authenticated;
