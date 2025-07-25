-- Phase 1: Critical Security Fixes (Corrected)

-- 1. Add RLS policies to property_cache table (public access for cached data)
ALTER TABLE public.property_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to property cache" 
ON public.property_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert cached properties" 
ON public.property_cache 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update cached properties" 
ON public.property_cache 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all cached properties" 
ON public.property_cache 
FOR ALL 
USING (user_is_admin());

-- 2. Create secure user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'professional', 'client');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create secure admin check function
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    public.has_role(auth.uid(), 'admin'::app_role),
    -- Fallback to metadata check for existing users during transition
    (SELECT raw_user_meta_data->>'user_type' = 'admin' FROM auth.users WHERE id = auth.uid())
  );
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Remove user ability to modify their own user_type in profiles
-- Add constraint to prevent self-modification of user_type
CREATE OR REPLACE FUNCTION public.prevent_user_type_self_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow admins to modify any user_type
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  
  -- Prevent users from modifying their own user_type
  IF OLD.user_id = auth.uid() AND OLD.user_type != NEW.user_type THEN
    RAISE EXCEPTION 'Users cannot modify their own user_type. Contact an administrator.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_user_type_self_modification_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_type_self_modification();

-- 4. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.generate_invitation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    code_length INTEGER := 8;
    characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..code_length LOOP
        result := result || substr(characters, floor(random() * length(characters) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_ffiec_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 5. Create audit log for role changes
CREATE TABLE public.user_role_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    old_role app_role,
    new_role app_role NOT NULL,
    changed_by uuid REFERENCES auth.users(id),
    changed_at timestamp with time zone DEFAULT now(),
    reason text
);

ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role audit logs" 
ON public.user_role_audit 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_role_audit (user_id, old_role, new_role, changed_by)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    OLD.role,
    NEW.role,
    auth.uid()
  );
  RETURN NEW;
END;
$$;