-- Phase 2 Security Fixes: Fix function search paths without breaking dependencies

-- Update existing functions with proper search paths (without dropping them)
CREATE OR REPLACE FUNCTION check_user_permission_simple(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin via metadata first
  IF (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin') THEN
    RETURN true;
  END IF;
  
  -- For now, use temporary permission logic
  RETURN false;
END;
$$;

-- Update get_current_professional_id function with proper search path (without dropping)
CREATE OR REPLACE FUNCTION get_current_professional_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT p.id 
    FROM professionals p 
    WHERE p.user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Update user_is_admin function with proper search path (without dropping)
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.user_type = 'admin'
  );
END;
$$;

-- Update generate_invitation_code function with proper search path
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
END;
$$;

-- Ensure spatial_ref_sys table has RLS enabled (PostGIS system table)
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Add a permissive policy for spatial_ref_sys (it's reference data)
DROP POLICY IF EXISTS "Public read access to spatial reference systems" ON spatial_ref_sys;
CREATE POLICY "Public read access to spatial reference systems" 
ON spatial_ref_sys FOR SELECT 
USING (true);

-- Create performance indexes on client_invitations for Phase 2
CREATE INDEX IF NOT EXISTS idx_client_invitations_professional_status 
ON client_invitations(professional_id, status);

CREATE INDEX IF NOT EXISTS idx_client_invitations_email_status 
ON client_invitations(client_email, status);

CREATE INDEX IF NOT EXISTS idx_client_invitations_expires_at 
ON client_invitations(expires_at) WHERE status = 'pending';

-- Add performance index on professionals table
CREATE INDEX IF NOT EXISTS idx_professionals_user_id_status 
ON professionals(user_id, status);

-- Ensure all our new views have proper permissions
GRANT SELECT ON invitations_unified TO authenticated;
GRANT SELECT ON invitations_stats_view TO authenticated;
GRANT SELECT ON crm_contacts_view TO authenticated;