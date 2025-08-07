-- Fix the security definer function to have a secure search path
CREATE OR REPLACE FUNCTION public.get_current_professional_id()
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.professionals 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;