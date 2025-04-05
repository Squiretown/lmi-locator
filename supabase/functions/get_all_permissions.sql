
-- Function to get all permissions in the system
CREATE OR REPLACE FUNCTION public.get_all_permissions()
RETURNS TABLE (permission_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.permission_name
  FROM public.permissions p;
END;
$$;
