-- Add basic permissions without category field
INSERT INTO public.permissions (permission_name) VALUES
('view_all_users'),
('manage_users'),
('view_analytics'),
('manage_system_settings'),
('export_data'),
('manage_properties'),
('view_all_searches'),
('view_own_searches'),
('manage_marketing_campaigns'),
('view_notifications'),
('manage_notifications'),
('view_user_management'),
('sign_out_all_users'),
('remove_all_users'),
('manage_contacts')
ON CONFLICT (permission_name) DO NOTHING;

-- Create simple function to check permissions based on existing structure
CREATE OR REPLACE FUNCTION public.check_user_permission_simple(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin via metadata first
  IF (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin') THEN
    RETURN true;
  END IF;
  
  -- For now, use temporary permission logic
  RETURN false;
END;
$function$;