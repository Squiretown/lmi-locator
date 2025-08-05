-- Phase 1: Role System Cleanup Migration
-- Standardize to 4 clear roles: admin, realtor, mortgage_professional, client

-- 1. Update the app_role enum to include all 4 standardized roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'realtor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'mortgage_professional';

-- 2. Create realtors table for real estate professionals
CREATE TABLE IF NOT EXISTS public.realtors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  license_number TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  bio TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  social_media JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create mortgage_professionals table for mortgage brokers/lenders
CREATE TABLE IF NOT EXISTS public.mortgage_professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  license_number TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  bio TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  social_media JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS on new tables
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage_professionals ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for realtors
CREATE POLICY "Realtors can view their own profile" ON public.realtors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Realtors can update their own profile" ON public.realtors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all realtors" ON public.realtors
  FOR SELECT USING (user_is_admin());

CREATE POLICY "Admins can manage all realtors" ON public.realtors
  FOR ALL USING (user_is_admin());

CREATE POLICY "Public can view active realtors" ON public.realtors
  FOR SELECT USING (status = 'active');

-- 6. Create RLS policies for mortgage_professionals
CREATE POLICY "Mortgage professionals can view their own profile" ON public.mortgage_professionals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Mortgage professionals can update their own profile" ON public.mortgage_professionals
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all mortgage professionals" ON public.mortgage_professionals
  FOR SELECT USING (user_is_admin());

CREATE POLICY "Admins can manage all mortgage professionals" ON public.mortgage_professionals
  FOR ALL USING (user_is_admin());

CREATE POLICY "Public can view active mortgage professionals" ON public.mortgage_professionals
  FOR SELECT USING (status = 'active');

-- 7. Create professional_permissions table for the new structure
CREATE TABLE IF NOT EXISTS public.professional_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('realtor', 'mortgage_professional')),
  permission_name TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, professional_type, permission_name)
);

ALTER TABLE public.professional_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own permissions" ON public.professional_permissions
  FOR SELECT USING (
    (professional_type = 'realtor' AND professional_id IN (SELECT id FROM realtors WHERE user_id = auth.uid())) OR
    (professional_type = 'mortgage_professional' AND professional_id IN (SELECT id FROM mortgage_professionals WHERE user_id = auth.uid()))
  );

CREATE POLICY "Admins can manage all professional permissions" ON public.professional_permissions
  FOR ALL USING (user_is_admin());

-- 8. Migrate existing data from professionals table to appropriate new tables
-- First, migrate realtors (professionals with type = 'realtor')
INSERT INTO public.realtors (
  user_id, name, company, license_number, email, phone, address, website, bio, photo_url, 
  status, social_media, is_verified, is_flagged, notes, created_at, last_updated
)
SELECT 
  user_id, name, company, license_number, email, phone, address, website, bio, photo_url,
  status, social_media, is_verified, is_flagged, notes, created_at, last_updated
FROM public.professionals 
WHERE type = 'realtor'
ON CONFLICT (user_id) DO NOTHING;

-- Migrate mortgage professionals (professionals with type = 'mortgage_broker')
INSERT INTO public.mortgage_professionals (
  user_id, name, company, license_number, email, phone, address, website, bio, photo_url,
  status, social_media, is_verified, is_flagged, notes, created_at, last_updated
)
SELECT 
  user_id, name, company, license_number, email, phone, address, website, bio, photo_url,
  status, social_media, is_verified, is_flagged, notes, created_at, last_updated
FROM public.professionals 
WHERE type = 'mortgage_broker'
ON CONFLICT (user_id) DO NOTHING;

-- 9. Migrate data from mortgage_brokers table if it exists
INSERT INTO public.mortgage_professionals (
  user_id, name, company, license_number, email, phone, status, created_at
)
SELECT 
  COALESCE(user_id, gen_random_uuid()), name, company, license_number, email, phone, status, created_at
FROM public.mortgage_brokers
WHERE NOT EXISTS (
  SELECT 1 FROM public.mortgage_professionals mp WHERE mp.user_id = mortgage_brokers.user_id
);

-- 10. Update user_profiles to use standardized role names
UPDATE public.user_profiles 
SET user_type = 'mortgage_professional' 
WHERE user_type = 'mortgage_broker';

-- 11. Create triggers for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, user_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')
  );
  
  -- Create professional profile if user is a professional
  IF NEW.raw_user_meta_data->>'user_type' = 'realtor' THEN
    INSERT INTO public.realtors (
      user_id, name, company, license_number, email
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', 'New Realtor'),
      COALESCE(NEW.raw_user_meta_data->>'company', 'Not Specified'),
      COALESCE(NEW.raw_user_meta_data->>'license_number', 'Pending'),
      NEW.email
    );
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'mortgage_professional' THEN
    INSERT INTO public.mortgage_professionals (
      user_id, name, company, license_number, email
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', 'New Mortgage Professional'),
      COALESCE(NEW.raw_user_meta_data->>'company', 'Not Specified'),
      COALESCE(NEW.raw_user_meta_data->>'license_number', 'Pending'),
      NEW.email
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- 12. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_realtors_user_id ON public.realtors(user_id);
CREATE INDEX IF NOT EXISTS idx_realtors_status ON public.realtors(status);
CREATE INDEX IF NOT EXISTS idx_mortgage_professionals_user_id ON public.mortgage_professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_professionals_status ON public.mortgage_professionals(status);
CREATE INDEX IF NOT EXISTS idx_professional_permissions_professional_id ON public.professional_permissions(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_permissions_type ON public.professional_permissions(professional_type);

-- 13. Clean up: Drop old tables after successful migration (commented out for safety)
-- DROP TABLE IF EXISTS public.mortgage_brokers CASCADE;
-- DROP TABLE IF EXISTS public.broker_permissions CASCADE;
-- DROP TABLE IF EXISTS public.professionals CASCADE;