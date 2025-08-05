-- Fix the realtors table by dropping and recreating it properly
DROP TABLE IF EXISTS public.realtors CASCADE;

CREATE TABLE public.realtors (
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

ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;

-- Now create the RLS policies 
CREATE POLICY "Realtors can view their own profile" ON public.realtors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Realtors can update their own profile" ON public.realtors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Public can view active realtors" ON public.realtors
  FOR SELECT USING (status = 'active');

CREATE POLICY "Mortgage professionals can view their own profile" ON public.mortgage_professionals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Mortgage professionals can update their own profile" ON public.mortgage_professionals
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Public can view active mortgage professionals" ON public.mortgage_professionals
  FOR SELECT USING (status = 'active');