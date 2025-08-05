-- Phase 1: Simple completion without table creation issues
-- Add permissions data and functions only

-- Insert core permissions if permissions table exists
INSERT INTO public.permissions (permission_name, description, category) VALUES
('view_all_users', 'View all users in the system', 'admin'),
('manage_users', 'Create, update, delete users', 'admin'),
('view_analytics', 'View system analytics and reports', 'analytics'),
('manage_system_settings', 'Manage system configuration', 'admin'),
('export_data', 'Export system data', 'data'),
('manage_properties', 'Manage property listings', 'properties'),
('view_all_searches', 'View all user searches', 'admin'),
('view_own_searches', 'View own searches only', 'searches'),
('manage_marketing_campaigns', 'Create and manage marketing campaigns', 'marketing'),
('view_notifications', 'View notifications', 'notifications'),
('manage_notifications', 'Manage notification settings', 'notifications'),
('view_user_management', 'Access user management interface', 'admin'),
('sign_out_all_users', 'Sign out all users', 'admin'),
('remove_all_users', 'Remove all users', 'admin'),
('manage_contacts', 'Manage contact lists', 'contacts')
ON CONFLICT (permission_name) DO NOTHING;

-- Create database functions for permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions_from_db(user_uuid uuid)
RETURNS TABLE(permission_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin via metadata first
  IF (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin') THEN
    RETURN QUERY SELECT p.permission_name FROM public.permissions p;
  END IF;
  
  -- Get permissions based on user roles in database
  RETURN QUERY
  SELECT DISTINCT p.permission_name
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = user_uuid;
END;
$function$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  -- Check metadata first for admin
  IF (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin') THEN
    RETURN 'admin';
  END IF;
  
  -- Get role from user_roles table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    SELECT role INTO user_role
    FROM public.user_roles 
    WHERE user_id = user_uuid 
    LIMIT 1;
  END IF;
  
  -- Fallback to user_profiles table
  IF user_role IS NULL THEN
    SELECT user_type INTO user_role
    FROM public.user_profiles 
    WHERE user_id = user_uuid;
  END IF;
  
  -- Final fallback to metadata
  IF user_role IS NULL THEN
    SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' INTO user_role;
  END IF;
  
  RETURN COALESCE(user_role, 'client');
END;
$function$;