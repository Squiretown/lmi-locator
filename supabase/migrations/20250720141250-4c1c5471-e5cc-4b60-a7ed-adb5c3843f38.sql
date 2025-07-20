
-- Add data source and vintage tracking columns to search_history table
ALTER TABLE public.search_history 
ADD COLUMN data_source text,
ADD COLUMN data_vintage text,
ADD COLUMN data_collection_period text,
ADD COLUMN data_provider text,
ADD COLUMN data_last_updated timestamp with time zone,
ADD COLUMN data_methodology text;

-- Add data source tracking table for admin monitoring
CREATE TABLE public.data_source_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  current_vintage TEXT NOT NULL,
  collection_period TEXT NOT NULL,
  provider TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
  next_expected_update TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  methodology_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for data source metadata
ALTER TABLE public.data_source_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage data source metadata" 
  ON public.data_source_metadata 
  FOR ALL 
  USING (user_is_admin());

CREATE POLICY "Everyone can view data source metadata" 
  ON public.data_source_metadata 
  FOR SELECT 
  USING (true);

-- Insert initial data source records
INSERT INTO public.data_source_metadata (
  source_name, 
  current_vintage, 
  collection_period, 
  provider, 
  last_updated,
  methodology_notes
) VALUES 
(
  'HUD LMI Summary Data',
  '2024',
  '2018-2022 ACS 5-Year Estimates',
  'HUD via ArcGIS',
  now(),
  'Low-to-Moderate Income areas determined using American Community Survey data with 51% threshold for block groups and census tracts'
),
(
  'Census ACS Median Income',
  '2022',
  '2018-2022 ACS 5-Year Estimates', 
  'U.S. Census Bureau',
  now(),
  'Median household income from American Community Survey 5-year estimates'
);

-- Add trigger to update timestamp
CREATE TRIGGER update_data_source_metadata_updated_at
    BEFORE UPDATE ON public.data_source_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
