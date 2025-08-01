-- Create FFIEC uploads storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ffiec-uploads',
  'ffiec-uploads', 
  false,
  524288000, -- 500MB
  ARRAY[
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel', 
    'text/csv'
  ]
);

-- Create storage policies for FFIEC uploads
CREATE POLICY "Authenticated users can upload FFIEC files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ffiec-uploads' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can download their own FFIEC uploads"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ffiec-uploads'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own FFIEC uploads"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ffiec-uploads'
  AND auth.uid() IS NOT NULL
);

-- Create data import logging table
CREATE TABLE public.data_import_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  import_type TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  import_status TEXT NOT NULL DEFAULT 'pending',
  error_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on data import log
ALTER TABLE public.data_import_log ENABLE ROW LEVEL SECURITY;

-- Create policies for data import log
CREATE POLICY "Users can view their own import logs"
ON public.data_import_log
FOR SELECT
USING (auth.uid() = user_id OR user_is_admin());

CREATE POLICY "Users can insert their own import logs"
ON public.data_import_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import logs"
ON public.data_import_log
FOR UPDATE
USING (auth.uid() = user_id OR user_is_admin());

-- Add missing columns to census_tracts table for FFIEC compatibility
ALTER TABLE public.census_tracts 
ADD COLUMN IF NOT EXISTS state_code TEXT,
ADD COLUMN IF NOT EXISTS county_code TEXT,
ADD COLUMN IF NOT EXISTS tract_code TEXT,
ADD COLUMN IF NOT EXISTS import_batch_id UUID;