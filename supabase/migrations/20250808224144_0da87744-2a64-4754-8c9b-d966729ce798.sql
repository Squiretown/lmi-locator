-- Add missing email column to professionals table
ALTER TABLE public.professionals 
ADD COLUMN email text;

-- Add unique constraint for ON CONFLICT handling in triggers
ALTER TABLE public.professionals 
ADD CONSTRAINT professionals_user_id_unique UNIQUE (user_id);