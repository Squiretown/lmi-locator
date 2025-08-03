-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.delete_user_safely(uuid);

-- Create comprehensive user deletion function
CREATE OR REPLACE FUNCTION public.delete_user_safely(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_counts jsonb := '{}';
  temp_count integer;
  error_message text;
BEGIN
  -- Validate input
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User ID cannot be null',
      'deleted_records', deleted_counts
    );
  END IF;

  -- Check if user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found in auth.users',
      'deleted_records', deleted_counts
    );
  END IF;

  BEGIN
    -- Step 1: Update all audit/tracking fields to NULL (safe)
    UPDATE admin_message_templates SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{admin_message_templates_updated}', to_jsonb(temp_count));

    UPDATE communication_templates SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{communication_templates_updated}', to_jsonb(temp_count));

    UPDATE ffiec_import_jobs SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{ffiec_import_jobs_updated}', to_jsonb(temp_count));

    UPDATE help_items SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{help_items_updated}', to_jsonb(temp_count));

    -- Handle system_settings if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
      EXECUTE format('UPDATE system_settings SET updated_by = NULL WHERE updated_by = %L', target_user_id);
    END IF;

    -- Handle theme_settings if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theme_settings') THEN
      EXECUTE format('UPDATE theme_settings SET updated_by = NULL WHERE updated_by = %L', target_user_id);
    END IF;

    -- Handle theme_presets if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theme_presets') THEN
      EXECUTE format('UPDATE theme_presets SET created_by = NULL WHERE created_by = %L', target_user_id);
    END IF;

    -- Handle user_role_audit if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_role_audit') THEN
      EXECUTE format('UPDATE user_role_audit SET changed_by = NULL WHERE changed_by = %L', target_user_id);
    END IF;

    UPDATE user_roles SET assigned_by = NULL WHERE assigned_by = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{user_roles_updated}', to_jsonb(temp_count));

    UPDATE client_profiles SET deactivated_by = NULL WHERE deactivated_by = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{client_profiles_updated}', to_jsonb(temp_count));

    -- Step 2: Delete user-owned data (safe to delete)
    DELETE FROM activity_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{activity_logs}', to_jsonb(temp_count));

    DELETE FROM alerts WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{alerts}', to_jsonb(temp_count));

    DELETE FROM batch_search_jobs WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{batch_search_jobs}', to_jsonb(temp_count));

    DELETE FROM blog_posts WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{blog_posts}', to_jsonb(temp_count));

    DELETE FROM census_tract_searches WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{census_tract_searches}', to_jsonb(temp_count));

    DELETE FROM contact_interactions WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{contact_interactions}', to_jsonb(temp_count));

    DELETE FROM data_import_log WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{data_import_log}', to_jsonb(temp_count));

    DELETE FROM lmi_search_error_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{lmi_search_error_logs}', to_jsonb(temp_count));

    -- Handle marketing_jobs if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketing_jobs') THEN
      EXECUTE format('DELETE FROM marketing_jobs WHERE user_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{marketing_jobs}', to_jsonb(temp_count));
    END IF;

    -- Handle notification_preferences if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
      EXECUTE format('DELETE FROM notification_preferences WHERE user_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{notification_preferences}', to_jsonb(temp_count));
    END IF;

    -- Handle notifications if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
      EXECUTE format('DELETE FROM notifications WHERE user_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{notifications}', to_jsonb(temp_count));
    END IF;

    -- Handle program_eligibility_checks if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_eligibility_checks') THEN
      EXECUTE format('DELETE FROM program_eligibility_checks WHERE user_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{program_eligibility_checks}', to_jsonb(temp_count));
    END IF;

    -- Handle resources if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resources') THEN
      EXECUTE format('DELETE FROM resources WHERE user_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{resources}', to_jsonb(temp_count));
    END IF;

    -- Handle saved_addresses if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_addresses') THEN
      EXECUTE format('DELETE FROM saved_addresses WHERE user_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{saved_addresses}', to_jsonb(temp_count));
    END IF;

    -- Handle saved_properties if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_properties') THEN
      EXECUTE format('DELETE FROM saved_properties WHERE user_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{saved_properties}', to_jsonb(temp_count));
    END IF;

    DELETE FROM search_history WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{search_history}', to_jsonb(temp_count));

    -- Handle testimonials if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') THEN
      EXECUTE format('DELETE FROM testimonials WHERE user_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{testimonials}', to_jsonb(temp_count));
    END IF;

    -- Step 3: Handle invitation system
    DELETE FROM contacts_invited WHERE inviter_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{contacts_invited}', to_jsonb(temp_count));

    UPDATE contacts_invited SET registered_user_id = NULL WHERE registered_user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{contacts_invited_updated}', to_jsonb(temp_count));

    -- Step 4: Handle professional relationships
    -- Handle professional_leads if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'professional_leads') THEN
      EXECUTE format('DELETE FROM professional_leads WHERE professional_id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{professional_leads}', to_jsonb(temp_count));
    END IF;

    DELETE FROM client_profiles WHERE professional_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{client_profiles}', to_jsonb(temp_count));

    DELETE FROM clients WHERE professional_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{clients}', to_jsonb(temp_count));

    DELETE FROM client_invitations WHERE professional_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{client_invitations}', to_jsonb(temp_count));

    DELETE FROM client_communications WHERE professional_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{client_communications}', to_jsonb(temp_count));

    DELETE FROM client_activity_logs WHERE professional_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{client_activity_logs}', to_jsonb(temp_count));

    DELETE FROM client_team_assignments WHERE professional_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{client_team_assignments}', to_jsonb(temp_count));

    DELETE FROM client_team_assignments WHERE assigned_by = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{client_team_assignments_assigned}', to_jsonb(temp_count));

    DELETE FROM contacts WHERE owner_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{contacts}', to_jsonb(temp_count));

    -- Step 5: Handle admin error logs
    DELETE FROM admin_error_logs WHERE admin_user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{admin_error_logs_admin}', to_jsonb(temp_count));

    DELETE FROM admin_error_logs WHERE target_user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{admin_error_logs_target}', to_jsonb(temp_count));

    UPDATE admin_error_logs SET resolved_by = NULL WHERE resolved_by = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{admin_error_logs_resolved_updated}', to_jsonb(temp_count));

    -- Step 6: Handle professionals table and broker permissions
    DELETE FROM broker_permissions WHERE broker_id IN (SELECT id FROM professionals WHERE user_id = target_user_id);
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{broker_permissions}', to_jsonb(temp_count));

    DELETE FROM professionals WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{professionals}', to_jsonb(temp_count));

    -- Step 7: Handle user profiles and roles
    DELETE FROM user_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{user_profiles}', to_jsonb(temp_count));

    DELETE FROM user_roles WHERE user_id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{user_roles}', to_jsonb(temp_count));

    -- Handle users_profile if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_profile') THEN
      EXECUTE format('DELETE FROM users_profile WHERE id = %L', target_user_id);
      GET DIAGNOSTICS temp_count = ROW_COUNT;
      deleted_counts := jsonb_set(deleted_counts, '{users_profile}', to_jsonb(temp_count));
    END IF;

    -- Step 8: Finally delete the user from auth.users
    DELETE FROM auth.users WHERE id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{auth_users}', to_jsonb(temp_count));

    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User and all related data deleted successfully',
      'deleted_records', deleted_counts
    );

  EXCEPTION WHEN OTHERS THEN
    -- Get error details
    GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
    
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error during user deletion: ' || error_message,
      'deleted_records', deleted_counts
    );
  END;
END;
$$;