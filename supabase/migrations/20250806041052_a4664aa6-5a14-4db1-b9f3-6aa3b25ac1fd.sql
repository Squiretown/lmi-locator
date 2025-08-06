-- Fix the validate_user_creation trigger function by removing problematic activity_logs insert
CREATE OR REPLACE FUNCTION public.validate_user_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If creating a client user type, ensure they came through invitation
  -- This will be handled in the application layer for now
  -- But we can add database-level validation later
  
  -- For now, just return NEW without logging to activity_logs
  -- (The activity_logs insert was causing foreign key constraint violations)
  
  RETURN NEW;
END;
$function$