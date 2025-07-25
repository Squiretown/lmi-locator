-- Fix remaining security linter issues

-- Fix remaining functions with mutable search paths
CREATE OR REPLACE FUNCTION public.user_owns_marketing_job(marketing_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketing_jobs
    WHERE marketing_jobs.marketing_id = $1
    AND (marketing_jobs.user_id = auth.uid() OR public.user_is_admin())
  );
$$;

CREATE OR REPLACE FUNCTION public.secure_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_type text;
BEGIN
  -- Default to 'client' and validate user_type
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'client');
  
  -- Only allow specific user types
  IF v_user_type NOT IN ('client', 'professional', 'admin') THEN
    v_user_type := 'client';
  END IF;

  -- Insert into user_profiles with validated metadata
  INSERT INTO public.user_profiles (
    user_id,
    user_type
  ) VALUES (
    NEW.id,
    v_user_type
  );
  
  -- Create default notification preferences
  PERFORM public.create_default_notification_preferences(NEW.id);
  
  -- Log user creation
  PERFORM log_security_event(
    'user_created',
    NEW.id,
    NULL,
    jsonb_build_object('user_type', v_user_type)
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_permissions()
RETURNS TABLE(permission_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT p.permission_name
  FROM public.permissions p;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_type_name(profile_id uuid)
RETURNS TABLE(type_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT ut.type_name
  FROM public.user_profiles up
  JOIN public.user_types ut ON up.user_type_id = ut.type_id
  WHERE up.id = profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(permission_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT p.permission_name
  FROM public.user_profiles up
  JOIN public.user_type_permissions utp ON up.user_type_id = utp.user_type_id
  JOIN public.permissions p ON utp.permission_id = p.permission_id
  WHERE up.user_id = user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_generate_invitation_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.invitation_code IS NULL THEN
        NEW.invitation_code := generate_invitation_code();
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_communication_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_contacts_invited_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_invitation_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update any pending invitations for this email to 'registered' status
  UPDATE public.contacts_invited 
  SET 
    status = 'registered',
    registered_user_id = NEW.id,
    updated_at = now()
  WHERE 
    email = NEW.email 
    AND status IN ('invited', 'accepted');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_last_updated_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_notification_counts(user_uuid uuid)
RETURNS TABLE(unread_count bigint, read_count bigint, total_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE is_read = FALSE) AS unread_count,
    COUNT(*) FILTER (WHERE is_read = TRUE) AS read_count,
    COUNT(*) AS total_count
  FROM public.notifications
  WHERE user_id = user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_notification_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  delivery_methods TEXT[];
  pref RECORD;
BEGIN
  -- Get user's notification preferences for this type
  SELECT * INTO pref FROM public.notification_preferences
  WHERE user_id = NEW.user_id AND notification_type = NEW.notification_type;
  
  -- If no preferences found, use defaults
  IF pref IS NULL THEN
    NEW.delivery_method := 'in_app';
    RETURN NEW;
  END IF;
  
  -- Build array of delivery methods
  delivery_methods := ARRAY[]::TEXT[];
  
  -- Check each preference
  IF pref.email_enabled THEN
    delivery_methods := array_append(delivery_methods, 'email');
  END IF;
  
  IF pref.sms_enabled THEN
    delivery_methods := array_append(delivery_methods, 'sms');
  END IF;
  
  IF pref.in_app_enabled THEN
    delivery_methods := array_append(delivery_methods, 'in_app');
  END IF;
  
  -- If no delivery methods enabled, default to in_app
  IF array_length(delivery_methods, 1) IS NULL THEN
    NEW.delivery_method := 'in_app';
  ELSE
    -- For simplicity, just use the first method
    -- In practice, you might create multiple notifications, one for each method
    NEW.delivery_method := delivery_methods[1];
  END IF;
  
  -- If frequency is not immediate, delay until appropriate time
  -- This is simplified; a real implementation would need a queue/job system
  IF pref.frequency != 'immediate' THEN
    -- Mark for delayed delivery
    NEW.delivered_at := NULL;
  ELSE
    -- Mark as delivered now
    NEW.delivered_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_marketing_job_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  processed_count INTEGER;
  eligible_count INTEGER;
BEGIN
  -- Only proceed if status changed to 'verified'
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    -- Count processed addresses
    SELECT COUNT(*) INTO processed_count
    FROM public.marketing_addresses
    WHERE marketing_id = NEW.marketing_id
    AND status = 'verified';
    
    -- Count eligible addresses
    SELECT COUNT(*) INTO eligible_count
    FROM public.marketing_addresses
    WHERE marketing_id = NEW.marketing_id
    AND status = 'verified'
    AND is_eligible = TRUE;
    
    -- Update the marketing job
    UPDATE public.marketing_jobs
    SET 
      processed_addresses = processed_count,
      eligible_addresses = eligible_count,
      -- Auto-complete if all addresses are processed
      status = CASE 
        WHEN processed_count = total_addresses THEN 'completed'
        ELSE status
      END
    WHERE marketing_id = NEW.marketing_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_marketing_summary(user_uuid uuid)
RETURNS TABLE(pending_count bigint, processing_count bigint, completed_count bigint, total_addresses bigint, eligible_addresses bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE status = 'processing') AS processing_count,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
    SUM(total_addresses) AS total_addresses,
    SUM(eligible_addresses) AS eligible_addresses
  FROM public.marketing_jobs
  WHERE user_id = user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_marketing_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Generate notification when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update completion timestamp
    NEW.completed_at := now();
    
    -- Mark notification as sent
    NEW.notification_sent := TRUE;
    
    -- Insert notification
    INSERT INTO public.notifications (
      user_id, 
      notification_type, 
      title, 
      message, 
      is_read, 
      created_at
    )
    VALUES (
      NEW.user_id, 
      'marketing_complete', 
      'Marketing Campaign Complete', 
      'Your campaign "' || NEW.campaign_name || '" has been completed with ' || 
      NEW.eligible_addresses || ' eligible properties out of ' || NEW.total_addresses || ' total addresses.', 
      FALSE, 
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into user_profiles with metadata from the auth user
  INSERT INTO public.user_profiles (
    user_id,
    user_type
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')
  );
  
  -- Call the function to create default notification preferences
  PERFORM public.create_default_notification_preferences(NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_default_notification_preferences(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete any existing preferences first to avoid unique constraint violations
  DELETE FROM public.notification_preferences WHERE user_id = user_uuid;
  
  -- Insert default notification preferences
  INSERT INTO public.notification_preferences (user_id, notification_type, email_enabled, sms_enabled, in_app_enabled, frequency)
  VALUES 
    (user_uuid, 'eligibility_change', TRUE, FALSE, TRUE, 'immediate'),
    (user_uuid, 'program_update', TRUE, FALSE, TRUE, 'daily'),
    (user_uuid, 'marketing_complete', TRUE, FALSE, TRUE, 'immediate'),
    (user_uuid, 'new_lead', TRUE, TRUE, TRUE, 'immediate');
  
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the entire transaction
    RAISE NOTICE 'Error creating notification preferences: %', SQLERRM;
END;
$$;