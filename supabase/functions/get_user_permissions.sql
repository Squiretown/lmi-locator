
-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE (permission_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.permission_name
  FROM public.user_profiles up
  JOIN public.user_type_permissions utp ON up.user_type_id = utp.user_type_id
  JOIN public.permissions p ON utp.permission_id = p.permission_id
  WHERE up.user_id = user_uuid;
END;
$$;
