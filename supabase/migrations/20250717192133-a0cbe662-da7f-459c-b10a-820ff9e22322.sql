-- Create function to anonymize user search history before deletion
CREATE OR REPLACE FUNCTION public.anonymize_user_search_history(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Anonymize search history by removing personal identifiers but preserving analytics data
  UPDATE public.search_history 
  SET 
    user_id = NULL,
    ip_address = NULL,
    user_agent = NULL
  WHERE user_id = target_user_id;
  
  -- Log the anonymization for audit purposes
  INSERT INTO public.activity_logs (
    activity_type,
    description,
    user_id,
    entity_type,
    entity_id,
    data
  ) VALUES (
    'user_data_anonymized',
    'Search history anonymized before user deletion',
    target_user_id,
    'search_history',
    target_user_id::text,
    jsonb_build_object('anonymized_records', (SELECT COUNT(*) FROM public.search_history WHERE user_id IS NULL))
  );
END;
$$;