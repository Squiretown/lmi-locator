-- Fix search path security warnings for the new functions
CREATE OR REPLACE FUNCTION public.is_trial_expired(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_start timestamp with time zone;
  trial_days integer;
BEGIN
  -- Get user's trial start date and current plan info
  SELECT up.trial_started_at, sp.trial_period_days
  INTO trial_start, trial_days
  FROM user_profiles up
  LEFT JOIN subscription_plans sp ON up.current_plan_id = sp.id
  WHERE up.user_id = user_id_param;
  
  -- If no trial start date or not a trial plan, return false
  IF trial_start IS NULL OR trial_days IS NULL OR trial_days = 0 THEN
    RETURN false;
  END IF;
  
  -- Check if trial period has expired
  RETURN (trial_start + (trial_days || ' days')::interval) < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_start timestamp with time zone;
  trial_days integer;
  days_remaining integer;
BEGIN
  -- Get user's trial start date and trial period
  SELECT up.trial_started_at, sp.trial_period_days
  INTO trial_start, trial_days
  FROM user_profiles up
  LEFT JOIN subscription_plans sp ON up.current_plan_id = sp.id
  WHERE up.user_id = user_id_param;
  
  -- If no trial start date or not a trial plan, return 0
  IF trial_start IS NULL OR trial_days IS NULL OR trial_days = 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate days remaining
  days_remaining := trial_days - EXTRACT(day FROM (now() - trial_start))::integer;
  
  -- Return 0 if negative (expired)
  RETURN GREATEST(0, days_remaining);
END;
$$;