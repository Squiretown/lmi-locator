-- Phase 1: Core Role System Stabilization (Fixed)
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'mortgage_professional', 'realtor', 'client')),
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name text UNIQUE NOT NULL,
    description text,
    category text NOT NULL DEFAULT 'general',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role text NOT NULL CHECK (role IN ('admin', 'mortgage_professional', 'realtor', 'client')),
    permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(role, permission_id)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
FOR ALL USING (user_is_admin());

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can view permissions" ON public.permissions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
FOR ALL USING (user_is_admin());

CREATE POLICY "Anyone can view role permissions" ON public.role_permissions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
FOR ALL USING (user_is_admin());

-- Insert core permissions (with conflict handling)
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

-- Clear existing role permissions to avoid duplicates
DELETE FROM public.role_permissions;

-- Insert role permissions
INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'admin', id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'mortgage_professional', id FROM public.permissions 
WHERE permission_name IN ('view_analytics', 'export_data', 'manage_properties', 'view_own_searches', 'manage_marketing_campaigns', 'view_notifications', 'manage_contacts');

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'realtor', id FROM public.permissions 
WHERE permission_name IN ('view_analytics', 'export_data', 'manage_properties', 'view_own_searches', 'manage_marketing_campaigns', 'view_notifications', 'manage_contacts');

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'client', id FROM public.permissions 
WHERE permission_name IN ('view_own_searches', 'view_notifications');

-- Create function to get user permissions from database
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

-- Create function to check specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.get_user_permissions_from_db(user_uuid) p
    WHERE p.permission_name = has_permission.permission_name
  );
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
  
  -- Get role from user_roles table
  SELECT role INTO user_role
  FROM public.user_roles 
  WHERE user_id = user_uuid 
  LIMIT 1;
  
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

-- Migrate existing user roles from user_profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT DISTINCT 
  up.user_id, 
  CASE 
    WHEN up.user_type = 'mortgage_broker' THEN 'mortgage_professional'
    WHEN up.user_type IN ('admin', 'mortgage_professional', 'realtor', 'client') THEN up.user_type
    ELSE 'client'
  END as role,
  COALESCE(up.created_at, now())
FROM public.user_profiles up
WHERE up.user_type IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;