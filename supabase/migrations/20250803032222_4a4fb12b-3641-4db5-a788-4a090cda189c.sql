-- Drop the existing incomplete delete_user_safely function
DROP FUNCTION IF EXISTS public.delete_user_safely(uuid);

-- Create a comprehensive delete_user_safely function that handles all foreign key constraints
CREATE OR REPLACE FUNCTION public.delete_user_safely(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{"success": true, "message": "", "deleted_records": {}}'::jsonb;
  deleted_counts jsonb := '{}'::jsonb;
  user_exists boolean := false;
  temp_count integer;
BEGIN
  -- Check if user exists first
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found',
      'message', 'User does not exist or was already deleted'
    );
  END IF;

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

  -- Handle system_settings if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    EXECUTE 'UPDATE system_settings SET updated_by = NULL WHERE updated_by = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{system_settings_updated}', to_jsonb(temp_count));
  END IF;

  -- Handle theme_settings if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theme_settings') THEN
    EXECUTE 'UPDATE theme_settings SET updated_by = NULL WHERE updated_by = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{theme_settings_updated}', to_jsonb(temp_count));
  END IF;

  -- Handle theme_presets if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theme_presets') THEN
    EXECUTE 'UPDATE theme_presets SET created_by = NULL WHERE created_by = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{theme_presets_updated}', to_jsonb(temp_count));
  END IF;

  -- Handle user_role_audit if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_role_audit') THEN
    EXECUTE 'UPDATE user_role_audit SET changed_by = NULL WHERE changed_by = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{user_role_audit_updated}', to_jsonb(temp_count));
  END IF;

  -- Handle user_roles assigned_by if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'assigned_by') THEN
    EXECUTE 'UPDATE user_roles SET assigned_by = NULL WHERE assigned_by = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{user_roles_assigned_by_updated}', to_jsonb(temp_count));
  END IF;

  UPDATE client_profiles SET deactivated_by = NULL WHERE deactivated_by = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{client_profiles_deactivated_by_updated}', to_jsonb(temp_count));

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

  -- Handle optional tables that may not exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketing_jobs') THEN
    EXECUTE 'DELETE FROM marketing_jobs WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{marketing_jobs}', to_jsonb(temp_count));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
    EXECUTE 'DELETE FROM notification_preferences WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{notification_preferences}', to_jsonb(temp_count));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE 'DELETE FROM notifications WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{notifications}', to_jsonb(temp_count));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_eligibility_checks') THEN
    EXECUTE 'DELETE FROM program_eligibility_checks WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{program_eligibility_checks}', to_jsonb(temp_count));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resources') THEN
    EXECUTE 'DELETE FROM resources WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{resources}', to_jsonb(temp_count));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_addresses') THEN
    EXECUTE 'DELETE FROM saved_addresses WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{saved_addresses}', to_jsonb(temp_count));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_properties') THEN
    EXECUTE 'DELETE FROM saved_properties WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{saved_properties}', to_jsonb(temp_count));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'search_history') THEN
    EXECUTE 'DELETE FROM search_history WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{search_history}', to_jsonb(temp_count));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') THEN
    EXECUTE 'DELETE FROM testimonials WHERE user_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{testimonials}', to_jsonb(temp_count));
  END IF;

  -- Step 3: Handle invitation system
  DELETE FROM contacts_invited WHERE inviter_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{contacts_invited_as_inviter}', to_jsonb(temp_count));

  UPDATE contacts_invited SET registered_user_id = NULL WHERE registered_user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{contacts_invited_registered_user_updated}', to_jsonb(temp_count));

  -- Step 4: Handle professional relationships
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'professional_leads') THEN
    EXECUTE 'DELETE FROM professional_leads WHERE professional_id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{professional_leads}', to_jsonb(temp_count));
  END IF;

  -- Delete client team assignments
  DELETE FROM client_team_assignments WHERE professional_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{client_team_assignments}', to_jsonb(temp_count));

  DELETE FROM client_team_assignments WHERE assigned_by = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{client_team_assignments_assigned_by}', to_jsonb(temp_count));

  -- Delete client communications
  DELETE FROM client_communications WHERE professional_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{client_communications}', to_jsonb(temp_count));

  -- Delete client activity logs
  DELETE FROM client_activity_logs WHERE professional_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{client_activity_logs}', to_jsonb(temp_count));

  -- Delete client invitations
  DELETE FROM client_invitations WHERE professional_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{client_invitations}', to_jsonb(temp_count));

  -- Delete client profiles
  DELETE FROM client_profiles WHERE professional_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{client_profiles}', to_jsonb(temp_count));

  -- Delete clients
  DELETE FROM clients WHERE professional_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{clients}', to_jsonb(temp_count));

  -- Delete contacts owned by the user
  DELETE FROM contacts WHERE owner_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{contacts}', to_jsonb(temp_count));

  -- Step 5: Handle user profiles and roles
  DELETE FROM user_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{user_profiles}', to_jsonb(temp_count));

  DELETE FROM user_roles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{user_roles}', to_jsonb(temp_count));

  -- Handle users_profile if it exists (different from user_profiles)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_profile') THEN
    EXECUTE 'DELETE FROM users_profile WHERE id = $1' USING target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_counts := jsonb_set(deleted_counts, '{users_profile}', to_jsonb(temp_count));
  END IF;

  DELETE FROM professionals WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{professionals}', to_jsonb(temp_count));

  -- Step 6: Finally delete the user from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{auth_users}', to_jsonb(temp_count));

  -- Set the final result
  result := jsonb_set(result, '{deleted_records}', deleted_counts);
  result := jsonb_set(result, '{message}', to_jsonb('User and all related data successfully deleted'));

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Error occurred during user deletion',
    'deleted_records', deleted_counts
  );
END;
$$;