
-- Fix the database trigger to handle null auth.uid() gracefully
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  -- Only set updated_by if auth.uid() is not null
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also make the updated_by column nullable if it isn't already
ALTER TABLE public.system_settings 
ALTER COLUMN updated_by DROP NOT NULL;
