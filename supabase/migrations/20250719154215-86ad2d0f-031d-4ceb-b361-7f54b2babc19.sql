
-- Phase 1: Enable extensions for scheduled messaging
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Phase 3: Update database functions to use SECURITY DEFINER and proper search_path
CREATE OR REPLACE FUNCTION public.user_is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'user_type' = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_type()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type',
    'client'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.check_admin_status()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.user_owns_marketing_job(marketing_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketing_jobs
    WHERE marketing_jobs.marketing_id = $1
    AND (marketing_jobs.user_id = auth.uid() OR public.user_is_admin())
  );
$$;

CREATE OR REPLACE FUNCTION public.get_popular_searches(result_limit integer DEFAULT 5)
 RETURNS TABLE(address text, search_count bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT address, COUNT(*) as search_count
  FROM public.search_history
  GROUP BY address
  ORDER BY search_count DESC
  LIMIT result_limit;
$$;

-- Phase 1: Create cron job to process scheduled messages every minute
SELECT cron.schedule(
  'process-scheduled-messages',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://llhofjbijjxkfezidxyi.supabase.co/functions/v1/process-scheduled-message',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaG9mamJpamp4a2ZlemlkeHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjkzMDIsImV4cCI6MjA1ODAwNTMwMn0.sD475girHZmrVREV0AENbjvlOCeT_ArrPpS3LcOS5VQ"}'::jsonb,
        body:='{"scheduled_check": true}'::jsonb
    ) as request_id;
  $$
);
