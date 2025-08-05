-- Step 3: Create RLS policies and migrate data

-- RLS policies for realtors
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

-- RLS policies for mortgage_professionals
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

-- Migrate data from professionals table
INSERT INTO public.realtors (
  user_id, name, company, license_number, phone, address, website, bio, photo_url, 
  status, social_media, is_verified, is_flagged, notes, created_at, last_updated
)
SELECT 
  user_id, name, company, license_number, phone, address, website, bio, photo_url,
  status, social_media, is_verified, is_flagged, notes, created_at, last_updated
FROM public.professionals 
WHERE type = 'realtor'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.mortgage_professionals (
  user_id, name, company, license_number, phone, address, website, bio, photo_url,
  status, social_media, is_verified, is_flagged, notes, created_at, last_updated
)
SELECT 
  user_id, name, company, license_number, phone, address, website, bio, photo_url,
  status, social_media, is_verified, is_flagged, notes, created_at, last_updated
FROM public.professionals 
WHERE type = 'mortgage_broker'
ON CONFLICT (user_id) DO NOTHING;

-- Update user_profiles to use standardized role names
UPDATE public.user_profiles 
SET user_type = 'mortgage_professional' 
WHERE user_type = 'mortgage_broker';