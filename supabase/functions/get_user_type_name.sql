
-- Function to get a user's type name from their profile
CREATE OR REPLACE FUNCTION public.get_user_type_name(profile_id UUID)
RETURNS TABLE (type_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ut.type_name
  FROM public.user_profiles up
  JOIN public.user_types ut ON up.user_type_id = ut.type_id
  WHERE up.id = profile_id;
END;
$$;
